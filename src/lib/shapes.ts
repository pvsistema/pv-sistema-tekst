/** Вид фигуры */
export type ShapeKind =
  | 'rect'
  | 'round'
  | 'ellipse'
  | 'triangle'
  | 'diamond'
  | 'pentagon'
  | 'star'
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-up'
  | 'arrow-down'
  | 'callout'
  | 'line';

/** Как текст обтекает объект */
export type WrapMode =
  | 'inline'
  | 'square'
  | 'tight'
  | 'top-bottom'
  | 'behind'
  | 'front';

export const WRAP_LABELS: { value: WrapMode; label: string; icon: string }[] = [
  { value: 'inline', label: 'В тексте', icon: 'AlignLeft' },
  { value: 'square', label: 'Вокруг рамки', icon: 'Square' },
  { value: 'tight', label: 'По контуру', icon: 'Hexagon' },
  { value: 'top-bottom', label: 'Сверху и снизу', icon: 'Rows3' },
  { value: 'behind', label: 'За текстом', icon: 'Layers' },
  { value: 'front', label: 'Перед текстом', icon: 'Copy' },
];

export const SHAPE_GROUPS: {
  title: string;
  items: { kind: ShapeKind; label: string }[];
}[] = [
  {
    title: 'Основные фигуры',
    items: [
      { kind: 'rect', label: 'Прямоугольник' },
      { kind: 'round', label: 'Скруглённый прямоугольник' },
      { kind: 'ellipse', label: 'Овал' },
      { kind: 'triangle', label: 'Треугольник' },
      { kind: 'diamond', label: 'Ромб' },
      { kind: 'pentagon', label: 'Пятиугольник' },
      { kind: 'star', label: 'Звезда' },
    ],
  },
  {
    title: 'Стрелки',
    items: [
      { kind: 'arrow-right', label: 'Стрелка вправо' },
      { kind: 'arrow-left', label: 'Стрелка влево' },
      { kind: 'arrow-up', label: 'Стрелка вверх' },
      { kind: 'arrow-down', label: 'Стрелка вниз' },
    ],
  },
  {
    title: 'Прочее',
    items: [
      { kind: 'line', label: 'Линия' },
      { kind: 'callout', label: 'Выноска' },
    ],
  },
];

/** Контур фигуры для CSS clip-path */
export const shapeClip = (kind: ShapeKind): string => {
  switch (kind) {
    case 'triangle':
      return 'polygon(50% 0%, 100% 100%, 0% 100%)';
    case 'diamond':
      return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
    case 'pentagon':
      return 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)';
    case 'star':
      return (
        'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, ' +
        '50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
      );
    case 'arrow-right':
      return 'polygon(0% 25%, 60% 25%, 60% 0%, 100% 50%, 60% 100%, 60% 75%, 0% 75%)';
    case 'arrow-left':
      return 'polygon(40% 0%, 40% 25%, 100% 25%, 100% 75%, 40% 75%, 40% 100%, 0% 50%)';
    case 'arrow-up':
      return 'polygon(50% 0%, 100% 40%, 75% 40%, 75% 100%, 25% 100%, 25% 40%, 0% 40%)';
    case 'arrow-down':
      return 'polygon(25% 0%, 75% 0%, 75% 60%, 100% 60%, 50% 100%, 0% 60%, 25% 60%)';
    case 'callout':
      return 'polygon(0% 0%, 100% 0%, 100% 75%, 30% 75%, 15% 100%, 15% 75%, 0% 75%)';
    default:
      return '';
  }
};

export interface ShapeStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  /** Прозрачность заливки, 0–100 */
  opacity: number;
}

export const DEFAULT_SHAPE_STYLE: ShapeStyle = {
  fill: '#4472c4',
  stroke: '#2f5496',
  strokeWidth: 1,
  opacity: 100,
};

/** Готовые наборы оформления — «Стили фигур» в Word */
export const SHAPE_PRESETS: { label: string; style: ShapeStyle }[] = [
  { label: 'Синяя заливка', style: DEFAULT_SHAPE_STYLE },
  {
    label: 'Без заливки',
    style: { fill: 'transparent', stroke: '#2f5496', strokeWidth: 2, opacity: 100 },
  },
  {
    label: 'Серая',
    style: { fill: '#e7e6e6', stroke: '#a6a6a6', strokeWidth: 1, opacity: 100 },
  },
  {
    label: 'Оранжевая',
    style: { fill: '#ed7d31', stroke: '#c55a11', strokeWidth: 1, opacity: 100 },
  },
  {
    label: 'Зелёная',
    style: { fill: '#70ad47', stroke: '#507e32', strokeWidth: 1, opacity: 100 },
  },
  {
    label: 'Полупрозрачная',
    style: { fill: '#4472c4', stroke: '#2f5496', strokeWidth: 1, opacity: 40 },
  },
];

/** Готовые начертания WordArt */
export const WORDART_STYLES: { label: string; css: string }[] = [
  {
    label: 'Синий с тенью',
    css: 'color:#2f5496;text-shadow:2px 2px 0 #bfbfbf',
  },
  {
    label: 'Контурный',
    css: 'color:#fff;-webkit-text-stroke:1.5px #2f5496;text-shadow:none',
  },
  {
    label: 'Градиент',
    css:
      'background:linear-gradient(90deg,#4472c4,#ed7d31);' +
      '-webkit-background-clip:text;background-clip:text;color:transparent',
  },
  {
    label: 'Объёмный',
    css: 'color:#c55a11;text-shadow:1px 1px 0 #843c0c,2px 2px 0 #843c0c,3px 3px 4px rgba(0,0,0,.35)',
  },
  {
    label: 'Тиснение',
    css: 'color:#7f7f7f;text-shadow:1px 1px 0 #fff,-1px -1px 0 #404040',
  },
  {
    label: 'Красный контур',
    css: 'color:#c00000;text-shadow:0 0 1px #fff,2px 2px 3px rgba(0,0,0,.3)',
  },
];

export interface ShapeInsert {
  kind: ShapeKind;
  width: number;
  height: number;
  style: ShapeStyle;
  /** Подпись внутри фигуры */
  text?: string;
  wrap: WrapMode;
}

/** Строит разметку фигуры для вставки в документ */
export const shapeHtml = (o: ShapeInsert): string => {
  const clip = shapeClip(o.kind);
  const s = o.style;

  const radius =
    o.kind === 'round' ? '10px' : o.kind === 'ellipse' ? '50%' : '0';

  /* линия — это тонкая полоска без заливки */
  if (o.kind === 'line') {
    return objectHtml({
      wrap: o.wrap,
      width: o.width,
      height: Math.max(2, s.strokeWidth),
      inner:
        `<div style="width:100%;height:${Math.max(1, s.strokeWidth)}px;` +
        `background:${s.stroke};margin-top:${o.height / 2}px"></div>`,
      kind: 'shape',
      extra: `height:${o.height}px`,
    });
  }

  const box =
    `<div class="pv-shape-body" style="width:100%;height:100%;` +
    `background:${s.fill};opacity:${s.opacity / 100};` +
    (clip
      ? `clip-path:${clip};`
      : `border:${s.strokeWidth}px solid ${s.stroke};border-radius:${radius};`) +
    `display:flex;align-items:center;justify-content:center"></div>`;

  /* подпись лежит поверх фигуры, чтобы прозрачность её не затрагивала */
  const caption = o.text
    ? `<div class="pv-shape-text" style="position:absolute;inset:0;display:flex;` +
      `align-items:center;justify-content:center;text-align:center;padding:6px;` +
      `font-size:13px;color:#fff;pointer-events:none">${escapeHtml(o.text)}</div>`
    : '';

  return objectHtml({
    wrap: o.wrap,
    width: o.width,
    height: o.height,
    inner: box + caption,
    kind: 'shape',
  });
};

/** Надпись — рамка с текстом, который можно править */
export const textBoxHtml = (o: {
  width: number;
  height: number;
  wrap: WrapMode;
  text: string;
  border: boolean;
  fill: string;
}): string =>
  objectHtml({
    wrap: o.wrap,
    width: o.width,
    height: o.height,
    kind: 'textbox',
    inner:
      `<div class="pv-textbox-body" contenteditable="true" style="width:100%;height:100%;` +
      `box-sizing:border-box;padding:8px;overflow:auto;background:${o.fill};` +
      (o.border ? 'border:1px solid #7f7f7f;' : '') +
      `outline:none">${escapeHtml(o.text)}</div>`,
  });

/** Фигурный текст */
export const wordArtHtml = (o: {
  text: string;
  css: string;
  size: number;
  wrap: WrapMode;
}): string =>
  objectHtml({
    wrap: o.wrap,
    width: Math.max(160, o.text.length * o.size * 0.62),
    height: o.size * 1.5,
    kind: 'wordart',
    inner:
      `<span class="pv-wordart-body" style="display:inline-block;` +
      `font-size:${o.size}px;font-weight:700;font-family:Georgia,serif;` +
      `line-height:1.3;white-space:nowrap;${o.css}">` +
      `${escapeHtml(o.text)}</span>`,
  });

/** Общая обёртка объекта: обтекание, размеры, маркер выделения */
const objectHtml = (o: {
  wrap: WrapMode;
  width: number;
  height: number;
  inner: string;
  kind: string;
  extra?: string;
}): string => {
  const style =
    `width:${Math.round(o.width)}px;height:${Math.round(o.height)}px;` +
    wrapCss(o.wrap) +
    (o.extra ?? '');

  /* маркер размера прячется стилями, пока объект не выделен */
  const handle =
    '<span class="pv-object-handle" contenteditable="false"></span>';

  return (
    `<span class="pv-object" data-object="${o.kind}" data-wrap="${o.wrap}" ` +
    `style="${style}">${o.inner}${handle}</span>`
  );
};

/** Стили обтекания текстом */
export const wrapCss = (wrap: WrapMode): string => {
  switch (wrap) {
    case 'square':
    case 'tight':
      return 'float:left;margin:4px 12px 8px 0;';
    case 'top-bottom':
      return 'display:block;margin:10px auto;';
    case 'behind':
      return 'position:absolute;z-index:0;margin:0;';
    case 'front':
      return 'position:absolute;z-index:5;margin:0;';
    default:
      return 'display:inline-block;vertical-align:middle;margin:0 4px;';
  }
};

/** Меняет обтекание у выбранного объекта */
export const applyWrap = (el: HTMLElement, wrap: WrapMode) => {
  /* сбрасываем всё, что могло остаться от прошлого режима */
  [
    'float',
    'margin',
    'display',
    'position',
    'z-index',
    'vertical-align',
    'left',
    'top',
  ].forEach((prop) => el.style.removeProperty(prop));

  el.dataset.wrap = wrap;

  const css = wrapCss(wrap);
  css.split(';').forEach((rule) => {
    const [prop, value] = rule.split(':');
    if (prop && value) el.style.setProperty(prop.trim(), value.trim());
  });

  el.style.width = el.style.width || 'auto';
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
