import { zipSync, strToU8 } from 'fflate';

/** Экранирование текста для XML документа */
const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Оформление участка текста, накопленное по ходу разбора */
interface Fmt {
  b?: boolean;
  i?: boolean;
  u?: boolean;
  s?: boolean;
  sup?: boolean;
  sub?: boolean;
  color?: string;
  bg?: string;
  size?: number;
  font?: string;
}

/** Цвет из CSS в формат Word: шесть шестнадцатеричных цифр */
const toHex = (css: string): string | undefined => {
  const v = css.trim().toLowerCase();

  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hex) {
    const h = hex[1];
    return (h.length === 3 ? h.replace(/./g, (c) => c + c) : h).toUpperCase();
  }

  const rgb = v.match(/^rgba?\(([^)]+)\)/);
  if (rgb) {
    const [r, g, b] = rgb[1].split(',').map((n) => Number(n.trim()));
    if ([r, g, b].some(Number.isNaN)) return undefined;
    return [r, g, b]
      .map((n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  }

  const named: Record<string, string> = {
    black: '000000',
    white: 'FFFFFF',
    red: 'FF0000',
    green: '008000',
    blue: '0000FF',
    yellow: 'FFFF00',
    gray: '808080',
    grey: '808080',
    orange: 'FFA500',
    purple: '800080',
  };
  return named[v];
};

/** Размер шрифта в полупунктах — так его хранит Word */
const toHalfPoints = (css: string): number | undefined => {
  const px = css.match(/^([\d.]+)px$/);
  if (px) return Math.round((Number(px[1]) * 0.75) * 2);
  const pt = css.match(/^([\d.]+)pt$/);
  if (pt) return Math.round(Number(pt[1]) * 2);
  return undefined;
};

/** Разбирает атрибут style элемента и дополняет оформление */
const applyStyle = (el: Element, fmt: Fmt): Fmt => {
  const st = (el as HTMLElement).style;
  const next = { ...fmt };

  if (st.fontWeight === 'bold' || Number(st.fontWeight) >= 600) next.b = true;
  if (st.fontStyle === 'italic') next.i = true;
  if (st.textDecoration?.includes('underline')) next.u = true;
  if (st.textDecoration?.includes('line-through')) next.s = true;

  if (st.color) next.color = toHex(st.color) ?? next.color;
  if (st.backgroundColor) next.bg = toHex(st.backgroundColor) ?? next.bg;
  if (st.fontSize) next.size = toHalfPoints(st.fontSize) ?? next.size;
  if (st.fontFamily)
    next.font = st.fontFamily.replace(/["']/g, '').split(',')[0].trim();

  /* устаревший атрибут color у тега font — его ставит редактор */
  const legacy = el.getAttribute('color');
  if (legacy) next.color = toHex(legacy) ?? next.color;
  const face = el.getAttribute('face');
  if (face) next.font = face.split(',')[0].trim();

  return next;
};

/** Свойства оформления одного участка текста */
const rPr = (f: Fmt): string => {
  const p: string[] = [];
  if (f.font) p.push(`<w:rFonts w:ascii="${esc(f.font)}" w:hAnsi="${esc(f.font)}"/>`);
  if (f.b) p.push('<w:b/>');
  if (f.i) p.push('<w:i/>');
  if (f.u) p.push('<w:u w:val="single"/>');
  if (f.s) p.push('<w:strike/>');
  if (f.color) p.push(`<w:color w:val="${f.color}"/>`);
  if (f.bg) p.push(`<w:shd w:val="clear" w:fill="${f.bg}"/>`);
  if (f.size) p.push(`<w:sz w:val="${f.size}"/><w:szCs w:val="${f.size}"/>`);
  if (f.sup) p.push('<w:vertAlign w:val="superscript"/>');
  if (f.sub) p.push('<w:vertAlign w:val="subscript"/>');
  return p.length ? `<w:rPr>${p.join('')}</w:rPr>` : '';
};

/** Участок текста с сохранением пробелов */
const run = (text: string, f: Fmt): string => {
  if (!text) return '';
  return `<w:r>${rPr(f)}<w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
};

const BLOCK = new Set([
  'P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'UL', 'OL', 'LI', 'TABLE', 'TR', 'TD', 'TH',
  'BLOCKQUOTE', 'PRE', 'HR', 'THEAD', 'TBODY',
]);

/** Собирает участки текста внутри абзаца, включая вложенное оформление */
const collectRuns = (node: Node, fmt: Fmt): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent ?? '').replace(/\s+/g, ' ');
    return run(text, fmt);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const el = node as Element;
  const tag = el.tagName;

  if (tag === 'BR') return '<w:r><w:br/></w:r>';
  if (tag === 'IMG') return '';

  /* переход к позиции табуляции — символ табуляции Word */
  if ((el as HTMLElement).classList?.contains('pv-tab')) {
    return '<w:r><w:tab/></w:r>';
  }

  let next = applyStyle(el, fmt);
  if (tag === 'B' || tag === 'STRONG') next = { ...next, b: true };
  if (tag === 'I' || tag === 'EM') next = { ...next, i: true };
  if (tag === 'U') next = { ...next, u: true };
  if (tag === 'S' || tag === 'STRIKE' || tag === 'DEL') next = { ...next, s: true };
  if (tag === 'SUP') next = { ...next, sup: true };
  if (tag === 'SUB') next = { ...next, sub: true };
  if (tag === 'MARK') next = { ...next, bg: next.bg ?? 'FFFF00' };

  return [...el.childNodes].map((c) => collectRuns(c, next)).join('');
};

/** Свойства абзаца: стиль, выравнивание, уровень списка */
/** Позиции табуляции абзаца в терминах Word (в двадцатых долях пункта) */
const tabsOf = (el: Element): string => {
  const raw = el.getAttribute?.('data-tabs');
  if (!raw) return '';

  try {
    const stops = JSON.parse(raw) as {
      position: number;
      align: string;
      leader: string;
    }[];

    if (!Array.isArray(stops) || !stops.length) return '';

    const WORD_ALIGN: Record<string, string> = {
      left: 'left',
      center: 'center',
      right: 'right',
      decimal: 'decimal',
      bar: 'bar',
    };

    const WORD_LEADER: Record<string, string> = {
      none: 'none',
      dots: 'dot',
      dashes: 'hyphen',
      line: 'underscore',
    };

    const items = stops
      .map((t) => {
        /* сантиметры переводим в twip: 1 см = 567 twip */
        const pos = Math.round(t.position * 567);
        return (
          `<w:tab w:val="${WORD_ALIGN[t.align] ?? 'left'}" ` +
          `w:leader="${WORD_LEADER[t.leader] ?? 'none'}" w:pos="${pos}"/>`
        );
      })
      .join('');

    return `<w:tabs>${items}</w:tabs>`;
  } catch {
    return '';
  }
};

const pPr = (opts: {
  style?: string;
  align?: string;
  numId?: number;
  level?: number;
  tabs?: string;
}): string => {
  const p: string[] = [];
  if (opts.style) p.push(`<w:pStyle w:val="${opts.style}"/>`);
  if (opts.numId !== undefined)
    p.push(
      `<w:numPr><w:ilvl w:val="${opts.level ?? 0}"/><w:numId w:val="${opts.numId}"/></w:numPr>`,
    );
  if (opts.tabs) p.push(opts.tabs);
  if (opts.align) p.push(`<w:jc w:val="${opts.align}"/>`);
  return p.length ? `<w:pPr>${p.join('')}</w:pPr>` : '';
};

/** Выравнивание элемента в терминах Word */
const alignOf = (el: Element): string | undefined => {
  const a = (el as HTMLElement).style.textAlign || el.getAttribute('align') || '';
  if (a === 'center') return 'center';
  if (a === 'right') return 'right';
  if (a === 'justify') return 'both';
  return undefined;
};

const EMPTY_PARA = '<w:p/>';

/** Преобразует содержимое редактора в тело документа Word */
const bodyFromHtml = (root: Element): string => {
  const out: string[] = [];

  const walkBlock = (el: Element, listCtx?: { numId: number; level: number }) => {
    const tag = el.tagName;

    if (tag === 'HR') {
      out.push(
        '<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="999999"/></w:pBdr></w:pPr></w:p>',
      );
      return;
    }

    if (tag === 'TABLE') {
      out.push(tableXml(el));
      return;
    }

    if (tag === 'UL' || tag === 'OL') {
      const numId = tag === 'OL' ? 2 : 1;
      const level = listCtx ? Math.min(8, listCtx.level + 1) : 0;
      [...el.children].forEach((li) => {
        if (li.tagName === 'LI') walkBlock(li, { numId, level });
        else walkBlock(li, listCtx);
      });
      return;
    }

    if (tag === 'LI') {
      const nested = [...el.children].filter(
        (c) => c.tagName === 'UL' || c.tagName === 'OL',
      );
      const clone = el.cloneNode(true) as Element;
      [...clone.children]
        .filter((c) => c.tagName === 'UL' || c.tagName === 'OL')
        .forEach((c) => c.remove());

      const runs = [...clone.childNodes].map((c) => collectRuns(c, {})).join('');
      out.push(
        `<w:p>${pPr({
          style: 'ListParagraph',
          numId: listCtx?.numId ?? 1,
          level: listCtx?.level ?? 0,
        })}${runs}</w:p>`,
      );

      nested.forEach((n) => walkBlock(n, listCtx));
      return;
    }

    /* контейнер без собственного текста — идём внутрь */
    if (
      (tag === 'DIV' || tag === 'BLOCKQUOTE') &&
      [...el.children].some((c) => BLOCK.has(c.tagName))
    ) {
      [...el.children].forEach((c) => walkBlock(c, listCtx));
      return;
    }

    /* уровень заголовка берём из применённого стиля, иначе из тега */
    const level = Number(el.getAttribute('data-level'));
    const heading = level || Number(tag.match(/^H([1-6])$/)?.[1] ?? 0);

    const style = heading
      ? `Heading${Math.min(3, heading)}`
      : tag === 'BLOCKQUOTE'
        ? 'Quote'
        : undefined;

    const runs = [...el.childNodes].map((c) => collectRuns(c, {})).join('');
    if (!runs) {
      out.push(EMPTY_PARA);
      return;
    }

    out.push(
      `<w:p>${pPr({ style, align: alignOf(el), tabs: tabsOf(el) })}${runs}</w:p>`,
    );
  };

  /** Таблица со рамками и шапкой */
  const tableXml = (table: Element): string => {
    const rows = [...table.querySelectorAll('tr')];
    if (!rows.length) return EMPTY_PARA;

    const cols = Math.max(...rows.map((r) => r.children.length), 1);
    const width = Math.floor(9360 / cols);

    const grid = `<w:tblGrid>${Array.from({ length: cols })
      .map(() => `<w:gridCol w:w="${width}"/>`)
      .join('')}</w:tblGrid>`;

    const borders =
      '<w:tblBorders>' +
      ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']
        .map((s) => `<w:${s} w:val="single" w:sz="4" w:color="999999"/>`)
        .join('') +
      '</w:tblBorders>';

    const props =
      `<w:tblPr><w:tblStyle w:val="TableGrid"/>` +
      `<w:tblW w:w="5000" w:type="pct"/>${borders}</w:tblPr>`;

    const body = rows
      .map((tr) => {
        const isHead =
          tr.parentElement?.tagName === 'THEAD' ||
          [...tr.children].every((c) => c.tagName === 'TH');

        const cells = [...tr.children]
          .map((td) => {
            const bold = td.tagName === 'TH';
            const runs =
              [...td.childNodes]
                .map((c) => collectRuns(c, bold ? { b: true } : {}))
                .join('') || run('', {});

            /* заливку берём из самой ячейки, иначе красим шапку */
            const own = (td as HTMLElement).style?.backgroundColor;
            const fill = own ? toHex(own) : isHead ? 'EFEFEF' : '';
            const shade = fill
              ? `<w:shd w:val="clear" w:fill="${fill}"/>`
              : '';

            /* объединённые ячейки */
            const colSpan = Number((td as HTMLTableCellElement).colSpan) || 1;
            const rowSpan = Number((td as HTMLTableCellElement).rowSpan) || 1;
            const span = colSpan > 1 ? `<w:gridSpan w:val="${colSpan}"/>` : '';
            const vMerge = rowSpan > 1 ? '<w:vMerge w:val="restart"/>' : '';

            const vAlign =
              (td as HTMLElement).style?.verticalAlign === 'top'
                ? 'top'
                : (td as HTMLElement).style?.verticalAlign === 'bottom'
                  ? 'bottom'
                  : 'center';

            return (
              `<w:tc><w:tcPr><w:tcW w:w="${width * colSpan}" w:type="dxa"/>` +
              `${span}${vMerge}${shade}` +
              `<w:vAlign w:val="${vAlign}"/></w:tcPr>` +
              `<w:p>${pPr({ align: alignOf(td) })}${runs}</w:p></w:tc>`
            );
          })
          .join('');

        const head = isHead
          ? '<w:trPr><w:tblHeader/></w:trPr>'
          : '';

        return `<w:tr>${head}${cells}</w:tr>`;
      })
      .join('');

    return `<w:tbl>${props}${grid}${body}</w:tbl><w:p/>`;
  };

  [...root.childNodes].forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      walkBlock(node as Element);
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      out.push(`<w:p>${run(node.textContent.trim(), {})}</w:p>`);
    }
  });

  return out.join('') || EMPTY_PARA;
};

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

const DOC_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>`;

const heading = (id: string, name: string, size: number, color: string) =>
  `<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${name}"/>` +
  `<w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>` +
  `<w:pPr><w:keepNext/><w:spacing w:before="240" w:after="120"/><w:outlineLvl w:val="${id.slice(-1) === '1' ? 0 : id.slice(-1) === '2' ? 1 : 2}"/></w:pPr>` +
  `<w:rPr><w:b/><w:color w:val="${color}"/><w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr></w:style>`;

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr>
<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
<w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="ru-RU"/>
</w:rPr></w:rPrDefault>
<w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault>
</w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
${heading('Heading1', 'heading 1', 36, '1F3864')}
${heading('Heading2', 'heading 2', 28, '2E5496')}
${heading('Heading3', 'heading 3', 24, '2E5496')}
<w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:qFormat/>
<w:pPr><w:ind w:left="720"/><w:contextualSpacing/></w:pPr></w:style>
<w:style w:type="paragraph" w:styleId="Quote"><w:name w:val="Quote"/><w:basedOn w:val="Normal"/><w:qFormat/>
<w:pPr><w:ind w:left="720"/></w:pPr><w:rPr><w:i/><w:color w:val="555555"/></w:rPr></w:style>
<w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/>
<w:tblPr><w:tblBorders>
<w:top w:val="single" w:sz="4" w:color="999999"/><w:left w:val="single" w:sz="4" w:color="999999"/>
<w:bottom w:val="single" w:sz="4" w:color="999999"/><w:right w:val="single" w:sz="4" w:color="999999"/>
<w:insideH w:val="single" w:sz="4" w:color="999999"/><w:insideV w:val="single" w:sz="4" w:color="999999"/>
</w:tblBorders><w:tblCellMar>
<w:top w:w="60" w:type="dxa"/><w:left w:w="108" w:type="dxa"/>
<w:bottom w:w="60" w:type="dxa"/><w:right w:w="108" w:type="dxa"/>
</w:tblCellMar></w:tblPr></w:style>
</w:styles>`;

/** Уровни маркированного и нумерованного списков */
const levels = (ordered: boolean) =>
  Array.from({ length: 9 })
    .map((_, i) => {
      const fmt = ordered
        ? ['decimal', 'lowerLetter', 'lowerRoman'][i % 3]
        : 'bullet';
      const text = ordered ? `%${i + 1}.` : ['', 'o', ''][i % 3] || '';
      const font = ordered
        ? ''
        : '<w:rPr><w:rFonts w:ascii="Symbol" w:hAnsi="Symbol" w:hint="default"/></w:rPr>';
      return (
        `<w:lvl w:ilvl="${i}"><w:start w:val="1"/><w:numFmt w:val="${fmt}"/>` +
        `<w:lvlText w:val="${text}"/><w:lvlJc w:val="left"/>` +
        `<w:pPr><w:ind w:left="${720 * (i + 1)}" w:hanging="360"/></w:pPr>${font}</w:lvl>`
      );
    })
    .join('');

const NUMBERING = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="hybridMultilevel"/>${levels(false)}</w:abstractNum>
<w:abstractNum w:abstractNumId="2"><w:multiLevelType w:val="hybridMultilevel"/>${levels(true)}</w:abstractNum>
<w:num w:numId="1"><w:abstractNumId w:val="1"/></w:num>
<w:num w:numId="2"><w:abstractNumId w:val="2"/></w:num>
</w:numbering>`;


/** Настройки колонтитулов для файла Word */
export interface DocxFurniture {
  headerText: string;
  footerText: string;
  headerAlign: 'left' | 'center' | 'right';
  footerAlign: 'left' | 'center' | 'right';
  differentFirst: boolean;
  numberPosition: string;
  /** Номер стоит в верхнем поле */
  numberTop: boolean;
  numberAlign: 'left' | 'center' | 'right';
}

/**
 * Часть документа с колонтитулом. Номер страницы вставляется полем PAGE —
 * Word пересчитает его сам при печати.
 */
const furniturePart = (
  kind: 'hdr' | 'ftr',
  text: string,
  align: 'left' | 'center' | 'right',
  numbers: DocxFurniture | null,
): string => {
  const tag = kind === 'hdr' ? 'w:hdr' : 'w:ftr';

  /* поля документа превращаем в настоящие поля Word */
  const parts = text
    .replace(/\{ИМЯ\}/gi, '')
    .replace(/\{ДАТА\}/gi, new Date().toLocaleDateString('ru-RU'));

  const runs: string[] = [];

  const before = parts.split(/\{СТРАНИЦА\}/i)[0];
  const after = parts.split(/\{СТРАНИЦА\}/i)[1] ?? '';
  const hasPageField = /\{СТРАНИЦА\}/i.test(parts);

  const pageField =
    '<w:r><w:fldChar w:fldCharType="begin"/></w:r>' +
    '<w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>' +
    '<w:r><w:fldChar w:fldCharType="separate"/></w:r>' +
    '<w:r><w:t>1</w:t></w:r>' +
    '<w:r><w:fldChar w:fldCharType="end"/></w:r>';

  const totalField =
    '<w:r><w:fldChar w:fldCharType="begin"/></w:r>' +
    '<w:r><w:instrText xml:space="preserve"> NUMPAGES </w:instrText></w:r>' +
    '<w:r><w:fldChar w:fldCharType="separate"/></w:r>' +
    '<w:r><w:t>1</w:t></w:r>' +
    '<w:r><w:fldChar w:fldCharType="end"/></w:r>';

  const plain = (v: string) =>
    v ? `<w:r><w:t xml:space="preserve">${esc(v)}</w:t></w:r>` : '';

  const withTotal = (v: string) => {
    const [head, tail] = v.split(/\{ВСЕГО\}/i);
    if (tail === undefined) return plain(v);
    return plain(head) + totalField + plain(tail);
  };

  if (hasPageField) {
    runs.push(withTotal(before), pageField, withTotal(after));
  } else {
    runs.push(withTotal(parts));
  }

  /* отдельный номер страницы, если он задан не текстом, а положением */
  if (numbers && numbers.numberPosition !== 'none') {
    if (runs.filter(Boolean).length) runs.push(plain('  '));
    runs.push(pageField);
  }

  const justify = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<${tag} xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:p><w:pPr><w:jc w:val="${justify}"/></w:pPr>${runs.filter(Boolean).join('')}</w:p></${tag}>`;
};

/**
 * Собирает файл .docx из содержимого редактора.
 * Открывается в Word, LibreOffice и Google Документах без потери оформления.
 */
export const htmlToDocx = (
  html: string,
  title: string,
  furniture?: DocxFurniture,
): Uint8Array => {
  const holder = document.createElement('div');
  holder.innerHTML = html;

  const f = furniture;
  const hasHeader = !!f?.headerText || (!!f && f.numberTop);
  const hasFooter = !!f?.footerText || (!!f && f.numberPosition !== 'none' && !f.numberTop);

  const document_xml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<w:body>${bodyFromHtml(holder)}` +
    `<w:sectPr>` +
    (hasHeader ? '<w:headerReference w:type="default" r:id="rIdHdr"/>' : '') +
    (hasFooter ? '<w:footerReference w:type="default" r:id="rIdFtr"/>' : '') +
    `<w:pgSz w:w="11906" w:h="16838"/>` +
    `<w:pgMar w:top="1134" w:right="850" w:bottom="1134" w:left="1701" w:header="708" w:footer="708" w:gutter="0"/>` +
    (f?.differentFirst ? '<w:titlePg/>' : '') +
    `</w:sectPr></w:body></w:document>`;

  const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  const core = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>${esc(title)}</dc:title><dc:creator>ПВ-Система Текст</dc:creator>
<cp:lastModifiedBy>ПВ-Система Текст</cp:lastModifiedBy>
<dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
<dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`;

  const app = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
<Application>ПВ-Система Текст</Application></Properties>`;

  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8(
      CONTENT_TYPES.replace(
        '</Types>',
        (hasHeader
          ? '<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>'
          : '') +
          (hasFooter
            ? '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>'
            : '') +
          '</Types>',
      ),
    ),
    '_rels/.rels': strToU8(ROOT_RELS),
    'word/document.xml': strToU8(document_xml),
    'word/styles.xml': strToU8(STYLES),
    'word/numbering.xml': strToU8(NUMBERING),
    'word/_rels/document.xml.rels': strToU8(
      DOC_RELS.replace(
        '</Relationships>',
        (hasHeader
          ? '<Relationship Id="rIdHdr" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>'
          : '') +
          (hasFooter
            ? '<Relationship Id="rIdFtr" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>'
            : '') +
          '</Relationships>',
      ),
    ),
    'docProps/core.xml': strToU8(core),
    'docProps/app.xml': strToU8(app),
  };

  if (hasHeader && f) {
    files['word/header1.xml'] = strToU8(
      furniturePart('hdr', f.headerText, f.headerAlign, f.numberTop ? f : null),
    );
  }

  if (hasFooter && f) {
    files['word/footer1.xml'] = strToU8(
      furniturePart('ftr', f.footerText, f.footerAlign, f.numberTop ? null : f),
    );
  }

  return zipSync(files, { level: 6 });
};