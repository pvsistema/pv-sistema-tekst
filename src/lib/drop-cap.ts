/** Положение буквицы: в тексте с обтеканием или на поле слева */
export type DropCapKind = 'none' | 'in-text' | 'in-margin';

export interface DropCapSetup {
  kind: DropCapKind;
  /** Высота буквы в строках */
  lines: number;
  /** Расстояние от текста, см */
  distance: number;
}

export const DEFAULT_DROP_CAP: DropCapSetup = {
  kind: 'in-text',
  lines: 3,
  distance: 0.2,
};

/** Абзац, в котором стоит курсор */
export const paragraphAtCursor = (
  root: HTMLElement | null,
): HTMLElement | null => {
  const node = window.getSelection()?.anchorNode;
  if (!node || !root?.contains(node)) return null;

  const el =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node.parentElement;

  const block = el?.closest('p,div,h1,h2,h3,h4,h5,h6');

  /* сам лист абзацем не считаем */
  return block && block !== root ? (block as HTMLElement) : null;
};

/** Есть ли уже буквица в этом абзаце */
export const hasDropCap = (para: HTMLElement): boolean =>
  !!para.querySelector('.pv-dropcap');

/** Убирает буквицу, возвращая букву в обычный текст */
export const removeDropCap = (para: HTMLElement): boolean => {
  const cap = para.querySelector<HTMLElement>('.pv-dropcap');
  if (!cap) return false;

  const letter = cap.textContent ?? '';
  cap.replaceWith(document.createTextNode(letter));

  /* склеиваем разорванные куски текста */
  para.normalize();
  return true;
};

/**
 * Делает первую букву абзаца крупной с обтеканием текстом —
 * настоящая буквица, как в Word.
 */
export const applyDropCap = (
  para: HTMLElement,
  setup: DropCapSetup,
): boolean => {
  removeDropCap(para);

  if (setup.kind === 'none') return true;

  /* ищем первый непробельный символ в тексте абзаца */
  const walker = document.createTreeWalker(para, NodeFilter.SHOW_TEXT);

  let target: Text | null = null;
  let at = -1;

  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = (n as Text).nodeValue ?? '';
    const index = text.search(/\S/);

    if (index !== -1) {
      target = n as Text;
      at = index;
      break;
    }
  }

  if (!target || at < 0) return false;

  const letter = target.nodeValue![at];

  /* отрезаем первую букву и ставим на её место крупную */
  const rest = target.splitText(at);
  rest.nodeValue = rest.nodeValue!.slice(1);

  const cap = document.createElement('span');
  cap.className = 'pv-dropcap';
  cap.textContent = letter;

  /* высота буквы = столько строк, сколько задано */
  const em = setup.lines * 1.02;

  cap.style.cssText = [
    'float:left',
    `font-size:${em.toFixed(2)}em`,
    'line-height:0.82',
    'font-weight:600',
    'padding-top:0.06em',
    `margin-right:${setup.distance}cm`,
    setup.kind === 'in-margin'
      ? `margin-left:-${(setup.lines * 0.55).toFixed(2)}em`
      : '',
  ]
    .filter(Boolean)
    .join(';');

  rest.parentNode!.insertBefore(cap, rest);

  /* без этого следующий абзац наезжает на выступающую букву */
  if (!para.style.overflow) para.style.overflow = 'hidden';

  return true;
};
