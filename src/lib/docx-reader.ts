import { unzipSync, strFromU8 } from 'fflate';

/** Экранирование текста, попадающего в разметку документа */
const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/** Файл — это ZIP-архив? .docx внутри всегда начинается с «PK» */
export const isZip = (bytes: Uint8Array) =>
  bytes.length > 4 &&
  bytes[0] === 0x50 &&
  bytes[1] === 0x4b &&
  (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07);

/** Полутвипы Word в пункты: 28 → 14 пт */
const halfPointsToPt = (raw: string): number => Number(raw) / 2;

/**
 * Шрифт с запасным вариантом: если такого шрифта в системе нет,
 * подставится похожий, а не случайный.
 */
const fontStack = (name: string): string => {
  const serif =
    /times|georgia|cambria|garamond|book|minion|pt serif|liberation serif/i.test(
      name,
    );

  const mono = /courier|consolas|mono/i.test(name);

  const fallback = mono ? 'monospace' : serif ? 'serif' : 'sans-serif';

  return `'${name}', ${fallback}`;
};

/** Твипы Word в сантиметры: 709 → 1,25 см */
const twipsToCm = (raw: string): number => Number(raw) / 567;

/** Число без длинного хвоста после запятой */
const trim = (v: number): string => String(Math.round(v * 100) / 100);

/** Тип картинки по расширению файла внутри документа */
const mimeOf = (name: string): string | null => {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';

  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'bmp') return 'image/bmp';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'svg') return 'image/svg+xml';

  /* wmf, emf и прочие форматы Word браузер показать не умеет */
  return null;
};

/** Двоичные данные картинки в строку для атрибута src */
const toBase64 = (bytes: Uint8Array): string => {
  let binary = '';

  /* по частям: у больших картинок аргументов слишком много для одного вызова */
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    binary += String.fromCharCode(...bytes.subarray(i, i + step));
  }

  return btoa(binary);
};

/** Английские метры Word в точки экрана: 914400 на дюйм */
const emuToPx = (raw: string): number => Math.round((Number(raw) / 914400) * 96);

/** Картинка внутри участка текста */
const imageHtml = (
  run: string,
  images?: Map<string, string>,
): string => {
  if (!images?.size) return '';

  /* современный формат и старый VML времён Word 2003 */
  const id =
    run.match(/<a:blip[^>]*r:embed="([^"]+)"/)?.[1] ??
    run.match(/<v:imagedata[^>]*r:id="([^"]+)"/)?.[1];

  if (!id) return '';

  const src = images.get(id);
  if (!src) return '';

  /* размер, заданный в документе */
  const ext = run.match(/<wp:extent[^>]*cx="(\d+)"[^>]*cy="(\d+)"/);
  const size = ext
    ? ` width="${emuToPx(ext[1])}" height="${emuToPx(ext[2])}"`
    : '';

  const alt =
    run.match(/<wp:docPr[^>]*descr="([^"]*)"/)?.[1] ??
    run.match(/<wp:docPr[^>]*name="([^"]*)"/)?.[1] ??
    '';

  return `<img src="${src}" alt="${esc(alt)}"${size} style="max-width:100%">`;
};

/** Оформление одного участка текста: жирный, курсив и прочее */
const runToHtml = (run: string, images?: Map<string, string>): string => {
  const texts = [...run.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)]
    .map((m) => m[1])
    .join('');

  const breaks = /<w:br\b/.test(run) ? '<br>' : '';
  const tabs = [...run.matchAll(/<w:tab\/>/g)].map(() => '\u00a0\u00a0\u00a0\u00a0').join('');
  const picture = imageHtml(run, images);

  if (!texts && !breaks && !tabs && !picture) return '';

  /* картинку не оборачиваем в оформление текста */
  if (picture && !texts) return picture;

  let html = esc(texts) + tabs + breaks;
  const props = run.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/)?.[1] ?? '';

  if (/<w:b\b(?![^>]*w:val="(?:0|false)")/.test(props)) html = `<strong>${html}</strong>`;
  if (/<w:i\b(?![^>]*w:val="(?:0|false)")/.test(props)) html = `<em>${html}</em>`;
  if (/<w:u\b(?![^>]*w:val="none")/.test(props)) html = `<u>${html}</u>`;
  if (/<w:strike\b/.test(props)) html = `<s>${html}</s>`;
  if (/w:val="superscript"/.test(props)) html = `<sup>${html}</sup>`;
  if (/w:val="subscript"/.test(props)) html = `<sub>${html}</sub>`;

  /*
   * Цвет держим даже если он чёрный: в заголовках редактор красит
   * текст синим, и без явного цвета документ выглядел бы иначе.
   */
  const color = props.match(/<w:color[^>]*w:val="([0-9A-Fa-f]{6})"/)?.[1];
  if (color) html = `<span style="color:#${color}">${html}</span>`;

  const hl = props.match(/<w:highlight[^>]*w:val="(\w+)"/)?.[1];
  if (hl && hl !== 'none')
    html = `<span style="background-color:${hl}">${html}</span>`;

  /* шрифт и размер — без них документ выглядит не так, как в Word */
  const css: string[] = [];

  const font =
    props.match(/<w:rFonts[^>]*w:ascii="([^"]+)"/)?.[1] ??
    props.match(/<w:rFonts[^>]*w:hAnsi="([^"]+)"/)?.[1];

  if (font) css.push(`font-family:${fontStack(font)}`);

  /* Word может задать размер дважды — верное значение последнее */
  const sizes = [...props.matchAll(/<w:sz[^>]*w:val="(\d+)"/g)];
  const size = sizes[sizes.length - 1]?.[1];
  if (size) css.push(`font-size:${trim(halfPointsToPt(size))}pt`);

  /* разрядка: Word хранит её в двадцатых долях пункта */
  const spacing = props.match(/<w:spacing[^>]*w:val="(-?\d+)"/)?.[1];
  if (spacing && Number(spacing) !== 0)
    css.push(`letter-spacing:${trim(Number(spacing) / 20)}pt`);

  if (/<w:caps\b(?![^>]*w:val="(?:0|false)")/.test(props))
    css.push('text-transform:uppercase');

  if (css.length) html = `<span style="${css.join(';')}">${html}</span>`;

  return picture + html;
};

/**
 * Разбирает описание списков документа: какой номер списка
 * означает нумерацию, а какой — маркеры.
 */
const parseNumbering = (xml: string): Map<string, boolean> => {
  /* сначала запоминаем формат каждого описания списка */
  const abstract = new Map<string, boolean>();
  for (const m of xml.matchAll(
    /<w:abstractNum[^>]*w:abstractNumId="(\d+)"[\s\S]*?<\/w:abstractNum>/g,
  )) {
    const first = m[0].match(/<w:lvl\b[\s\S]*?<\/w:lvl>/)?.[0] ?? '';
    const fmt = first.match(/<w:numFmt[^>]*w:val="(\w+)"/)?.[1] ?? 'bullet';
    abstract.set(m[1], fmt !== 'bullet' && fmt !== 'none');
  }

  /* затем связываем с номерами, которыми помечены абзацы */
  const result = new Map<string, boolean>();
  for (const m of xml.matchAll(
    /<w:num\s[^>]*w:numId="(\d+)"[^>]*>([\s\S]*?)<\/w:num>/g,
  )) {
    const ref = m[2].match(/<w:abstractNumId[^>]*w:val="(\d+)"/)?.[1];
    if (ref !== undefined) result.set(m[1], abstract.get(ref) ?? false);
  }

  return result;
};

/** Основное оформление документа: шрифт и размер по умолчанию */
export interface StyleInfo {
  font?: string;
  size?: string;
  /** Оформление абзаца в виде готовых свойств */
  css: string;
  /** Стиль-родитель, от которого унаследовано оформление */
  basedOn?: string;
}

/** Основное оформление документа: шрифт, размер и вид абзаца */
export interface DocDefaults {
  font?: string;
  size?: string;
  /** Оформление абзаца по умолчанию для всего документа */
  css?: string;
  /** Оформление именованных стилей: Обычный, Заголовок и прочие */
  styles: Map<string, StyleInfo>;
  /** Стиль, который Word применяет к абзацам без явного стиля */
  defaultStyle?: string;
}

/**
 * Склеивает свойства оформления: то, что идёт позже, побеждает.
 * Word так же накладывает оформление стиля поверх унаследованного.
 */
const mergeCss = (...parts: (string | undefined)[]): string => {
  const map = new Map<string, string>();

  for (const part of parts) {
    if (!part) continue;

    for (const rule of part.split(';')) {
      const colon = rule.indexOf(':');
      if (colon < 1) continue;

      map.set(rule.slice(0, colon).trim(), rule.slice(colon + 1).trim());
    }
  }

  return [...map].map(([k, v]) => `${k}:${v}`).join(';');
};

/** Читает styles.xml — оттуда берётся оформление всего документа */
const parseStyles = (xml: string): DocDefaults => {
  const defaults: DocDefaults = { styles: new Map() };

  const docDefaults = xml.match(
    /<w:docDefaults>([\s\S]*?)<\/w:docDefaults>/,
  )?.[1];

  if (docDefaults) {
    defaults.font =
      docDefaults.match(/<w:rFonts[^>]*w:ascii="([^"]+)"/)?.[1] ?? undefined;

    defaults.size =
      docDefaults.match(/<w:sz[^>]*w:val="(\d+)"/)?.[1] ?? undefined;

    /* вид абзаца по умолчанию: интервалы и выравнивание */
    const pPrDefault = docDefaults.match(
      /<w:pPrDefault>([\s\S]*?)<\/w:pPrDefault>/,
    )?.[1];

    if (pPrDefault) defaults.css = paraCss(pPrDefault);
  }

  /* оформление именованных стилей — на них ссылаются абзацы */
  for (const m of xml.matchAll(
    /<w:style\b([^>]*)>([\s\S]*?)<\/w:style>/g,
  )) {
    const head = m[1];
    const body = m[2];

    const id = head.match(/w:styleId="([^"]+)"/)?.[1];
    if (!id) continue;

    const rPr = body.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/)?.[1] ?? '';
    const pPr = body.match(/<w:pPr>([\s\S]*?)<\/w:pPr>/)?.[1] ?? '';

    /* Word помечает так стиль, применяемый к обычным абзацам */
    if (
      /w:default="(?:1|true)"/.test(head) &&
      /w:type="paragraph"/.test(head)
    ) {
      defaults.defaultStyle = id;
    }

    defaults.styles.set(id, {
      font: rPr.match(/<w:rFonts[^>]*w:ascii="([^"]+)"/)?.[1],
      size: rPr.match(/<w:sz[^>]*w:val="(\d+)"/)?.[1],
      css: paraCss(pPr),
      basedOn: body.match(/<w:basedOn[^>]*w:val="([^"]+)"/)?.[1],
    });
  }

  return defaults;
};

/**
 * Собирает итоговое оформление стиля вместе с унаследованным
 * от стилей-родителей.
 */
const resolveStyle = (
  id: string | undefined,
  defaults: DocDefaults | undefined,
): StyleInfo => {
  const empty: StyleInfo = { css: '' };
  if (!id || !defaults) return empty;

  /* цепочка от дальнего предка к самому стилю */
  const chain: StyleInfo[] = [];
  const seen = new Set<string>();

  let current: string | undefined = id;

  while (current && !seen.has(current)) {
    seen.add(current);

    const info = defaults.styles.get(current);
    if (!info) break;

    chain.unshift(info);
    current = info.basedOn;
  }

  if (!chain.length) return empty;

  return {
    css: mergeCss(...chain.map((s) => s.css)),
    font: [...chain].reverse().find((s) => s.font)?.font,
    size: [...chain].reverse().find((s) => s.size)?.size,
  };
};

/** Абзац: заголовок, элемент списка или обычный текст */
const paraToHtml = (
  para: string,
  numbering?: Map<string, boolean>,
  defaults?: DocDefaults,
  images?: Map<string, string>,
): string => {
  const inner = [...para.matchAll(/<w:r(?:\s[^>]*)?>([\s\S]*?)<\/w:r>/g)]
    .map((m) => runToHtml(m[1], images))
    .join('');

  const props = para.match(/<w:pPr>([\s\S]*?)<\/w:pPr>/)?.[1] ?? '';
  const style = props.match(/<w:pStyle[^>]*w:val="([^"]*)"/)?.[1] ?? '';

  /* список задаётся либо нумерацией, либо стилем «Список» */
  const isList =
    /<w:numPr>/.test(props) ||
    /^(?:List(?:Paragraph|Bullet|Number)|Abzacspiska|Spisok)/i.test(style);

  if (isList) {
    const numId = props.match(/<w:numId[^>]*w:val="(\d+)"/)?.[1];
    const level = Number(props.match(/<w:ilvl[^>]*w:val="(\d+)"/)?.[1] ?? 0);

    /* формат берём из описания списка, а если его нет — из названия стиля */
    const ordered =
      (numId !== undefined ? numbering?.get(numId) : undefined) ??
      /Number/i.test(style);

    return `<li data-ordered="${ordered}" data-level="${level}">${inner || '&nbsp;'}</li>`;
  }

  /*
   * Порядок как в Word: общий вид документа, затем стиль абзаца
   * (вместе с унаследованным), и сверху — оформление самого абзаца.
   */
  const applied = style || defaults?.defaultStyle;
  const fromStyle = resolveStyle(applied, defaults);

  const own = paraCss(props);

  /* шрифт и размер стиля важнее общих: их Word показывает в тексте */
  const face: string[] = [];
  if (fromStyle.font) face.push(`font-family:${fontStack(fromStyle.font)}`);
  if (fromStyle.size)
    face.push(`font-size:${trim(halfPointsToPt(fromStyle.size))}pt`);

  const css = mergeCss(defaults?.css, fromStyle.css, face.join(';'), own);
  const styleAttr = css ? ` style="${css}"` : '';

  /* заголовки сохраняют выравнивание и отступы, заданные в документе */
  const heading = style.match(/^(?:Heading|Za?golovok|.*?)(\d)$/i)?.[1];
  if (/heading|zagolovok|заголовок/i.test(style) && heading) {
    const level = Math.min(3, Number(heading));
    return `<h${level}${styleAttr}>${inner || '&nbsp;'}</h${level}>`;
  }
  if (/^Title$/i.test(style))
    return `<h1${styleAttr}>${inner || '&nbsp;'}</h1>`;

  if (!inner) return `<p${styleAttr}><br></p>`;
  return `<p${styleAttr}>${inner}</p>`;
};

/** Оформление абзаца: выравнивание, отступы и интервалы */
const paraCss = (props: string): string => {
  const css: string[] = [];

  const align = props.match(/<w:jc[^>]*w:val="(\w+)"/)?.[1];
  if (align === 'center') css.push('text-align:center');
  else if (align === 'right') css.push('text-align:right');
  else if (align === 'both') css.push('text-align:justify');

  /* отступы абзаца */
  const ind = props.match(/<w:ind\b[^>]*\/?>/)?.[0] ?? '';

  const left = ind.match(/w:left="(-?\d+)"/)?.[1];
  if (left && Number(left) !== 0)
    css.push(`margin-left:${trim(twipsToCm(left))}cm`);

  const right = ind.match(/w:right="(-?\d+)"/)?.[1];
  if (right && Number(right) !== 0)
    css.push(`margin-right:${trim(twipsToCm(right))}cm`);

  /* красная строка либо выступ */
  const firstLine = ind.match(/w:firstLine="(\d+)"/)?.[1];
  const hanging = ind.match(/w:hanging="(\d+)"/)?.[1];

  if (hanging && Number(hanging) !== 0)
    css.push(`text-indent:-${trim(twipsToCm(hanging))}cm`);
  else if (firstLine && Number(firstLine) !== 0)
    css.push(`text-indent:${trim(twipsToCm(firstLine))}cm`);

  /* интервалы до и после абзаца */
  const sp = props.match(/<w:spacing\b[^>]*\/?>/)?.[0] ?? '';

  const before = sp.match(/w:before="(\d+)"/)?.[1];
  if (before !== undefined)
    css.push(`margin-top:${trim(Number(before) / 20)}pt`);

  const after = sp.match(/w:after="(\d+)"/)?.[1];
  if (after !== undefined)
    css.push(`margin-bottom:${trim(Number(after) / 20)}pt`);

  /* междустрочный интервал */
  const line = sp.match(/w:line="(\d+)"/)?.[1];
  const rule = sp.match(/w:lineRule="(\w+)"/)?.[1];

  if (line) {
    if (rule === 'exact' || rule === 'atLeast') {
      css.push(`line-height:${trim(Number(line) / 20)}pt`);
    } else {
      /* auto: 240 двадцатых долей — это одинарный интервал */
      css.push(`line-height:${trim(Number(line) / 240)}`);
    }
  }

  return css.join(';');
};

/** Таблица документа */
const tableToHtml = (
  table: string,
  numbering?: Map<string, boolean>,
  defaults?: DocDefaults,
  images?: Map<string, string>,
): string => {
  const rows = [...table.matchAll(/<w:tr(?:\s[^>]*)?>([\s\S]*?)<\/w:tr>/g)];
  if (!rows.length) return '';

  const body = rows
    .map((r) => {
      const cells = [...r[1].matchAll(/<w:tc(?:\s[^>]*)?>([\s\S]*?)<\/w:tc>/g)]
        .map((c) => {
          const paras = [...c[1].matchAll(/<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>/g)]
            .map((p) => paraToHtml(p[1], numbering, defaults, images));

          /* один абзац в ячейке показываем без обёртки — как в Word */
          const text =
            paras.length === 1
              ? paras[0].replace(/^<p[^>]*>|<\/p>$/g, '')
              : paras.join('');

          return `<td>${text.trim() || '&nbsp;'}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  /* первая строка помечена как заголовочная — показываем её шапкой */
  if (/<w:tblHeader\b/.test(rows[0][1]) || /<w:b\/>/.test(rows[0][1])) {
    const head = body.match(/<tr>[\s\S]*?<\/tr>/)?.[0] ?? '';
    const rest = body.slice(head.length);
    return `<table><thead>${head.replace(/<td>/g, '<th>').replace(/<\/td>/g, '</th>')}</thead><tbody>${rest}</tbody></table>`;
  }

  return `<table>${body}</table>`;
};

/**
 * Собирает подряд идущие пункты в списки. Маркированные и нумерованные
 * не смешиваются: при смене вида начинается новый список.
 */
const wrapLists = (html: string) =>
  html.replace(
    /(?:<li data-ordered="(?:true|false)" data-level="\d+">[\s\S]*?<\/li>)+/g,
    (chunk) => {
      const items = [
        ...chunk.matchAll(
          /<li data-ordered="(true|false)" data-level="(\d+)">([\s\S]*?)<\/li>/g,
        ),
      ];

      const groups: { ordered: boolean; items: string[] }[] = [];
      items.forEach((it) => {
        const ordered = it[1] === 'true';
        const last = groups[groups.length - 1];
        if (last && last.ordered === ordered) last.items.push(it[3]);
        else groups.push({ ordered, items: [it[3]] });
      });

      return groups
        .map((g) => {
          const tag = g.ordered ? 'ol' : 'ul';
          return `<${tag}>${g.items.map((i) => `<li>${i}</li>`).join('')}</${tag}>`;
        })
        .join('');
    },
  );

/** Что удалось прочитать из файла помимо самого текста */
export interface DocxExtras {
  headerText: string;
  footerText: string;
  headerAlign: 'left' | 'center' | 'right';
  footerAlign: 'left' | 'center' | 'right';
  differentFirst: boolean;
  /** Где стоит номер страницы */
  numberPosition:
    | 'none'
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  numberStart: number;
  /** Размер листа и поля, в сантиметрах */
  paperWidth?: number;
  paperHeight?: number;
  landscape?: boolean;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  gutter?: number;
  /** Число колонок и промежуток между ними */
  columns?: number;
  columnGap?: number;
}

/** Выравнивание абзаца колонтитула */
const alignOf = (xml: string): 'left' | 'center' | 'right' => {
  const jc = xml.match(/<w:jc[^>]*w:val="(\w+)"/)?.[1];
  if (jc === 'center') return 'center';
  if (jc === 'right' || jc === 'end') return 'right';
  return 'left';
};

/**
 * Текст колонтитула без служебных полей. Поле с номером страницы
 * заменяем нашей пометкой — редактор подставит настоящий номер.
 */
const furnitureText = (xml: string): { text: string; hasNumber: boolean } => {
  const hasNumber = /\bPAGE\b/.test(xml) && !/NUMPAGES/.test(xml);

  /*
   * Внутри поля с номером Word держит показанное значение — обычно
   * это цифра. В текст колонтитула она попадать не должна: номер
   * подставит редактор.
   */
  const clean = hasNumber
    ? xml.replace(
        /<w:fldChar[^>]*w:fldCharType="begin"[\s\S]*?<w:fldChar[^>]*w:fldCharType="end"[^>]*\/>/g,
        '',
      )
    : xml;

  const text = [...clean.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)]
    .map((m) => m[1])
    .join('')
    .replace(/\s+/g, ' ')
    .trim();

  return { text, hasNumber };
};

/**
 * Читает колонтитулы, нумерацию страниц и параметры листа.
 * Возвращает null, если файл не открывается.
 */
export const docxExtras = (bytes: Uint8Array): DocxExtras | null => {
  let files: Record<string, Uint8Array>;

  try {
    files = unzipSync(bytes, {
      filter: (f) =>
        f.name === 'word/document.xml' ||
        f.name === 'word/_rels/document.xml.rels' ||
        /^word\/(header|footer)\d*\.xml$/.test(f.name),
    });
  } catch {
    return null;
  }

  const doc = files['word/document.xml'];
  if (!doc) return null;

  const xml = strFromU8(doc);

  const out: DocxExtras = {
    headerText: '',
    footerText: '',
    headerAlign: 'center',
    footerAlign: 'center',
    differentFirst: false,
    numberPosition: 'none',
    numberStart: 1,
  };

  /* последний раздел документа задаёт вид страницы */
  const sect = [...xml.matchAll(/<w:sectPr\b[\s\S]*?<\/w:sectPr>/g)].pop()?.[0];
  if (!sect) return out;

  out.differentFirst = /<w:titlePg\b/.test(sect);

  /* размер листа */
  const pgSz = sect.match(/<w:pgSz\b[^>]*\/?>/)?.[0] ?? '';
  const w = pgSz.match(/w:w="(\d+)"/)?.[1];
  const h = pgSz.match(/w:h="(\d+)"/)?.[1];
  const landscape = /w:orient="landscape"/.test(pgSz);

  if (w && h) {
    const cmW = twipsToCm(w);
    const cmH = twipsToCm(h);

    /* в альбомной ориентации Word пишет уже перевёрнутые размеры */
    out.landscape = landscape;
    out.paperWidth = landscape ? Math.min(cmW, cmH) : cmW;
    out.paperHeight = landscape ? Math.max(cmW, cmH) : cmH;
  }

  /* поля страницы */
  const pgMar = sect.match(/<w:pgMar\b[^>]*\/?>/)?.[0] ?? '';
  const mar = (name: string) => {
    const v = pgMar.match(new RegExp(`w:${name}="(-?\\d+)"`))?.[1];
    return v === undefined ? undefined : Math.max(0, twipsToCm(v));
  };

  out.marginTop = mar('top');
  out.marginBottom = mar('bottom');
  out.marginLeft = mar('left');
  out.marginRight = mar('right');
  out.gutter = mar('gutter');

  /* колонки */
  const cols = sect.match(/<w:cols\b[^>]*\/?>/)?.[0] ?? '';
  const num = cols.match(/w:num="(\d+)"/)?.[1];
  const space = cols.match(/w:space="(\d+)"/)?.[1];

  if (num) out.columns = Math.max(1, Number(num));
  if (space) out.columnGap = twipsToCm(space);

  /* с какого номера начинается нумерация */
  const start = sect.match(/<w:pgNumType[^>]*w:start="(\d+)"/)?.[1];
  if (start) out.numberStart = Number(start);

  /* связь ссылок раздела с файлами колонтитулов */
  const rels = files['word/_rels/document.xml.rels']
    ? strFromU8(files['word/_rels/document.xml.rels'])
    : '';

  const fileById = new Map<string, string>();
  for (const m of rels.matchAll(
    /<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g,
  )) {
    fileById.set(m[1], `word/${m[2].replace(/^\/?word\//, '')}`);
  }

  const readPart = (kind: 'header' | 'footer') => {
    /* берём обычный колонтитул, а не тот, что только для первой страницы */
    const refs = [
      ...sect.matchAll(
        new RegExp(
          `<w:${kind}Reference[^>]*w:type="(\\w+)"[^>]*r:id="([^"]+)"`,
          'g',
        ),
      ),
    ];

    const ref =
      refs.find((r) => r[1] === 'default') ?? refs.find((r) => r[1] !== 'first');

    if (!ref) return null;

    const name = fileById.get(ref[2]);
    const part = name ? files[name] : undefined;
    if (!part) return null;

    const partXml = strFromU8(part);
    const { text, hasNumber } = furnitureText(partXml);

    return { text, hasNumber, align: alignOf(partXml) };
  };

  const header = readPart('header');
  const footer = readPart('footer');

  if (header) {
    out.headerText = header.text;
    out.headerAlign = header.align;

    if (header.hasNumber) {
      out.numberPosition = `top-${header.align}` as DocxExtras['numberPosition'];
      /* номер вставит редактор — одинокую цифру из текста убираем */
      out.headerText = header.text.replace(/^\s*\d+\s*$/, '').trim();
    }
  }

  if (footer) {
    out.footerText = footer.text;
    out.footerAlign = footer.align;

    if (footer.hasNumber) {
      out.numberPosition =
        `bottom-${footer.align}` as DocxExtras['numberPosition'];
      out.footerText = footer.text.replace(/^\s*\d+\s*$/, '').trim();
    }
  }

  return out;
};

/**
 * Собирает картинки документа: по ссылке из текста находим файл
 * в архиве и переводим его в строку, понятную браузеру.
 */
const collectImages = (
  files: Record<string, Uint8Array>,
): Map<string, string> => {
  const result = new Map<string, string>();

  const relsFile = files['word/_rels/document.xml.rels'];
  if (!relsFile) return result;

  const rels = strFromU8(relsFile);

  for (const m of rels.matchAll(
    /<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"[^>]*\/>/g,
  )) {
    const target = m[2];
    if (!/media\//.test(target)) continue;

    const name = `word/${target.replace(/^\/?word\//, '').replace(/^\.\.\//, '')}`;
    const bytes = files[name];
    if (!bytes) continue;

    const mime = mimeOf(name);
    /* формат, который браузер не покажет, пропускаем */
    if (!mime) continue;

    result.set(m[1], `data:${mime};base64,${toBase64(bytes)}`);
  }

  return result;
};

/**
 * Превращает содержимое .docx в разметку документа.
 * Возвращает null, если это не документ Word.
 */
export const docxToHtml = (bytes: Uint8Array): string | null => {
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(bytes, {
      filter: (f) =>
        f.name === 'word/document.xml' ||
        f.name === 'word/numbering.xml' ||
        f.name === 'word/styles.xml' ||
        f.name === 'word/_rels/document.xml.rels' ||
        f.name.startsWith('word/media/'),
    });
  } catch {
    return null;
  }

  const doc = files['word/document.xml'];
  if (!doc) return null;

  const numbering = files['word/numbering.xml']
    ? parseNumbering(strFromU8(files['word/numbering.xml']))
    : undefined;

  const defaults = files['word/styles.xml']
    ? parseStyles(strFromU8(files['word/styles.xml']))
    : undefined;

  const images = collectImages(files);

  const xml = strFromU8(doc);
  const body = xml.match(/<w:body>([\s\S]*?)<\/w:body>/)?.[1] ?? xml;

  /* абзацы и таблицы верхнего уровня — по порядку появления */
  const parts: string[] = [];
  const re = /<w:tbl>[\s\S]*?<\/w:tbl>|<w:p(?:\s[^>]*)?(?:\/>|>[\s\S]*?<\/w:p>)/g;

  for (const m of body.matchAll(re)) {
    const chunk = m[0];
    if (chunk.startsWith('<w:tbl')) {
      parts.push(tableToHtml(chunk, numbering, defaults, images));
    } else {
      const innerMatch = chunk.match(/<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>/);
      parts.push(
        innerMatch
          ? paraToHtml(innerMatch[1], numbering, defaults, images)
          : '<p><br></p>',
      );
    }
  }

  const html = wrapLists(parts.join(''));
  const body_html = html.trim() || '<p><br></p>';

  /*
   * Шрифт всего документа переносим в каждый абзац: общая обёртка
   * мешала бы делить и объединять абзацы при правке.
   */
  const base: string[] = [];
  if (defaults?.font) base.push(`font-family:${fontStack(defaults.font)}`);
  if (defaults?.size)
    base.push(`font-size:${trim(halfPointsToPt(defaults.size))}pt`);

  if (!base.length) return body_html;

  const prefix = base.join(';');

  /*
   * Общий шрифт — только запасной вариант: если у абзаца уже есть
   * свой шрифт или размер из стиля, они остаются главными.
   */
  return body_html.replace(
    /<(p|h[1-6]|li)(\s+style="([^"]*)")?([^>]*)>/g,
    (_all, tag, _attr, css, rest) =>
      `<${tag} style="${mergeCss(prefix, css)}"${rest}>`,
  );
};

/** Текст документа RTF без служебных команд */
export const rtfToHtml = (raw: string): string => {
  let text = raw
    .replace(/\\'([0-9a-f]{2})/gi, (_, h) =>
      String.fromCharCode(parseInt(h, 16)),
    )
    .replace(/\\u(-?\d+)\s?\??/g, (_, n) => String.fromCharCode(Number(n) & 0xffff))
    .replace(/\{\\\*[\s\S]*?\}/g, '')
    .replace(/\\par[d]?\b/g, '\n')
    .replace(/\\line\b/g, '\n')
    .replace(/\\[a-z]+-?\d*\s?/gi, '')
    .replace(/[{}]/g, '')
    .trim();

  text = text.replace(/\n{3,}/g, '\n\n');

  return text
    .split(/\n/)
    .map((line) => (line.trim() ? `<p>${esc(line.trim())}</p>` : ''))
    .join('') || '<p><br></p>';
};