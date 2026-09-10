/** Что печатать: весь документ, текущую страницу или свой набор */
export type PrintRange = 'all' | 'current' | 'custom' | 'odd' | 'even';

/** Сколько страниц умещать на одном листе */
export type PagesPerSheet = 1 | 2 | 4 | 6 | 9;

export interface PrintSetup {
  copies: number;
  range: PrintRange;
  /** Набор страниц вида «1-3, 5, 8-» */
  pagesText: string;
  /** Печать с двух сторон листа */
  duplex: boolean;
  /** Разбирать по копиям: 1,2,3 1,2,3 вместо 1,1 2,2 3,3 */
  collate: boolean;
  pagesPerSheet: PagesPerSheet;
  /** Масштаб содержимого, проценты */
  scale: number;
  /** Печатать цвет фона и заливку */
  background: boolean;
  /** Печатать рисунки */
  drawings: boolean;
  paper: 'A4' | 'A5' | 'Letter';
}

export const DEFAULT_PRINT: PrintSetup = {
  copies: 1,
  range: 'all',
  pagesText: '',
  duplex: false,
  collate: true,
  pagesPerSheet: 1,
  scale: 100,
  background: true,
  drawings: true,
  paper: 'A4',
};

/** Размеры листа в миллиметрах */
export const PAPER_SIZES: Record<PrintSetup['paper'], [number, number]> = {
  A4: [210, 297],
  A5: [148, 210],
  Letter: [216, 279],
};

export const PAPER_LABELS: { value: PrintSetup['paper']; label: string }[] = [
  { value: 'A4', label: 'A4 (210 × 297 мм)' },
  { value: 'A5', label: 'A5 (148 × 210 мм)' },
  { value: 'Letter', label: 'Letter (216 × 279 мм)' },
];

/**
 * Разбирает строку вида «1-3, 5, 8-» в список номеров страниц.
 * Пустая строка или мусор дают весь документ.
 */
export const parsePageRange = (text: string, total: number): number[] => {
  const clean = text.trim();
  if (!clean) return all(total);

  const result = new Set<number>();

  for (const part of clean.split(/[,;]/)) {
    const chunk = part.trim();
    if (!chunk) continue;

    /* открытый интервал: «8-» до конца документа */
    const open = chunk.match(/^(\d+)\s*-\s*$/);
    if (open) {
      for (let i = Number(open[1]); i <= total; i += 1) add(result, i, total);
      continue;
    }

    /* интервал «1-3» */
    const span = chunk.match(/^(\d+)\s*-\s*(\d+)$/);
    if (span) {
      const from = Math.min(Number(span[1]), Number(span[2]));
      const to = Math.max(Number(span[1]), Number(span[2]));
      for (let i = from; i <= to; i += 1) add(result, i, total);
      continue;
    }

    /* одиночная страница */
    const one = chunk.match(/^\d+$/);
    if (one) add(result, Number(chunk), total);
  }

  const list = [...result].sort((a, b) => a - b);
  return list.length ? list : all(total);
};

const all = (total: number) =>
  Array.from({ length: Math.max(1, total) }, (_, i) => i + 1);

const add = (set: Set<number>, page: number, total: number) => {
  if (page >= 1 && page <= total) set.add(page);
};

/** Какие страницы уйдут на печать с учётом всех настроек */
export const pagesToPrint = (
  s: PrintSetup,
  total: number,
  current: number,
): number[] => {
  if (s.range === 'current') return [Math.min(Math.max(1, current), total)];

  const base =
    s.range === 'custom' ? parsePageRange(s.pagesText, total) : all(total);

  if (s.range === 'odd') return base.filter((p) => p % 2 === 1);
  if (s.range === 'even') return base.filter((p) => p % 2 === 0);

  return base;
};

/** Порядок листов с учётом копий и разбора */
export const printOrder = (pages: number[], s: PrintSetup): number[] => {
  const copies = Math.max(1, s.copies);
  if (copies === 1) return pages;

  /* разобрать по копиям: весь документ целиком, потом ещё раз */
  if (s.collate) {
    return Array.from({ length: copies }, () => pages).flat();
  }

  /* не разбирать: каждая страница печатается подряд нужное число раз */
  return pages.flatMap((p) => Array.from({ length: copies }, () => p));
};

/** Как разложить страницы по сетке при нескольких на листе */
export const sheetGrid = (per: PagesPerSheet): [number, number] => {
  switch (per) {
    case 2:
      return [1, 2];
    case 4:
      return [2, 2];
    case 6:
      return [2, 3];
    case 9:
      return [3, 3];
    default:
      return [1, 1];
  }
};

/** Понятная подпись выбранного диапазона */
export const rangeLabel = (s: PrintSetup, total: number): string => {
  switch (s.range) {
    case 'current':
      return 'Только текущая страница';
    case 'odd':
      return 'Только нечётные страницы';
    case 'even':
      return 'Только чётные страницы';
    case 'custom': {
      const list = parsePageRange(s.pagesText, total);
      return s.pagesText.trim()
        ? `Страниц: ${list.length}`
        : 'Укажите номера страниц';
    }
    default:
      return `Все страницы: ${total}`;
  }
};

/**
 * Собирает страницу для печати: содержимое режется на листы,
 * лишние страницы выбрасываются, копии повторяются.
 */
export interface PrintDocOptions {
  /** Разметка документа */
  body: string;
  title: string;
  setup: PrintSetup;
  /** Стили страницы: поля, колонтитулы, рамка */
  pageCss: string;
  /** Дополнительные стили документа */
  bodyCss: string;
  /** Полезная высота одной страницы в пикселях */
  contentHeight: number;
  /** Ширина полосы набора в пикселях */
  contentWidth: number;
  /** Полная ширина листа и поля, пиксели */
  pageWidth: number;
  pageHeight: number;
  padding: number;
  pages: number[];
  landscape: boolean;
}

export const buildPrintHtml = (o: PrintDocOptions): string => {
  const { setup: s } = o;
  const [cols, rows] = sheetGrid(s.pagesPerSheet);
  const many = s.pagesPerSheet > 1;

  /*
   * При одной странице на листе печатаем обычным потоком — браузер сам
   * разложит текст. При нескольких режем документ на листы вручную.
   */
  /* уменьшаем каждую страницу, чтобы она поместилась в свою ячейку */
  const cellScale = 1 / Math.max(cols, rows);

  const sheets = many
    ? buildSheets(o, cols, rows, cellScale)
    : `<div class="pv-flow">${o.body}</div>`;

  const hidden = s.background
    ? ''
    : '*{background:transparent !important;box-shadow:none !important}';

  const noArt = s.drawings ? '' : 'img,svg,figure{display:none !important}';

  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${escapeHtml(
    o.title,
  )}</title><style>
${o.pageCss}
body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.5;margin:0;zoom:${s.scale / 100}}
${o.bodyCss}
${hidden}
${noArt}
table{border-collapse:collapse;width:100%}
td,th{border:1px solid #999;padding:6px}
h1,h2,h3{page-break-after:avoid}
.pv-sheet{page-break-after:always;display:grid;gap:6mm;box-sizing:border-box}
.pv-cell{overflow:hidden;position:relative;border:0}
.pv-cell .pv-frame{position:absolute;left:0;top:0;box-sizing:border-box;
transform-origin:top left;overflow:hidden}
.pv-sheet:last-child{page-break-after:auto}
</style></head><body>${sheets}</body></html>`;
};

/** Раскладывает страницы по листам сеткой */
const buildSheets = (
  o: PrintDocOptions,
  cols: number,
  rows: number,
  scale: number,
): string => {
  const perSheet = cols * rows;
  const out: string[] = [];

  for (let i = 0; i < o.pages.length; i += perSheet) {
    const chunk = o.pages.slice(i, i + perSheet);

    const cells = chunk
      .map((page) => {
        /*
         * Поля страницы остаются на месте, а текст внутри них скользит
         * вверх — иначе сдвиг съедает верхнее поле.
         */
        const shift = (page - 1) * o.contentHeight;
        return (
          `<div class="pv-cell"><div class="pv-frame" style="padding:${o.padding}px;` +
          `width:${o.pageWidth}px;height:${o.pageHeight}px;transform:scale(${scale})">` +
          `<div style="margin-top:-${shift}px;width:${o.contentWidth}px">` +
          `${o.body}</div></div></div>`
        );
      })
      .join('');

    out.push(
      `<div class="pv-sheet" style="grid-template-columns:repeat(${cols},1fr);` +
        `grid-template-rows:repeat(${rows},1fr);` +
        `width:${o.pageWidth}px;height:${o.pageHeight}px">${cells}</div>`,
    );
  }

  return out.join('');
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');