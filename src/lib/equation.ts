/** Вид структуры формулы — группы «Структуры» в Word */
export type StructureKind =
  | 'fraction'
  | 'script'
  | 'radical'
  | 'integral'
  | 'operator'
  | 'bracket'
  | 'function'
  | 'accent'
  | 'limit'
  | 'matrix';

export interface StructureItem {
  /** Что вставится в формулу */
  html: string;
  /** Подпись для подсказки */
  label: string;
}

export interface StructureGroup {
  kind: StructureKind;
  title: string;
  icon: string;
  items: StructureItem[];
}

/**
 * Место для ввода внутри формулы. Пустое поле рисуется пунктирным
 * квадратиком — так его показывает Word.
 */
export const SLOT = '<span class="pv-eq-slot" contenteditable="true"></span>';

const slot = (text = '') =>
  text
    ? `<span class="pv-eq-slot" contenteditable="true">${text}</span>`
    : SLOT;

/** Дробь: числитель над знаменателем */
export const fraction = (top = '', bottom = ''): string =>
  `<span class="pv-eq-frac" contenteditable="false">` +
  `<span class="pv-eq-num">${slot(top)}</span>` +
  `<span class="pv-eq-den">${slot(bottom)}</span></span>`;

/** Наклонная дробь: a⁄b */
export const skewFraction = (top = '', bottom = ''): string =>
  `<span class="pv-eq-skew" contenteditable="false">${slot(top)}` +
  `<span class="pv-eq-slash">⁄</span>${slot(bottom)}</span>`;

/** Индексы: верхний, нижний или оба сразу */
export const script = (
  base = '',
  sup = '',
  sub = '',
): string => {
  const marks =
    sup && sub
      ? `<span class="pv-eq-scripts"><span class="pv-eq-sup">${slot(sup)}</span>` +
        `<span class="pv-eq-sub">${slot(sub)}</span></span>`
      : sup
        ? `<span class="pv-eq-sup">${slot(sup)}</span>`
        : `<span class="pv-eq-sub">${slot(sub)}</span>`;

  return (
    `<span class="pv-eq-script" contenteditable="false">${slot(base)}${marks}</span>`
  );
};

/** Корень: квадратный или степени n */
export const radical = (body = '', degree = ''): string =>
  `<span class="pv-eq-radical" contenteditable="false">` +
  (degree ? `<span class="pv-eq-degree">${slot(degree)}</span>` : '') +
  `<span class="pv-eq-sign">√</span>` +
  `<span class="pv-eq-under">${slot(body)}</span></span>`;

/**
 * Крупный знак с пределами: интеграл, сумма, произведение.
 * Пределы ставятся сверху и снизу либо сбоку — как в Word.
 */
export const bigOperator = (
  sign: string,
  o: {
    from?: string;
    to?: string;
    body?: string;
    side?: boolean;
    /** Без поля для подынтегрального выражения — для готовых формул */
    noBody?: boolean;
  } = {},
): string => {
  const limits = o.side
    ? `<span class="pv-eq-scripts">` +
      (o.to !== undefined ? `<span class="pv-eq-sup">${slot(o.to)}</span>` : '') +
      (o.from !== undefined
        ? `<span class="pv-eq-sub">${slot(o.from)}</span>`
        : '') +
      `</span>`
    : `<span class="pv-eq-stack">` +
      (o.to !== undefined ? `<span class="pv-eq-over">${slot(o.to)}</span>` : '') +
      `<span class="pv-eq-sign pv-eq-big">${sign}</span>` +
      (o.from !== undefined
        ? `<span class="pv-eq-under-limit">${slot(o.from)}</span>`
        : '') +
      `</span>`;

  const head = o.side
    ? `<span class="pv-eq-sign pv-eq-big">${sign}</span>${limits}`
    : limits;

  const body = o.noBody
    ? ''
    : `<span class="pv-eq-body">${slot(o.body ?? '')}</span>`;

  return `<span class="pv-eq-op" contenteditable="false">${head}${body}</span>`;
};

/** Скобки нужной формы вокруг содержимого */
export const bracket = (left: string, right: string, body = ''): string =>
  `<span class="pv-eq-bracket" contenteditable="false">` +
  `<span class="pv-eq-paren">${left}</span>${slot(body)}` +
  `<span class="pv-eq-paren">${right}</span></span>`;

/** Диакритический знак над буквой: вектор, крышка, черта */
export const accent = (mark: string, body = ''): string =>
  `<span class="pv-eq-accent" contenteditable="false">` +
  `<span class="pv-eq-mark">${mark}</span>${slot(body)}</span>`;

/** Предел и логарифм: подпись под знаком */
export const limit = (
  name: string,
  under = '',
  body = '',
  noBody = false,
): string =>
  `<span class="pv-eq-op" contenteditable="false">` +
  `<span class="pv-eq-stack"><span class="pv-eq-name">${name}</span>` +
  `<span class="pv-eq-under-limit">${slot(under)}</span></span>` +
  (noBody ? '' : `<span class="pv-eq-body">${slot(body)}</span>`) +
  `</span>`;

/** Матрица заданного размера в скобках */
export const matrix = (
  rows: number,
  cols: number,
  left = '(',
  right = ')',
): string => {
  const cells = Array.from({ length: rows }, () =>
    `<span class="pv-eq-row">${Array.from({ length: cols }, () => slot()).join(
      '',
    )}</span>`,
  ).join('');

  return (
    `<span class="pv-eq-bracket" contenteditable="false">` +
    `<span class="pv-eq-paren pv-eq-tall">${left}</span>` +
    `<span class="pv-eq-matrix">${cells}</span>` +
    `<span class="pv-eq-paren pv-eq-tall">${right}</span></span>`
  );
};

/** Функция с аргументом: sin, cos и прочие */
export const func = (name: string, body = ''): string =>
  `<span class="pv-eq-func" contenteditable="false">` +
  `<span class="pv-eq-name">${name}</span>${slot(body)}</span>`;

/** Все структуры, разложенные по группам */
export const STRUCTURES: StructureGroup[] = [
  {
    kind: 'fraction',
    title: 'Дробь',
    icon: 'Divide',
    items: [
      { label: 'Обычная дробь', html: fraction() },
      { label: 'Наклонная дробь', html: skewFraction() },
      { label: 'Дифференциал dy/dx', html: fraction('dy', 'dx') },
      { label: 'Половина', html: fraction('1', '2') },
    ],
  },
  {
    kind: 'script',
    title: 'Индекс',
    icon: 'Superscript',
    items: [
      { label: 'Верхний индекс', html: script('', ' ', '') },
      { label: 'Нижний индекс', html: script('', '', ' ') },
      { label: 'Верхний и нижний', html: script('', ' ', ' ') },
      { label: 'Квадрат', html: script('x', '2', '') },
    ],
  },
  {
    kind: 'radical',
    title: 'Радикал',
    icon: 'Radical',
    items: [
      { label: 'Квадратный корень', html: radical() },
      { label: 'Корень степени n', html: radical('', 'n') },
      { label: 'Кубический корень', html: radical('', '3') },
    ],
  },
  {
    kind: 'integral',
    title: 'Интеграл',
    icon: 'Sigma',
    items: [
      { label: 'Интеграл', html: bigOperator('∫', { side: true }) },
      {
        label: 'Определённый интеграл',
        html: bigOperator('∫', { from: 'a', to: 'b', side: true }),
      },
      { label: 'Двойной интеграл', html: bigOperator('∬', { side: true }) },
      { label: 'Тройной интеграл', html: bigOperator('∭', { from: 'V', side: true }) },
      { label: 'Контурный интеграл', html: bigOperator('∮', { side: true }) },
    ],
  },
  {
    kind: 'operator',
    title: 'Крупный оператор',
    icon: 'Sigma',
    items: [
      { label: 'Сумма', html: bigOperator('∑', { from: 'i=1', to: 'n' }) },
      { label: 'Произведение', html: bigOperator('∏', { from: 'i=1', to: 'n' }) },
      { label: 'Объединение', html: bigOperator('⋃', { from: 'i=1', to: 'n' }) },
      { label: 'Пересечение', html: bigOperator('⋂', { from: 'i=1', to: 'n' }) },
    ],
  },
  {
    kind: 'bracket',
    title: 'Скобка',
    icon: 'Parentheses',
    items: [
      { label: 'Круглые скобки', html: bracket('(', ')') },
      { label: 'Квадратные скобки', html: bracket('[', ']') },
      { label: 'Фигурные скобки', html: bracket('{', '}') },
      { label: 'Модуль', html: bracket('|', '|') },
      { label: 'Норма', html: bracket('‖', '‖') },
      { label: 'Угловые скобки', html: bracket('⟨', '⟩') },
    ],
  },
  {
    kind: 'function',
    title: 'Функция',
    icon: 'FunctionSquare',
    items: [
      { label: 'Синус', html: func('sin') },
      { label: 'Косинус', html: func('cos') },
      { label: 'Тангенс', html: func('tg') },
      { label: 'Логарифм', html: func('log') },
      { label: 'Натуральный логарифм', html: func('ln') },
      { label: 'Экспонента', html: func('exp') },
    ],
  },
  {
    kind: 'accent',
    title: 'Диакритические знаки',
    icon: 'Type',
    items: [
      { label: 'Черта сверху', html: accent('‾') },
      { label: 'Вектор', html: accent('→') },
      { label: 'Крышка', html: accent('^') },
      { label: 'Тильда', html: accent('~') },
      { label: 'Точка', html: accent('˙') },
      { label: 'Две точки', html: accent('¨') },
    ],
  },
  {
    kind: 'limit',
    title: 'Предел и логарифм',
    icon: 'MoveRight',
    items: [
      { label: 'Предел', html: limit('lim', 'x→∞') },
      { label: 'Предел при x→0', html: limit('lim', 'x→0') },
      { label: 'Максимум', html: limit('max', 'i') },
      { label: 'Минимум', html: limit('min', 'i') },
    ],
  },
  {
    kind: 'matrix',
    title: 'Матрица',
    icon: 'Grid3x3',
    items: [
      { label: 'Матрица 2×2', html: matrix(2, 2) },
      { label: 'Матрица 3×3', html: matrix(3, 3) },
      { label: 'Определитель 2×2', html: matrix(2, 2, '|', '|') },
      { label: 'Вектор-столбец', html: matrix(3, 1) },
    ],
  },
];

/** Символы для вставки в формулу — группа «Символы» конструктора */
export const EQ_SYMBOL_SETS: { title: string; chars: string[] }[] = [
  {
    title: 'Основные',
    chars: [
      '±', '∓', '×', '÷', '≠', '≈', '≡', '≅', '≤', '≥',
      '≪', '≫', '∝', '∼', '∞', '∂', '∇', '∫', '∑', '∏',
      '√', '°', '⋅', '∘', '⊕', '⊗', '←', '→', '↔', '⇒',
      '⇔', '∀', '∃', '∄', '∈', '∉', '∅', '∩', '∪', '⊂',
    ],
  },
  {
    title: 'Греческие строчные',
    chars: [
      'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ',
      'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ',
      'φ', 'χ', 'ψ', 'ω', 'ϑ', 'ϕ', 'ϖ', 'ϱ', 'ς', 'ϒ',
    ],
  },
  {
    title: 'Греческие прописные',
    chars: [
      'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ',
      'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ',
      'Φ', 'Χ', 'Ψ', 'Ω',
    ],
  },
  {
    title: 'Операторы',
    chars: [
      '∧', '∨', '¬', '⊻', '⊼', '⊨', '⊢', '∴', '∵', '∎',
      '≜', '≝', '≐', '≔', '⩽', '⩾', '⊊', '⊋', '⊆', '⊇',
      '⊥', '∥', '∠', '∡', '△', '□', '◊', '⌀', '‰', '′',
    ],
  },
];

/** Готовые формулы — галерея «Формула» в группе «Сервис» */
export const READY_EQUATIONS: { label: string; html: string }[] = [
  {
    label: 'Теорема Пифагора',
    html: `a${sup('2')} + b${sup('2')} = c${sup('2')}`,
  },
  {
    label: 'Квадратное уравнение',
    html: `x = ${fraction(`−b ± ${radical(`b${sup('2')} − 4ac`)}`, '2a')}`,
  },
  {
    label: 'Площадь круга',
    html: `S = πr${sup('2')}`,
  },
  {
    label: 'Бином Ньютона',
    html:
      `(a + b)${sup('n')} = ` +
      bigOperator('∑', { from: 'k=0', to: 'n', noBody: true }) +
      ` C${sub('n')}${sup('k')} a${sup('n−k')} b${sup('k')}`,
  },
  {
    label: 'Ряд Фурье',
    html:
      `f(x) = a${sub('0')} + ` +
      bigOperator('∑', { from: 'n=1', to: '∞', noBody: true }) +
      ` (a${sub('n')} cos nx + b${sub('n')} sin nx)`,
  },
  {
    label: 'Тройной интеграл',
    html:
      bigOperator('∭', { from: 'V', side: true, noBody: true }) +
      ' f(x,y,z) dx dy dz',
  },
  {
    label: 'Предел',
    html: limit('lim', 'x→0', '', true) + ` ${fraction('sin x', 'x')} = 1`,
  },
  {
    label: 'Определение производной',
    html:
      fraction('dy', 'dx') +
      ' = ' +
      limit('lim', 'Δx→0', '', true) +
      ' ' +
      fraction('Δy', 'Δx'),
  },
];

/** Короткая запись верхнего индекса для готовых формул */
function sup(text: string): string {
  return `<span class="pv-eq-script" contenteditable="false">` +
    `<span class="pv-eq-sup"><span class="pv-eq-slot" contenteditable="true">` +
    `${text}</span></span></span>`;
}

/** Короткая запись нижнего индекса */
function sub(text: string): string {
  return `<span class="pv-eq-script" contenteditable="false">` +
    `<span class="pv-eq-sub"><span class="pv-eq-slot" contenteditable="true">` +
    `${text}</span></span></span>`;
}

/** Оборачивает содержимое в рамку формулы */
export const wrapEquation = (inner: string, display = false): string =>
  `<span class="pv-equation${display ? ' pv-equation-block' : ''}" ` +
  `data-equation="1" contenteditable="false">${inner}</span>`;

/**
 * Превращает формулу в линейный текст — так её увидят программы,
 * которые не понимают нашу разметку.
 */
export const equationToText = (el: Element): string => {
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const e = node as Element;
    const kids = [...e.childNodes].map(walk);
    const cls = e.classList;

    if (cls.contains('pv-eq-frac')) {
      const [top = '', bottom = ''] = kids;
      return `(${top})/(${bottom})`;
    }

    if (cls.contains('pv-eq-sup')) return `^(${kids.join('')})`;
    if (cls.contains('pv-eq-sub')) return `_(${kids.join('')})`;

    if (cls.contains('pv-eq-radical')) {
      const body = e.querySelector('.pv-eq-under')?.textContent ?? '';
      const degree = e.querySelector('.pv-eq-degree')?.textContent;
      return degree ? `root(${degree})(${body})` : `√(${body})`;
    }

    return kids.join('');
  };

  return walk(el).replace(/\s+/g, ' ').trim();
};
