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

/** Твипы Word в сантиметры: 709 → 1,25 см */
const twipsToCm = (raw: string): number => Number(raw) / 567;

/** Число без длинного хвоста после запятой */
const trim = (v: number): string => String(Math.round(v * 100) / 100);

/** Оформление одного участка текста: жирный, курсив и прочее */
const runToHtml = (run: string): string => {
  const texts = [...run.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)]
    .map((m) => m[1])
    .join('');

  const breaks = /<w:br\b/.test(run) ? '<br>' : '';
  const tabs = [...run.matchAll(/<w:tab\/>/g)].map(() => '\u00a0\u00a0\u00a0\u00a0').join('');

  if (!texts && !breaks && !tabs) return '';

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

  if (font) css.push(`font-family:'${font}'`);

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

  return html;
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
export interface DocDefaults {
  font?: string;
  size?: string;
  /** Оформление именованных стилей: Обычный, Заголовок и прочие */
  styles: Map<string, { font?: string; size?: string; css: string }>;
}

/** Читает styles.xml — оттуда берётся шрифт всего документа */
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
  }

  /* оформление именованных стилей — на них ссылаются абзацы */
  for (const m of xml.matchAll(
    /<w:style\b[^>]*w:styleId="([^"]+)"[^>]*>([\s\S]*?)<\/w:style>/g,
  )) {
    const body = m[2];

    const rPr = body.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/)?.[1] ?? '';
    const pPr = body.match(/<w:pPr>([\s\S]*?)<\/w:pPr>/)?.[1] ?? '';

    defaults.styles.set(m[1], {
      font: rPr.match(/<w:rFonts[^>]*w:ascii="([^"]+)"/)?.[1],
      size: rPr.match(/<w:sz[^>]*w:val="(\d+)"/)?.[1],
      css: paraCss(pPr),
    });
  }

  return defaults;
};

/** Абзац: заголовок, элемент списка или обычный текст */
const paraToHtml = (
  para: string,
  numbering?: Map<string, boolean>,
  defaults?: DocDefaults,
): string => {
  const inner = [...para.matchAll(/<w:r(?:\s[^>]*)?>([\s\S]*?)<\/w:r>/g)]
    .map((m) => runToHtml(m[1]))
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

  /* к своему оформлению абзаца добавляем то, что задано его стилем */
  const fromStyle = style ? defaults?.styles.get(style)?.css : '';
  const own = paraCss(props);

  const css = [fromStyle, own].filter(Boolean).join(';');
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
): string => {
  const rows = [...table.matchAll(/<w:tr(?:\s[^>]*)?>([\s\S]*?)<\/w:tr>/g)];
  if (!rows.length) return '';

  const body = rows
    .map((r) => {
      const cells = [...r[1].matchAll(/<w:tc(?:\s[^>]*)?>([\s\S]*?)<\/w:tc>/g)]
        .map((c) => {
          const paras = [...c[1].matchAll(/<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>/g)]
            .map((p) => paraToHtml(p[1], numbering, defaults));

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
        f.name === 'word/styles.xml',
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

  const xml = strFromU8(doc);
  const body = xml.match(/<w:body>([\s\S]*?)<\/w:body>/)?.[1] ?? xml;

  /* абзацы и таблицы верхнего уровня — по порядку появления */
  const parts: string[] = [];
  const re = /<w:tbl>[\s\S]*?<\/w:tbl>|<w:p(?:\s[^>]*)?(?:\/>|>[\s\S]*?<\/w:p>)/g;

  for (const m of body.matchAll(re)) {
    const chunk = m[0];
    if (chunk.startsWith('<w:tbl')) {
      parts.push(tableToHtml(chunk, numbering, defaults));
    } else {
      const innerMatch = chunk.match(/<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>/);
      parts.push(
        innerMatch ? paraToHtml(innerMatch[1], numbering, defaults) : '<p><br></p>',
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
  if (defaults?.font) base.push(`font-family:'${defaults.font}'`);
  if (defaults?.size)
    base.push(`font-size:${trim(halfPointsToPt(defaults.size))}pt`);

  if (!base.length) return body_html;

  const prefix = `${base.join(';')};`;

  return body_html.replace(
    /<(p|h[1-6]|li)(\s+style="([^"]*)")?([^>]*)>/g,
    (_all, tag, _attr, css, rest) =>
      `<${tag} style="${prefix}${css ?? ''}"${rest}>`,
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