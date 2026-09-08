import type { CharFormat, ParaFormat } from '@/lib/text-format';
import {
  DEFAULT_CHAR,
  DEFAULT_PARA,
  CM_TO_PX,
  PT_TO_PX,
  lineHeightOf,
  selectedParagraphs,
} from '@/lib/text-format';

/** Стиль документа — набор оформления с именем, как в Word */
export interface DocStyle {
  id: string;
  name: string;
  /** Абзацный стиль меняет весь абзац, знаковый — только выделенный текст */
  kind: 'paragraph' | 'character';
  /** Уровень заголовка: по нему строится оглавление и структура */
  level: 0 | 1 | 2 | 3;
  char: Partial<CharFormat>;
  para: Partial<ParaFormat>;
  /** Встроенные стили нельзя удалить */
  builtin: boolean;
  /** Тег, которым размечается абзац */
  tag: string;
}

const c = (v: Partial<CharFormat>) => v;
const p = (v: Partial<ParaFormat>) => v;

/** Встроенные стили — те же, что в галерее экспресс-стилей Word */
export const BUILTIN_STYLES: DocStyle[] = [
  {
    id: 'normal',
    name: 'Обычный',
    kind: 'paragraph',
    level: 0,
    tag: 'p',
    builtin: true,
    char: c({ family: 'Calibri', size: 11, color: '#000000' }),
    para: p({ spaceAfter: 8, lineRule: '1.15' }),
  },
  {
    id: 'nospacing',
    name: 'Без интервала',
    kind: 'paragraph',
    level: 0,
    tag: 'p',
    builtin: true,
    char: c({ family: 'Calibri', size: 11, color: '#000000' }),
    para: p({ spaceBefore: 0, spaceAfter: 0, lineRule: 'single' }),
  },
  {
    id: 'heading1',
    name: 'Заголовок 1',
    kind: 'paragraph',
    level: 1,
    tag: 'h1',
    builtin: true,
    char: c({ family: 'Calibri Light', size: 16, color: '#2f5496' }),
    para: p({ spaceBefore: 12, spaceAfter: 4, lineRule: 'single' }),
  },
  {
    id: 'heading2',
    name: 'Заголовок 2',
    kind: 'paragraph',
    level: 2,
    tag: 'h2',
    builtin: true,
    char: c({ family: 'Calibri Light', size: 13, color: '#2f5496' }),
    para: p({ spaceBefore: 10, spaceAfter: 4, lineRule: 'single' }),
  },
  {
    id: 'heading3',
    name: 'Заголовок 3',
    kind: 'paragraph',
    level: 3,
    tag: 'h3',
    builtin: true,
    char: c({ family: 'Calibri Light', size: 12, color: '#1f3864' }),
    para: p({ spaceBefore: 8, spaceAfter: 4, lineRule: 'single' }),
  },
  {
    id: 'title',
    name: 'Название',
    kind: 'paragraph',
    level: 0,
    tag: 'h1',
    builtin: true,
    char: c({ family: 'Calibri Light', size: 28, color: '#000000' }),
    para: p({ align: 'center', spaceAfter: 12, lineRule: 'single' }),
  },
  {
    id: 'subtitle',
    name: 'Подзаголовок',
    kind: 'paragraph',
    level: 0,
    tag: 'h4',
    builtin: true,
    char: c({ family: 'Calibri', size: 14, color: '#5a5a5a', italic: true }),
    para: p({ align: 'center', spaceAfter: 10 }),
  },
  {
    id: 'quote',
    name: 'Цитата',
    kind: 'paragraph',
    level: 0,
    tag: 'blockquote',
    builtin: true,
    char: c({ family: 'Calibri', size: 11, color: '#404040', italic: true }),
    para: p({ indentLeft: 1, indentRight: 1, spaceBefore: 6, spaceAfter: 6 }),
  },
  {
    id: 'strong',
    name: 'Выделение',
    kind: 'character',
    level: 0,
    tag: 'span',
    builtin: true,
    char: c({ bold: true }),
    para: {},
  },
  {
    id: 'emphasis',
    name: 'Слабое выделение',
    kind: 'character',
    level: 0,
    tag: 'span',
    builtin: true,
    char: c({ italic: true, color: '#404040' }),
    para: {},
  },
];

const STORAGE_KEY = 'pv-tekst-styles';

/** Пользовательские стили из хранилища */
export const loadCustomStyles = (): DocStyle[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DocStyle[];
    return Array.isArray(parsed) ? parsed.filter((s) => s?.id && !s.builtin) : [];
  } catch {
    return [];
  }
};

export const saveCustomStyles = (list: DocStyle[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.filter((s) => !s.builtin)));
  } catch {
    /* хранилище недоступно */
  }
};

/** Полное оформление стиля с подставленными значениями по умолчанию */
export const fullFormat = (
  style: DocStyle,
): { char: CharFormat; para: ParaFormat } => ({
  char: { ...DEFAULT_CHAR, ...style.char },
  para: { ...DEFAULT_PARA, ...style.para },
});

/** Как выглядит стиль — для образца в галерее и для применения */
export const styleCss = (style: DocStyle): React.CSSProperties => {
  const { char, para } = fullFormat(style);

  return {
    fontFamily: char.family,
    fontSize: `${char.size * PT_TO_PX}px`,
    fontWeight: char.bold ? 700 : 400,
    fontStyle: char.italic ? 'italic' : 'normal',
    color: char.color,
    textDecorationLine: char.underline !== 'none' ? 'underline' : undefined,
    textAlign: para.align,
    lineHeight: lineHeightOf(para),
  };
};

/** Записывает оформление стиля прямо в элемент */
const paint = (el: HTMLElement, style: DocStyle) => {
  const { char, para } = fullFormat(style);

  el.style.fontFamily = char.family;
  el.style.fontSize = `${char.size * PT_TO_PX}px`;
  el.style.fontWeight = char.bold ? 'bold' : 'normal';
  el.style.fontStyle = char.italic ? 'italic' : 'normal';
  el.style.color = char.color;
  el.style.textDecorationLine =
    char.underline !== 'none' ? 'underline' : 'none';

  if (style.kind === 'character') return;

  el.style.textAlign = para.align;
  el.style.marginLeft = `${para.indentLeft * CM_TO_PX}px`;
  el.style.marginRight = `${para.indentRight * CM_TO_PX}px`;
  el.style.textIndent = `${para.firstLine * CM_TO_PX}px`;
  el.style.marginTop = `${para.spaceBefore * PT_TO_PX}px`;
  el.style.marginBottom = `${para.spaceAfter * PT_TO_PX}px`;
  el.style.lineHeight = lineHeightOf(para);
};

/** Заменяет тег элемента, сохраняя содержимое и разметку стиля */
const retag = (el: HTMLElement, tag: string): HTMLElement => {
  if (el.tagName.toLowerCase() === tag) return el;

  const fresh = document.createElement(tag);
  fresh.innerHTML = el.innerHTML;
  el.replaceWith(fresh);
  return fresh;
};

/**
 * Применяет стиль. Абзацный — ко всем выделенным абзацам,
 * знаковый — к выделенному тексту.
 */
export const applyStyle = (
  root: HTMLElement | null,
  style: DocStyle,
): number => {
  if (!root) return 0;

  if (style.kind === 'character') {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || sel.getRangeAt(0).collapsed) return 0;

    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    span.setAttribute('data-style', style.id);
    paint(span, style);

    try {
      span.appendChild(range.extractContents());
      range.insertNode(span);
      return 1;
    } catch {
      return 0;
    }
  }

  const list = selectedParagraphs(root);
  if (!list.length) return 0;

  list.forEach((el) => {
    /* пункт списка тегом не меняем — иначе развалится сам список */
    const target = el.tagName === 'LI' ? el : retag(el, style.tag);
    target.setAttribute('data-style', style.id);

    /* уровень нужен оглавлению и области навигации */
    if (style.level > 0) target.setAttribute('data-level', String(style.level));
    else target.removeAttribute('data-level');

    paint(target, style);
  });

  return list.length;
};

/** Убирает стиль и возвращает абзацу обычный вид */
export const clearStyle = (root: HTMLElement | null): number => {
  const list = selectedParagraphs(root);

  list.forEach((el) => {
    el.removeAttribute('data-style');
    el.removeAttribute('style');
  });

  return list.length;
};

/** Стиль абзаца, в котором стоит курсор */
export const currentStyleId = (
  root: HTMLElement | null,
  styles: DocStyle[],
): string => {
  const list = selectedParagraphs(root);
  const el = list[0];
  if (!el) return 'normal';

  const marked = el.getAttribute('data-style');
  if (marked && styles.some((s) => s.id === marked)) return marked;

  /* без пометки определяем стиль по тегу */
  const tag = el.tagName.toLowerCase();
  const byTag = styles.find((s) => s.kind === 'paragraph' && s.tag === tag);

  return byTag?.id ?? 'normal';
};

/** Собирает стиль из оформления выделенного текста */
export const styleFromSelection = (
  name: string,
  char: CharFormat,
  para: ParaFormat,
  kind: 'paragraph' | 'character',
): DocStyle => ({
  id: `style-${Date.now()}`,
  name,
  kind,
  level: 0,
  tag: kind === 'character' ? 'span' : 'p',
  builtin: false,
  char,
  para,
});

/** Пересчитывает документ после изменения стиля: находит все абзацы с ним */
export const repaintStyle = (
  root: HTMLElement | null,
  style: DocStyle,
): number => {
  if (!root) return 0;

  const marked = Array.from(
    root.querySelectorAll<HTMLElement>(`[data-style="${style.id}"]`),
  );

  marked.forEach((el) => paint(el, style));
  return marked.length;
};