/** Сантиметр в точках экрана при 96 dpi */
export const CM_PX = 37.8;

/** Размер бумаги в сантиметрах */
export interface PaperSize {
  id: string;
  label: string;
  width: number;
  height: number;
}

/** Стандартные форматы: первые четыре — самые ходовые */
export const PAPER_SIZES: PaperSize[] = [
  { id: 'a4', label: 'A4', width: 21, height: 29.7 },
  { id: 'a5', label: 'A5', width: 14.8, height: 21 },
  { id: 'a3', label: 'A3', width: 29.7, height: 42 },
  { id: 'letter', label: 'Letter', width: 21.59, height: 27.94 },
  { id: 'legal', label: 'Legal', width: 21.59, height: 35.56 },
  { id: 'b5', label: 'B5', width: 17.6, height: 25 },
  { id: 'a6', label: 'A6', width: 10.5, height: 14.8 },
  { id: 'card', label: 'Визитная карточка', width: 9, height: 5 },
  { id: 'booklet', label: 'Буклет 10 × 15', width: 10, height: 15 },
  { id: 'envelope-c5', label: 'Конверт C5', width: 22.9, height: 16.2 },
  { id: 'envelope-dl', label: 'Конверт DL', width: 22, height: 11 },
];

export const CUSTOM_SIZE_ID = 'custom';

/** Поля страницы в сантиметрах */
export interface Margins {
  top: number;
  bottom: number;
  left: number;
  right: number;
  /** Переплёт — дополнительный отступ под подшивку */
  gutter: number;
}

/** Готовые наборы полей — меню «Поля» в Word */
export const MARGIN_PRESETS: {
  id: string;
  label: string;
  hint: string;
  margins: Margins;
}[] = [
  {
    id: 'normal',
    label: 'Обычные',
    hint: 'Сверху и снизу 2 см, слева и справа 2 см',
    margins: { top: 2, bottom: 2, left: 2, right: 2, gutter: 0 },
  },
  {
    id: 'narrow',
    label: 'Узкие',
    hint: 'Со всех сторон 1,27 см',
    margins: { top: 1.27, bottom: 1.27, left: 1.27, right: 1.27, gutter: 0 },
  },
  {
    id: 'moderate',
    label: 'Средние',
    hint: 'Сверху и снизу 2,54 см, слева и справа 1,91 см',
    margins: { top: 2.54, bottom: 2.54, left: 1.91, right: 1.91, gutter: 0 },
  },
  {
    id: 'wide',
    label: 'Широкие',
    hint: 'Сверху и снизу 2,54 см, слева и справа 5,08 см',
    margins: { top: 2.54, bottom: 2.54, left: 5.08, right: 5.08, gutter: 0 },
  },
  {
    id: 'gost',
    label: 'По ГОСТу',
    hint: 'Слева 3 см под подшивку, справа 1,5 см',
    margins: { top: 2, bottom: 2, left: 3, right: 1.5, gutter: 0 },
  },
  {
    id: 'zero',
    label: 'Нулевые',
    hint: 'Без полей — для визиток и наклеек',
    margins: { top: 0, bottom: 0, left: 0, right: 0, gutter: 0 },
  },
];

/** Единицы измерения, как в параметрах Word */
export type Unit = 'cm' | 'mm' | 'in';

export const UNIT_LABELS: Record<Unit, string> = {
  cm: 'см',
  mm: 'мм',
  in: 'дюйм',
};

/** Переводит сантиметры в выбранные единицы */
export const fromCm = (cm: number, unit: Unit): number => {
  if (unit === 'mm') return cm * 10;
  if (unit === 'in') return cm / 2.54;
  return cm;
};

/** Переводит значение из выбранных единиц обратно в сантиметры */
export const toCm = (value: number, unit: Unit): number => {
  if (unit === 'mm') return value / 10;
  if (unit === 'in') return value * 2.54;
  return value;
};

/** Округляет до сотых — чтобы в поле не было длинного хвоста */
export const round2 = (v: number): number => Math.round(v * 100) / 100;

/** Показывает число с запятой, как принято в русском Word */
export const showNum = (v: number): string =>
  String(round2(v)).replace('.', ',');

/** Читает число, набранное с запятой или точкой */
export const readNum = (raw: string): number | null => {
  const text = raw.replace(',', '.').trim();

  /* пустое поле — не ноль, а отказ: вернём прежнее значение */
  if (!text) return null;

  const v = Number(text);
  return Number.isFinite(v) ? v : null;
};

/** Находит формат по размерам — чтобы подсветить его в списке */
export const matchPaper = (width: number, height: number): string => {
  const found = PAPER_SIZES.find(
    (p) =>
      Math.abs(p.width - width) < 0.06 && Math.abs(p.height - height) < 0.06,
  );

  return found?.id ?? CUSTOM_SIZE_ID;
};

/** Находит набор полей — чтобы отметить его в меню */
export const matchPreset = (m: Margins): string | null => {
  const found = MARGIN_PRESETS.find(
    (p) =>
      Math.abs(p.margins.top - m.top) < 0.02 &&
      Math.abs(p.margins.bottom - m.bottom) < 0.02 &&
      Math.abs(p.margins.left - m.left) < 0.02 &&
      Math.abs(p.margins.right - m.right) < 0.02,
  );

  return found?.id ?? null;
};

/**
 * Проверяет, помещается ли текст на лист. Если поля больше самой
 * бумаги, печатать будет нечего — об этом надо предупредить.
 */
export const marginsFit = (
  paper: { width: number; height: number },
  m: Margins,
  landscape: boolean,
): boolean => {
  const w = landscape ? paper.height : paper.width;
  const h = landscape ? paper.width : paper.height;

  return m.left + m.right + m.gutter < w - 1 && m.top + m.bottom < h - 1;
};

/**
 * Размер листа с учётом поворота, в точках экрана.
 * Если размер не задан, берём A4 — документ всё равно должен открыться.
 */
export const pagePixels = (
  paper: { width?: number; height?: number },
  landscape: boolean,
): { width: number; height: number } => {
  const w = paper.width && paper.width > 0 ? paper.width : 21;
  const h = paper.height && paper.height > 0 ? paper.height : 29.7;

  return {
    width: (landscape ? h : w) * CM_PX,
    height: (landscape ? w : h) * CM_PX,
  };
};