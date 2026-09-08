/** Формат номера страницы — как в окне «Формат номера страницы» Word */
export type NumberFormat =
  | 'decimal'
  | 'dash'
  | 'roman-lower'
  | 'roman-upper'
  | 'alpha-lower'
  | 'alpha-upper';

export const NUMBER_FORMAT_LABELS: { value: NumberFormat; label: string }[] = [
  { value: 'decimal', label: '1, 2, 3' },
  { value: 'dash', label: '- 1 -, - 2 -' },
  { value: 'roman-lower', label: 'i, ii, iii' },
  { value: 'roman-upper', label: 'I, II, III' },
  { value: 'alpha-lower', label: 'a, b, c' },
  { value: 'alpha-upper', label: 'A, B, C' },
];

const ROMAN: [number, string][] = [
  [1000, 'm'],
  [900, 'cm'],
  [500, 'd'],
  [400, 'cd'],
  [100, 'c'],
  [90, 'xc'],
  [50, 'l'],
  [40, 'xl'],
  [10, 'x'],
  [9, 'ix'],
  [5, 'v'],
  [4, 'iv'],
  [1, 'i'],
];

const toRoman = (n: number): string => {
  let rest = Math.max(1, n);
  let out = '';

  for (const [value, sign] of ROMAN) {
    while (rest >= value) {
      out += sign;
      rest -= value;
    }
  }
  return out;
};

/** Буквенная нумерация: a…z, затем aa, ab и так далее */
const toAlpha = (n: number): string => {
  let rest = Math.max(1, n);
  let out = '';

  while (rest > 0) {
    rest -= 1;
    out = String.fromCharCode(97 + (rest % 26)) + out;
    rest = Math.floor(rest / 26);
  }
  return out;
};

/** Превращает номер страницы в надпись выбранного формата */
export const formatNumber = (n: number, format: NumberFormat): string => {
  switch (format) {
    case 'dash':
      return `- ${n} -`;
    case 'roman-lower':
      return toRoman(n);
    case 'roman-upper':
      return toRoman(n).toUpperCase();
    case 'alpha-lower':
      return toAlpha(n);
    case 'alpha-upper':
      return toAlpha(n).toUpperCase();
    default:
      return String(n);
  }
};

/** Где стоит номер страницы */
export type NumberPosition =
  | 'none'
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/** Настройки колонтитулов документа */
export interface PageFurniture {
  headerText: string;
  footerText: string;
  headerAlign: 'left' | 'center' | 'right';
  footerAlign: 'left' | 'center' | 'right';
  /** Особый колонтитул для первой страницы — её часто не оформляют */
  differentFirst: boolean;
  numberPosition: NumberPosition;
  numberFormat: NumberFormat;
  /** С какого числа начинается нумерация */
  numberStart: number;
  /** Показывать ли номер на первой странице */
  numberOnFirst: boolean;
}

export const DEFAULT_FURNITURE: PageFurniture = {
  headerText: '',
  footerText: '',
  headerAlign: 'center',
  footerAlign: 'center',
  differentFirst: false,
  numberPosition: 'none',
  numberFormat: 'decimal',
  numberStart: 1,
  numberOnFirst: true,
};

/** Подставляет в текст колонтитула поля документа */
export const expandFields = (
  text: string,
  page: number,
  total: number,
  title: string,
): string =>
  text
    .replace(/\{СТРАНИЦА\}/gi, String(page))
    .replace(/\{ВСЕГО\}/gi, String(total))
    .replace(/\{ИМЯ\}/gi, title)
    .replace(/\{ДАТА\}/gi, new Date().toLocaleDateString('ru-RU'));
