/** Признаки оформления, по которым сравниваем куски текста */
interface Look {
  family: string;
  size: string;
  weight: string;
  style: string;
  decoration: string;
  color: string;
}

const lookOf = (el: Element): Look => {
  const cs = getComputedStyle(el);

  return {
    family: cs.fontFamily,
    size: cs.fontSize,
    weight: cs.fontWeight,
    style: cs.fontStyle,
    decoration: cs.textDecorationLine,
    color: cs.color,
  };
};

const same = (a: Look, b: Look): boolean =>
  a.family === b.family &&
  a.size === b.size &&
  a.weight === b.weight &&
  a.style === b.style &&
  a.decoration === b.decoration &&
  a.color === b.color;

/**
 * Выделяет весь текст с таким же оформлением, как под курсором —
 * пункт «Выделить текст с одинаковым форматированием» в Word.
 * Возвращает число найденных фрагментов.
 */
export const selectSameFormat = (root: HTMLElement | null): number => {
  if (!root) return 0;

  const selection = window.getSelection();
  const anchor = selection?.anchorNode;
  if (!anchor || !root.contains(anchor)) return 0;

  const start =
    anchor.nodeType === Node.ELEMENT_NODE
      ? (anchor as Element)
      : anchor.parentElement;

  if (!start) return 0;

  const target = lookOf(start);

  /* собираем куски текста с тем же оформлением */
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const found: Text[] = [];

  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const node = n as Text;
    if (!node.textContent?.trim()) continue;

    const parent = node.parentElement;
    if (parent && same(lookOf(parent), target)) found.push(node);
  }

  if (!found.length) return 0;

  /* выделяем от первого до последнего совпадения */
  const range = document.createRange();
  range.setStart(found[0], 0);
  range.setEnd(found[found.length - 1], found[found.length - 1].length);

  selection?.removeAllRanges();
  selection?.addRange(range);

  return found.length;
};

/**
 * Выделяет все картинки и вставленные объекты — пункт
 * «Выделить объекты» в Word. Возвращает их число.
 */
export const countObjects = (root: HTMLElement | null): number =>
  root ? root.querySelectorAll('img,svg,figure,table').length : 0;

/**
 * Ставит курсор в начало нужной страницы — пункт «Перейти» в Word.
 * Высота страницы нужна, чтобы найти её границу.
 */
export const goToPage = (
  root: HTMLElement | null,
  page: number,
  contentHeight: number,
): boolean => {
  if (!root || page < 1 || contentHeight <= 0) return false;

  const wanted = (page - 1) * contentHeight;

  /* ищем первый абзац, который начинается на этой странице */
  const blocks = [
    ...root.querySelectorAll<HTMLElement>('p,h1,h2,h3,h4,h5,h6,li,table'),
  ];

  const target =
    blocks.find((b) => b.offsetTop - root.offsetTop >= wanted - 2) ??
    blocks[blocks.length - 1];

  if (!target) return false;

  target.scrollIntoView({ block: 'start', behavior: 'smooth' });

  const range = document.createRange();
  range.selectNodeContents(target);
  range.collapse(true);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);

  return true;
};
