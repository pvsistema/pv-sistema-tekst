/** Настройки символов — то, что задаётся в диалоге «Шрифт» */
export interface CharFormat {
  family: string;
  size: number;
  bold: boolean;
  italic: boolean;
  underline: 'none' | 'single' | 'double' | 'dotted' | 'dashed' | 'wavy';
  strike: boolean;
  color: string;
  highlight: string;
  /** Верхний или нижний индекс */
  vertical: 'none' | 'super' | 'sub';
  /** Все прописные, малые прописные, обычный регистр */
  caps: 'none' | 'upper' | 'small';
  /** Разрежённый или уплотнённый интервал, в пунктах */
  spacing: number;
}

/** Настройки абзаца — то, что задаётся в диалоге «Абзац» */
export interface ParaFormat {
  align: 'left' | 'center' | 'right' | 'justify';
  /** Отступы слева и справа, в сантиметрах */
  indentLeft: number;
  indentRight: number;
  /** Первая строка: отступ (положительный) или выступ (отрицательный), см */
  firstLine: number;
  /** Интервалы перед и после абзаца, в пунктах */
  spaceBefore: number;
  spaceAfter: number;
  /** Межстрочный интервал: множитель либо точное значение */
  lineRule: 'single' | '1.15' | '1.5' | 'double' | 'exact' | 'multiple';
  lineValue: number;
}

export const DEFAULT_CHAR: CharFormat = {
  family: 'Times New Roman',
  size: 12,
  bold: false,
  italic: false,
  underline: 'none',
  strike: false,
  color: '#000000',
  highlight: 'transparent',
  vertical: 'none',
  caps: 'none',
  spacing: 0,
};

export const DEFAULT_PARA: ParaFormat = {
  align: 'left',
  indentLeft: 0,
  indentRight: 0,
  firstLine: 0,
  spaceBefore: 0,
  spaceAfter: 8,
  lineRule: '1.15',
  lineValue: 1.15,
};

/** В одном сантиметре примерно 37.8 экранных точек */
export const CM_TO_PX = 37.8;
/** Пункт — одна семьдесят вторая дюйма */
export const PT_TO_PX = 96 / 72;

const round = (n: number, digits = 2) => Number(n.toFixed(digits));

/** Цвет из вычисленного стиля в вид #rrggbb */
export const rgbToHex = (value: string): string => {
  const m = value.match(/rgba?\(([^)]+)\)/);
  if (!m) return value.startsWith('#') ? value : '#000000';

  const parts = m[1].split(',').map((n) => Number(n.trim()));
  if (parts.length > 3 && parts[3] === 0) return 'transparent';

  return `#${parts
    .slice(0, 3)
    .map((n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0'))
    .join('')}`;
};

/** Элемент, внутри которого стоит курсор */
export const selectedElement = (root: HTMLElement | null): HTMLElement | null => {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || !root) return null;

  let node: Node | null = sel.getRangeAt(0).startContainer;
  if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;

  return node instanceof HTMLElement && root.contains(node) ? node : null;
};

/** Абзац (или ячейка, заголовок), в котором стоит курсор */
export const selectedParagraph = (
  root: HTMLElement | null,
): HTMLElement | null => {
  let el = selectedElement(root);
  const BLOCKS = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'TD', 'TH', 'DIV', 'BLOCKQUOTE'];

  while (el && el !== root && !BLOCKS.includes(el.tagName)) {
    el = el.parentElement;
  }

  return el && el !== root ? el : null;
};

/** Все абзацы, затронутые выделением */
export const selectedParagraphs = (
  root: HTMLElement | null,
): HTMLElement[] => {
  if (!root) return [];
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return [];

  const range = sel.getRangeAt(0);
  const all = Array.from(
    root.querySelectorAll<HTMLElement>('p, h1, h2, h3, h4, h5, h6, li, blockquote'),
  ).filter((el) => range.intersectsNode(el));

  if (all.length) return all;

  const single = selectedParagraph(root);
  return single ? [single] : [];
};

/** Читает оформление символов там, где стоит курсор */
export const readCharFormat = (root: HTMLElement | null): CharFormat => {
  const el = selectedElement(root) ?? root;
  if (!el) return DEFAULT_CHAR;

  const cs = window.getComputedStyle(el);
  const decoration = cs.textDecorationLine || '';

  /* браузер называет обычное подчёркивание solid, Word — одинарным */
  const style = cs.textDecorationStyle;
  const underline: CharFormat['underline'] = !decoration.includes('underline')
    ? 'none'
    : style === 'double' || style === 'dotted' || style === 'dashed' || style === 'wavy'
      ? style
      : 'single';

  const align = cs.verticalAlign;

  return {
    family: cs.fontFamily.replace(/["']/g, '').split(',')[0].trim(),
    size: round(parseFloat(cs.fontSize) / PT_TO_PX, 1),
    bold: Number(cs.fontWeight) >= 600 || cs.fontWeight === 'bold',
    italic: cs.fontStyle === 'italic',
    underline,
    strike: decoration.includes('line-through'),
    color: rgbToHex(cs.color),
    highlight: rgbToHex(cs.backgroundColor),
    vertical: align === 'super' ? 'super' : align === 'sub' ? 'sub' : 'none',
    caps:
      cs.textTransform === 'uppercase'
        ? 'upper'
        : cs.fontVariantCaps === 'small-caps'
          ? 'small'
          : 'none',
    spacing: round(parseFloat(cs.letterSpacing || '0') / PT_TO_PX, 1) || 0,
  };
};

/** Читает оформление абзаца, в котором стоит курсор */
export const readParaFormat = (root: HTMLElement | null): ParaFormat => {
  const el = selectedParagraph(root);
  if (!el) return DEFAULT_PARA;

  const cs = window.getComputedStyle(el);
  const fontSize = parseFloat(cs.fontSize) || 16;
  const lineHeight = parseFloat(cs.lineHeight);

  const ratio = Number.isNaN(lineHeight) ? 1.15 : lineHeight / fontSize;
  const rule: ParaFormat['lineRule'] =
    Math.abs(ratio - 1) < 0.06
      ? 'single'
      : Math.abs(ratio - 1.15) < 0.06
        ? '1.15'
        : Math.abs(ratio - 1.5) < 0.06
          ? '1.5'
          : Math.abs(ratio - 2) < 0.06
            ? 'double'
            : 'multiple';

  const textAlign = cs.textAlign;

  return {
    align:
      textAlign === 'center'
        ? 'center'
        : textAlign === 'right'
          ? 'right'
          : textAlign === 'justify'
            ? 'justify'
            : 'left',
    indentLeft: round(parseFloat(cs.marginLeft || '0') / CM_TO_PX),
    indentRight: round(parseFloat(cs.marginRight || '0') / CM_TO_PX),
    firstLine: round(parseFloat(cs.textIndent || '0') / CM_TO_PX),
    spaceBefore: round(parseFloat(cs.marginTop || '0') / PT_TO_PX, 1),
    spaceAfter: round(parseFloat(cs.marginBottom || '0') / PT_TO_PX, 1),
    lineRule: rule,
    lineValue: round(ratio, 2),
  };
};

/** Множитель межстрочного интервала для выбранного правила */
export const lineHeightOf = (f: ParaFormat): string => {
  switch (f.lineRule) {
    case 'single':
      return '1';
    case '1.15':
      return '1.15';
    case '1.5':
      return '1.5';
    case 'double':
      return '2';
    case 'exact':
      return `${f.lineValue * PT_TO_PX}px`;
    default:
      return String(f.lineValue);
  }
};

/** Применяет настройки абзаца ко всем выбранным абзацам */
export const applyParaFormat = (
  root: HTMLElement | null,
  f: ParaFormat,
): number => {
  const list = selectedParagraphs(root);

  list.forEach((el) => {
    el.style.textAlign = f.align;
    el.style.marginLeft = `${f.indentLeft * CM_TO_PX}px`;
    el.style.marginRight = `${f.indentRight * CM_TO_PX}px`;
    el.style.textIndent = `${f.firstLine * CM_TO_PX}px`;
    el.style.marginTop = `${f.spaceBefore * PT_TO_PX}px`;
    el.style.marginBottom = `${f.spaceAfter * PT_TO_PX}px`;
    el.style.lineHeight = lineHeightOf(f);
  });

  return list.length;
};

/** Оборачивает выделение в элемент с нужным оформлением */
export const applyCharFormat = (
  root: HTMLElement | null,
  f: CharFormat,
): boolean => {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || !root) return false;

  const range = sel.getRangeAt(0);
  if (range.collapsed) return false;

  const span = document.createElement('span');
  span.style.fontFamily = f.family;
  span.style.fontSize = `${f.size * PT_TO_PX}px`;
  span.style.fontWeight = f.bold ? 'bold' : 'normal';
  span.style.fontStyle = f.italic ? 'italic' : 'normal';
  span.style.color = f.color;

  const lines: string[] = [];
  if (f.underline !== 'none') lines.push('underline');
  if (f.strike) lines.push('line-through');
  span.style.textDecorationLine = lines.join(' ') || 'none';

  if (f.underline !== 'none' && f.underline !== 'single') {
    span.style.textDecorationStyle =
      f.underline === 'double' ? 'double' : f.underline;
  }

  if (f.highlight !== 'transparent') span.style.backgroundColor = f.highlight;
  if (f.vertical !== 'none') span.style.verticalAlign = f.vertical;
  if (f.vertical !== 'none') span.style.fontSize = `${f.size * PT_TO_PX * 0.8}px`;

  if (f.caps === 'upper') span.style.textTransform = 'uppercase';
  if (f.caps === 'small') span.style.fontVariantCaps = 'small-caps';
  if (f.spacing) span.style.letterSpacing = `${f.spacing * PT_TO_PX}px`;

  try {
    span.appendChild(range.extractContents());
    range.insertNode(span);

    /* оставляем текст выделенным, чтобы можно было править дальше */
    const next = document.createRange();
    next.selectNodeContents(span);
    sel.removeAllRanges();
    sel.addRange(next);
    return true;
  } catch {
    return false;
  }
};

/** Меняет регистр выделенного текста */
export const changeCase = (
  root: HTMLElement | null,
  mode: 'sentence' | 'lower' | 'upper' | 'capitalize' | 'toggle',
): boolean => {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || !root) return false;

  const text = sel.toString();
  if (!text) return false;

  const convert = (s: string): string => {
    switch (mode) {
      case 'lower':
        return s.toLowerCase();
      case 'upper':
        return s.toUpperCase();
      case 'capitalize':
        return s.replace(/\p{L}[\p{L}\p{M}']*/gu, (w) =>
          w[0].toUpperCase() + w.slice(1).toLowerCase(),
        );
      case 'toggle':
        return s.replace(/\p{L}/gu, (c) =>
          c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase(),
        );
      default: {
        const lower = s.toLowerCase();
        return lower.replace(/(^\s*\p{L})|([.!?]\s+\p{L})/gu, (m) =>
          m.toUpperCase(),
        );
      }
    }
  };

  document.execCommand('insertText', false, convert(text));
  return true;
};