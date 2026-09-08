import { selectedParagraphs } from '@/lib/text-format';

/** Тип обрамления — левая колонка окна «Границы и заливка» */
export type BorderPreset = 'none' | 'box' | 'shadow' | 'custom';

/** Вид линии */
export type BorderStyle =
  | 'solid'
  | 'double'
  | 'dashed'
  | 'dotted'
  | 'groove'
  | 'ridge';

export type BorderSide = 'top' | 'right' | 'bottom' | 'left';

export const BORDER_STYLE_LABELS: { value: BorderStyle; label: string }[] = [
  { value: 'solid', label: 'Сплошная' },
  { value: 'double', label: 'Двойная' },
  { value: 'dashed', label: 'Штриховая' },
  { value: 'dotted', label: 'Точечная' },
  { value: 'groove', label: 'Вдавленная' },
  { value: 'ridge', label: 'Выпуклая' },
];

export const BORDER_WIDTHS = [0.5, 1, 1.5, 2, 3, 4.5, 6];

export interface BorderSetup {
  preset: BorderPreset;
  style: BorderStyle;
  color: string;
  width: number;
  /** Какие стороны обведены */
  sides: Record<BorderSide, boolean>;
  /** Отступ от текста до линии, пункты */
  padding: number;
  /** Заливка фона; пусто — без заливки */
  fill: string;
  /** Тень справа и снизу — как в Word */
  shadow: boolean;
}

export const DEFAULT_BORDER: BorderSetup = {
  preset: 'none',
  style: 'solid',
  color: '#000000',
  width: 1,
  sides: { top: false, right: false, bottom: false, left: false },
  padding: 4,
  fill: '',
  shadow: false,
};

/** Готовые наборы сторон для типов обрамления */
export const presetSides = (
  preset: BorderPreset,
): Record<BorderSide, boolean> => {
  if (preset === 'box' || preset === 'shadow') {
    return { top: true, right: true, bottom: true, left: true };
  }
  if (preset === 'none') {
    return { top: false, right: false, bottom: false, left: false };
  }
  return { top: false, right: false, bottom: false, left: false };
};

/** Строка CSS для одной линии */
const line = (s: BorderSetup) => `${s.width}px ${s.style} ${s.color}`;

/** Наносит обрамление и заливку на элемент */
export const paintBorder = (el: HTMLElement, s: BorderSetup) => {
  const value = line(s);
  const off = 'none';

  el.style.borderTop = s.sides.top ? value : off;
  el.style.borderRight = s.sides.right ? value : off;
  el.style.borderBottom = s.sides.bottom ? value : off;
  el.style.borderLeft = s.sides.left ? value : off;

  const any = Object.values(s.sides).some(Boolean);

  el.style.padding = any || s.fill ? `${s.padding}px ${s.padding + 2}px` : '';
  el.style.backgroundColor = s.fill || '';

  /* тень рисуем справа и снизу, как это делает Word */
  el.style.boxShadow = s.shadow && any ? '3px 3px 0 rgba(0,0,0,0.35)' : '';

  if (!any && !s.fill) {
    el.style.removeProperty('border-top');
    el.style.removeProperty('border-right');
    el.style.removeProperty('border-bottom');
    el.style.removeProperty('border-left');
    el.style.removeProperty('padding');
    el.style.removeProperty('background-color');
    el.style.removeProperty('box-shadow');
    el.removeAttribute('data-border');
    return;
  }

  el.setAttribute('data-border', s.preset);
};

/** Применяет обрамление ко всем выделенным абзацам */
export const applyBorder = (
  root: HTMLElement | null,
  setup: BorderSetup,
): number => {
  const list = selectedParagraphs(root);
  list.forEach((el) => paintBorder(el, setup));
  return list.length;
};

/**
 * Применяет обрамление к выделенному тексту, а не к абзацу целиком —
 * это переключатель «Применить к: тексту» в Word.
 */
export const applyBorderToText = (setup: BorderSetup): boolean => {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || sel.getRangeAt(0).collapsed) return false;

  const range = sel.getRangeAt(0);
  const span = document.createElement('span');

  span.setAttribute('data-border', 'text');
  paintBorder(span, { ...setup, padding: Math.min(2, setup.padding) });
  span.style.display = 'inline';

  try {
    span.appendChild(range.extractContents());
    range.insertNode(span);
    return true;
  } catch {
    return false;
  }
};

/** Читает обрамление того абзаца, где стоит курсор */
export const readBorder = (root: HTMLElement | null): BorderSetup => {
  const list = selectedParagraphs(root);
  const el = list[0];
  if (!el) return DEFAULT_BORDER;

  const cs = window.getComputedStyle(el);

  const has = (side: string) => {
    const w = parseFloat(cs.getPropertyValue(`border-${side}-width`));
    const st = cs.getPropertyValue(`border-${side}-style`);
    return w > 0 && st !== 'none';
  };

  const sides = {
    top: has('top'),
    right: has('right'),
    bottom: has('bottom'),
    left: has('left'),
  };

  const any = Object.values(sides).some(Boolean);
  const all = Object.values(sides).every(Boolean);

  const bg = cs.backgroundColor;
  const transparent =
    !bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)';

  const shadow = !!el.style.boxShadow;

  return {
    preset: !any ? 'none' : shadow ? 'shadow' : all ? 'box' : 'custom',
    style: (cs.borderTopStyle as BorderStyle) || 'solid',
    color: rgbToHex(cs.borderTopColor) || '#000000',
    width: Math.max(0.5, parseFloat(cs.borderTopWidth) || 1),
    sides,
    padding: Math.round(parseFloat(cs.paddingTop) || 4),
    fill: transparent ? '' : rgbToHex(bg),
    shadow,
  };
};

/** Цвет из формата браузера в шестнадцатеричный */
export const rgbToHex = (css: string): string => {
  const m = css.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return css.startsWith('#') ? css : '';

  return `#${[m[1], m[2], m[3]]
    .map((n) => Number(n).toString(16).padStart(2, '0'))
    .join('')}`;
};

/** Убирает обрамление и заливку */
export const clearBorder = (root: HTMLElement | null): number => {
  const list = selectedParagraphs(root);

  list.forEach((el) => {
    paintBorder(el, DEFAULT_BORDER);
    /* заодно снимаем обрамление с кусочков текста внутри */
    el.querySelectorAll('[data-border="text"]').forEach((span) => {
      const parent = span.parentNode;
      while (span.firstChild) parent?.insertBefore(span.firstChild, span);
      span.remove();
    });
  });

  return list.length;
};

/** Обрамление всей страницы */
export interface PageBorderSetup {
  enabled: boolean;
  style: BorderStyle;
  color: string;
  width: number;
  /** Отступ рамки от края листа, пункты */
  margin: number;
  /** Рамка из повторяющегося рисунка */
  art: string;
}

export const DEFAULT_PAGE_BORDER: PageBorderSetup = {
  enabled: false,
  style: 'solid',
  color: '#2f5496',
  width: 2,
  margin: 24,
  art: '',
};

/** Рисунки для рамки страницы — упрощённые «художественные» рамки Word */
export const PAGE_ART = [
  { value: '', label: 'Нет' },
  { value: '★', label: 'Звёзды' },
  { value: '❖', label: 'Ромбы' },
  { value: '❀', label: 'Цветы' },
  { value: '▪', label: 'Квадраты' },
  { value: '～', label: 'Волны' },
];
