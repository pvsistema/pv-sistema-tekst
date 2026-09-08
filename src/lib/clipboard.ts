/** Способ вставки — команды меню «Параметры вставки» */
export type PasteMode = 'keep' | 'merge' | 'text';

export const PASTE_MODES: {
  value: PasteMode;
  label: string;
  hint: string;
  icon: string;
}[] = [
  {
    value: 'keep',
    label: 'Сохранить исходное форматирование',
    hint: 'Текст придёт вместе с оформлением источника',
    icon: 'ClipboardPaste',
  },
  {
    value: 'merge',
    label: 'Объединить форматирование',
    hint: 'Останется структура, но оформление станет как в документе',
    icon: 'ClipboardType',
  },
  {
    value: 'text',
    label: 'Сохранить только текст',
    hint: 'Всё оформление источника отбрасывается',
    icon: 'Type',
  },
];

/** Теги, которые переживают очистку при «объединить форматирование» */
const KEEP_TAGS = new Set([
  'P',
  'BR',
  'B',
  'STRONG',
  'I',
  'EM',
  'U',
  'S',
  'SUP',
  'SUB',
  'UL',
  'OL',
  'LI',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'TABLE',
  'THEAD',
  'TBODY',
  'TR',
  'TD',
  'TH',
  'BLOCKQUOTE',
]);

/** Убирает из вставляемого куска чужое оформление */
export const cleanPasted = (html: string, mode: PasteMode): string => {
  if (mode === 'keep') return html;

  const holder = document.createElement('div');
  holder.innerHTML = html;

  /* правки Word и браузера, которые не несут смысла */
  holder
    .querySelectorAll('script, style, meta, link, o\\:p')
    .forEach((el) => el.remove());

  const walk = (node: Element) => {
    [...node.children].forEach(walk);

    if (mode === 'text' || !KEEP_TAGS.has(node.tagName)) {
      /* тег не нужен — оставляем только его содержимое */
      if (node.tagName !== 'BR') {
        node.replaceWith(...node.childNodes);
        return;
      }
    }

    /* убираем цвета, шрифты и размеры источника */
    node.removeAttribute('style');
    node.removeAttribute('class');
    node.removeAttribute('color');
    node.removeAttribute('face');
    node.removeAttribute('bgcolor');
    node.removeAttribute('align');
  };

  [...holder.children].forEach(walk);

  if (mode === 'text') return blocksToText(html);

  return holder.innerHTML;
};

/**
 * Разбивает вставляемый кусок на строки по блочным тегам.
 * Каждый абзац, пункт списка и строка таблицы становятся своей строкой.
 */
const blocksToText = (html: string): string => {
  const holder = document.createElement('div');
  holder.innerHTML = html;

  holder.querySelectorAll('script, style, meta, link').forEach((el) => {
    el.remove();
  });

  const BLOCKS = 'p, div, li, tr, h1, h2, h3, h4, h5, h6, blockquote, br';
  const lines: string[] = [];

  const blocks = holder.querySelectorAll(BLOCKS);

  if (!blocks.length) {
    const plain = (holder.textContent ?? '').trim();
    return plain ? `<p>${escapeHtml(plain)}</p>` : '';
  }

  blocks.forEach((el) => {
    /* у вложенных блоков текст возьмёт внешний — берём только листья */
    if (el.querySelector(BLOCKS)) return;

    const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (text) lines.push(text);
  });

  return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join('');
};

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/** Есть ли в буфере обмена размеченный текст */
export const hasHtml = (data: DataTransfer | null): boolean =>
  !!data?.types?.includes('text/html');
