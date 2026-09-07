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

/** Оформление одного участка текста: жирный, курсив и прочее */
const runToHtml = (run: string): string => {
  const texts = [...run.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)]
    .map((m) => m[1])
    .join('');

  const breaks = /<w:br\b/.test(run) ? '<br>' : '';
  if (!texts && !breaks) return '';

  let html = esc(texts) + breaks;
  const props = run.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/)?.[1] ?? '';

  if (/<w:b\b(?![^>]*w:val="(?:0|false)")/.test(props)) html = `<strong>${html}</strong>`;
  if (/<w:i\b(?![^>]*w:val="(?:0|false)")/.test(props)) html = `<em>${html}</em>`;
  if (/<w:u\b(?![^>]*w:val="none")/.test(props)) html = `<u>${html}</u>`;
  if (/<w:strike\b/.test(props)) html = `<s>${html}</s>`;
  if (/w:val="superscript"/.test(props)) html = `<sup>${html}</sup>`;
  if (/w:val="subscript"/.test(props)) html = `<sub>${html}</sub>`;

  const color = props.match(/<w:color[^>]*w:val="([0-9A-Fa-f]{6})"/)?.[1];
  if (color && color.toLowerCase() !== '000000')
    html = `<span style="color:#${color}">${html}</span>`;

  const hl = props.match(/<w:highlight[^>]*w:val="(\w+)"/)?.[1];
  if (hl && hl !== 'none')
    html = `<span style="background-color:${hl}">${html}</span>`;

  return html;
};

/** Абзац: заголовок, элемент списка или обычный текст */
const paraToHtml = (para: string): string => {
  const inner = [...para.matchAll(/<w:r(?:\s[^>]*)?>([\s\S]*?)<\/w:r>/g)]
    .map((m) => runToHtml(m[1]))
    .join('');

  const props = para.match(/<w:pPr>([\s\S]*?)<\/w:pPr>/)?.[1] ?? '';
  const style = props.match(/<w:pStyle[^>]*w:val="([^"]*)"/)?.[1] ?? '';

  const isList = /<w:numPr>/.test(props);
  if (isList) return `<li>${inner || '&nbsp;'}</li>`;

  const heading = style.match(/^(?:Heading|Za?golovok|.*?)(\d)$/i)?.[1];
  if (/heading|zagolovok|заголовок/i.test(style) && heading) {
    const level = Math.min(3, Number(heading));
    return `<h${level}>${inner || '&nbsp;'}</h${level}>`;
  }
  if (/^Title$/i.test(style)) return `<h1>${inner || '&nbsp;'}</h1>`;

  const align = props.match(/<w:jc[^>]*w:val="(\w+)"/)?.[1];
  const alignCss =
    align === 'center'
      ? ' style="text-align:center"'
      : align === 'right'
        ? ' style="text-align:right"'
        : align === 'both'
          ? ' style="text-align:justify"'
          : '';

  if (!inner) return '<p><br></p>';
  return `<p${alignCss}>${inner}</p>`;
};

/** Таблица документа */
const tableToHtml = (table: string): string => {
  const rows = [...table.matchAll(/<w:tr(?:\s[^>]*)?>([\s\S]*?)<\/w:tr>/g)];
  if (!rows.length) return '';

  const body = rows
    .map((r) => {
      const cells = [...r[1].matchAll(/<w:tc(?:\s[^>]*)?>([\s\S]*?)<\/w:tc>/g)]
        .map((c) => {
          const text = [...c[1].matchAll(/<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>/g)]
            .map((p) => paraToHtml(p[1]))
            .join('');
          return `<td>${text || '&nbsp;'}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  return `<table>${body}</table>`;
};

/** Собирает подряд идущие элементы списка в один список */
const wrapLists = (html: string) =>
  html.replace(/(?:<li>[\s\S]*?<\/li>)+/g, (m) => `<ul>${m}</ul>`);

/**
 * Превращает содержимое .docx в разметку документа.
 * Возвращает null, если это не документ Word.
 */
export const docxToHtml = (bytes: Uint8Array): string | null => {
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(bytes, { filter: (f) => f.name === 'word/document.xml' });
  } catch {
    return null;
  }

  const doc = files['word/document.xml'];
  if (!doc) return null;

  const xml = strFromU8(doc);
  const body = xml.match(/<w:body>([\s\S]*?)<\/w:body>/)?.[1] ?? xml;

  /* абзацы и таблицы верхнего уровня — по порядку появления */
  const parts: string[] = [];
  const re = /<w:tbl>[\s\S]*?<\/w:tbl>|<w:p(?:\s[^>]*)?(?:\/>|>[\s\S]*?<\/w:p>)/g;

  for (const m of body.matchAll(re)) {
    const chunk = m[0];
    if (chunk.startsWith('<w:tbl')) {
      parts.push(tableToHtml(chunk));
    } else {
      const innerMatch = chunk.match(/<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>/);
      parts.push(innerMatch ? paraToHtml(innerMatch[1]) : '<p><br></p>');
    }
  }

  const html = wrapLists(parts.join(''));
  return html.trim() || '<p><br></p>';
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
