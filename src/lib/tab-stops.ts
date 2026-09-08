import { CM_TO_PX, selectedParagraphs } from '@/lib/text-format';

/** Тип выравнивания позиции табуляции */
export type TabAlign = 'left' | 'center' | 'right' | 'decimal' | 'bar';

/** Заполнитель — чем закрашивается промежуток до позиции */
export type TabLeader = 'none' | 'dots' | 'dashes' | 'line';

export interface TabStop {
  /** Положение от левого поля, в сантиметрах */
  position: number;
  align: TabAlign;
  leader: TabLeader;
}

export const TAB_ALIGN_LABELS: { value: TabAlign; label: string; sign: string }[] = [
  { value: 'left', label: 'По левому краю', sign: '⌐' },
  { value: 'center', label: 'По центру', sign: '⊥' },
  { value: 'right', label: 'По правому краю', sign: '¬' },
  { value: 'decimal', label: 'По разделителю', sign: '⊥·' },
  { value: 'bar', label: 'С чертой', sign: '|' },
];

export const TAB_LEADER_LABELS: { value: TabLeader; label: string }[] = [
  { value: 'none', label: '(нет)' },
  { value: 'dots', label: '……… точки' },
  { value: 'dashes', label: '——— штрихи' },
  { value: 'line', label: '___ линия' },
];

/** По умолчанию позиции стоят через каждые 1,25 см */
export const DEFAULT_TAB_STEP = 1.25;

/** Читает позиции табуляции, записанные в абзаце */
export const readTabStops = (el: HTMLElement | null): TabStop[] => {
  if (!el) return [];

  const raw = el.getAttribute('data-tabs');
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as TabStop[];
    return Array.isArray(parsed)
      ? parsed.filter((t) => typeof t?.position === 'number')
      : [];
  } catch {
    return [];
  }
};

/** Записывает позиции в абзац и настраивает шаг табуляции */
export const writeTabStops = (el: HTMLElement, stops: TabStop[]) => {
  const sorted = [...stops].sort((a, b) => a.position - b.position);

  if (!sorted.length) {
    el.removeAttribute('data-tabs');
    el.style.removeProperty('tab-size');
    return;
  }

  el.setAttribute('data-tabs', JSON.stringify(sorted));

  /* до первой позиции текст доходит обычным шагом табуляции */
  el.style.tabSize = `${sorted[0].position * CM_TO_PX}px`;
};

/** Ставит позицию во все выделенные абзацы */
export const addTabStop = (
  root: HTMLElement | null,
  stop: TabStop,
): number => {
  const list = selectedParagraphs(root);

  list.forEach((el) => {
    const stops = readTabStops(el).filter(
      (t) => Math.abs(t.position - stop.position) > 0.05,
    );
    writeTabStops(el, [...stops, stop]);
  });

  return list.length;
};

/** Убирает одну позицию */
export const removeTabStop = (
  root: HTMLElement | null,
  position: number,
): number => {
  const list = selectedParagraphs(root);

  list.forEach((el) => {
    const stops = readTabStops(el).filter(
      (t) => Math.abs(t.position - position) > 0.05,
    );
    writeTabStops(el, stops);
  });

  return list.length;
};

/** Убирает все позиции в выделенных абзацах */
export const clearTabStops = (root: HTMLElement | null): number => {
  const list = selectedParagraphs(root);

  list.forEach((el) => {
    writeTabStops(el, []);
    /* заодно убираем расставленные по этим позициям вставки */
    el.querySelectorAll('.pv-tab').forEach((t) => t.replaceWith('\u0009'));
  });

  return list.length;
};

/** Ширина заполнителя в виде набора символов */
const LEADER_CHAR: Record<TabLeader, string> = {
  none: '',
  dots: '.',
  dashes: '-',
  line: '_',
};

/**
 * Вставка перехода к следующей позиции. Текст после неё выравнивается
 * так, как задано у этой позиции.
 */
export const buildTabHtml = (stop: TabStop, fromCm: number): string => {
  const width = Math.max(0.2, stop.position - fromCm);
  const leader = LEADER_CHAR[stop.leader];

  if (stop.align === 'bar') {
    return (
      `<span class="pv-tab" data-align="bar" ` +
      `style="display:inline-block;width:${width * CM_TO_PX}px;` +
      `border-right:1px solid currentColor">&nbsp;</span>`
    );
  }

  const fill = leader
    ? `<span class="pv-tab-fill" data-leader="${stop.leader}"></span>`
    : '&nbsp;';

  /*
   * Для выравнивания вправо, по центру и по разделителю текст должен
   * прижиматься к позиции, поэтому промежуток сжимается, а не тянется.
   */
  const flexible = stop.align !== 'left';

  const size = flexible
    ? `min-width:4px;max-width:${width * CM_TO_PX}px;width:${width * CM_TO_PX}px`
    : `width:${width * CM_TO_PX}px`;

  return (
    `<span class="pv-tab" data-align="${stop.align}" ` +
    `data-base="${(width * CM_TO_PX).toFixed(1)}" ` +
    `style="display:inline-block;${size};` +
    `text-align:${stop.align === 'left' ? 'left' : 'right'};` +
    `overflow:hidden;white-space:nowrap">${fill}</span>`
  );
};

/** Следующая позиция табуляции после заданной точки */
export const nextStop = (stops: TabStop[], fromCm: number): TabStop => {
  const found = stops.find((t) => t.position > fromCm + 0.05);
  if (found) return found;

  /* дальше позиций нет — идём стандартным шагом */
  const step = DEFAULT_TAB_STEP;
  return {
    position: Math.ceil((fromCm + 0.05) / step) * step,
    align: 'left',
    leader: 'none',
  };
};

/**
 * Насколько текст уже отошёл от левого поля. Считаем по ширине
 * содержимого до курсора — этого хватает для расстановки позиций.
 */
export const cursorOffsetCm = (root: HTMLElement | null): number => {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || !root) return 0;

  const range = sel.getRangeAt(0).cloneRange();
  range.collapse(true);

  const rect = range.getBoundingClientRect();
  const base = root.getBoundingClientRect();

  if (!rect.width && !rect.height && !rect.left) return 0;

  const padding = parseFloat(window.getComputedStyle(root).paddingLeft) || 0;
  return Math.max(0, (rect.left - base.left - padding) / CM_TO_PX);
};

/** Ширина текста тем же шрифтом, что у элемента */
const measure = (text: string, sample: HTMLElement): number => {
  const probe = document.createElement('span');
  const cs = window.getComputedStyle(sample);

  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.whiteSpace = 'pre';
  probe.style.font = cs.font || `${cs.fontSize} ${cs.fontFamily}`;
  probe.textContent = text;

  document.body.appendChild(probe);
  const width = probe.getBoundingClientRect().width;
  probe.remove();

  return width;
};

/** Текст, идущий сразу за позицией табуляции, до следующей позиции */
const textAfter = (cell: HTMLElement): string => {
  let out = '';
  let node = cell.nextSibling;

  while (node) {
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      (node as HTMLElement).classList.contains('pv-tab')
    ) {
      break;
    }
    out += node.textContent ?? '';
    node = node.nextSibling;
  }

  return out;
};

/**
 * Подгоняет промежутки под выбранный тип выравнивания: вправо — текст
 * упирается в позицию, по центру — делится пополам, по разделителю —
 * запятые встают в столбик.
 */
export const alignDecimals = (root: HTMLElement | null): number => {
  if (!root) return 0;

  const cells = Array.from(
    root.querySelectorAll<HTMLElement>('.pv-tab[data-align]'),
  ).filter((c) => c.dataset.align !== 'left' && c.dataset.align !== 'bar');

  let touched = 0;

  cells.forEach((cell) => {
    const full =
      Number(cell.getAttribute('data-base')) || parseFloat(cell.style.width) || 0;
    if (!full) return;

    const text = textAfter(cell);
    const sample = cell.parentElement ?? cell;

    let shift = 0;

    if (cell.dataset.align === 'decimal') {
      /* до разделителя — целая часть числа */
      const match = text.match(/^\s*(-?\d[\d\s\u00a0]*)/);
      shift = match ? measure(match[1].trim(), sample) : 0;
    } else if (cell.dataset.align === 'right') {
      shift = measure(text.trim(), sample);
    } else if (cell.dataset.align === 'center') {
      shift = measure(text.trim(), sample) / 2;
    }

    const width = Math.max(4, full - shift);
    if (Math.abs(parseFloat(cell.style.width) - width) < 0.5) return;

    cell.style.width = `${width.toFixed(1)}px`;
    touched += 1;
  });

  return touched;
};