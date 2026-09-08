/** Уровень абзаца в структуре: 1–9 для заголовков, 0 — обычный текст */
export type OutlineLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface OutlineNode {
  el: HTMLElement;
  level: OutlineLevel;
  text: string;
}

/** Читает уровень абзаца по его тегу */
export const levelOf = (el: Element): OutlineLevel => {
  const m = el.tagName.match(/^H([1-6])$/);
  if (m) return Number(m[1]) as OutlineLevel;

  /* уровни ниже шестого храним пометкой — тегов H7+ не бывает */
  const custom = (el as HTMLElement).dataset?.level;
  if (custom) return Number(custom) as OutlineLevel;

  return 0;
};

/** Подпись уровня для списка и подсказок */
export const levelLabel = (level: OutlineLevel): string =>
  level === 0 ? 'Основной текст' : `Уровень ${level}`;

/** Все абзацы документа с их уровнями */
export const readOutline = (root: HTMLElement): OutlineNode[] =>
  [...root.children]
    .filter((el): el is HTMLElement => el instanceof HTMLElement)
    .map((el) => ({
      el,
      level: levelOf(el),
      text: (el.textContent ?? '').trim(),
    }));

/**
 * Меняет уровень абзаца. Заголовки 1–6 получают свой тег,
 * основной текст становится обычным абзацем.
 */
export const applyLevel = (
  el: HTMLElement,
  level: OutlineLevel,
): HTMLElement => {
  const tag = level === 0 ? 'p' : `h${Math.min(6, level)}`;

  /* тег уже нужный — правим только пометку глубокого уровня */
  if (el.tagName.toLowerCase() === tag) {
    if (level > 6) el.dataset.level = String(level);
    else delete el.dataset.level;
    return el;
  }

  const next = document.createElement(tag);
  next.innerHTML = el.innerHTML;

  /* переносим оформление абзаца */
  const style = el.getAttribute('style');
  if (style) next.setAttribute('style', style);

  if (level > 6) next.dataset.level = String(level);

  el.replaceWith(next);
  return next;
};

/** Уровень на ступень выше — «Повысить уровень» */
export const promote = (level: OutlineLevel): OutlineLevel =>
  level === 0 ? 1 : (Math.max(1, level - 1) as OutlineLevel);

/** Уровень на ступень ниже — «Понизить уровень» */
export const demote = (level: OutlineLevel): OutlineLevel =>
  level === 0 ? 0 : level >= 9 ? 0 : ((level + 1) as OutlineLevel);

/**
 * Находит абзацы, подчинённые заголовку: всё до следующего
 * заголовка того же или более высокого уровня.
 */
export const childrenOf = (
  nodes: OutlineNode[],
  index: number,
): OutlineNode[] => {
  const head = nodes[index];
  if (!head || head.level === 0) return [];

  const out: OutlineNode[] = [];

  for (let i = index + 1; i < nodes.length; i += 1) {
    const n = nodes[i];

    /* дошли до равного или старшего заголовка — ветка закончилась */
    if (n.level !== 0 && n.level <= head.level) break;

    out.push(n);
  }

  return out;
};

/** Заголовок, которому подчинён абзац */
export const parentOf = (
  nodes: OutlineNode[],
  index: number,
): OutlineNode | null => {
  const self = nodes[index];
  if (!self) return null;

  for (let i = index - 1; i >= 0; i -= 1) {
    const n = nodes[i];

    if (n.level !== 0 && (self.level === 0 || n.level < self.level)) {
      return n;
    }
  }

  return null;
};

/** Сколько уровней показывать: 1–9 или все */
export type ShowLevel = OutlineLevel | 'all';

export const SHOW_OPTIONS: { value: ShowLevel; label: string }[] = [
  { value: 1, label: 'Уровень 1' },
  { value: 2, label: 'Уровень 2' },
  { value: 3, label: 'Уровень 3' },
  { value: 4, label: 'Уровень 4' },
  { value: 5, label: 'Уровень 5' },
  { value: 'all', label: 'Все уровни' },
];

/**
 * Прячет абзацы глубже заданного уровня. Основной текст
 * считается самым нижним уровнем иерархии.
 */
export const applyShowLevel = (root: HTMLElement, show: ShowLevel) => {
  readOutline(root).forEach(({ el, level }) => {
    if (show === 'all') {
      el.classList.remove('pv-outline-hidden');
      return;
    }

    const depth = level === 0 ? 9 : level;
    el.classList.toggle('pv-outline-hidden', depth > show);
  });
};

/** Сворачивает или разворачивает ветку заголовка */
export const toggleBranch = (root: HTMLElement, head: HTMLElement) => {
  const nodes = readOutline(root);
  const index = nodes.findIndex((n) => n.el === head);
  if (index < 0) return;

  const kids = childrenOf(nodes, index);
  if (!kids.length) return;

  const collapsed = head.classList.toggle('pv-outline-collapsed');

  kids.forEach(({ el }) => {
    el.classList.toggle('pv-outline-hidden', collapsed);

    /* сворачивая ветку, закрываем и вложенные заголовки */
    if (collapsed) el.classList.add('pv-outline-collapsed');
  });
};

/**
 * Переносит заголовок вместе с подчинёнными абзацами вверх или вниз.
 * Так в структуре меняют местами главы.
 */
export const moveBranch = (
  root: HTMLElement,
  head: HTMLElement,
  dir: 'up' | 'down',
): boolean => {
  const nodes = readOutline(root);
  const index = nodes.findIndex((n) => n.el === head);
  if (index < 0) return false;

  const block = [nodes[index], ...childrenOf(nodes, index)];
  const first = block[0].el;
  const last = block[block.length - 1].el;

  if (dir === 'up') {
    const before = first.previousElementSibling;
    if (!before) return false;

    /* встаём перед всей веткой соседа, а не перед его последней строкой */
    const beforeIndex = nodes.findIndex((n) => n.el === before);
    const target =
      beforeIndex >= 0 ? startOfBranch(nodes, beforeIndex) : before;

    block.forEach(({ el }) => target.parentElement?.insertBefore(el, target));
    return true;
  }

  const after = last.nextElementSibling;
  if (!after) return false;

  const afterIndex = nodes.findIndex((n) => n.el === after);
  const tail =
    afterIndex >= 0
      ? [nodes[afterIndex], ...childrenOf(nodes, afterIndex)]
      : [{ el: after as HTMLElement }];

  const anchor = tail[tail.length - 1].el;

  block
    .slice()
    .reverse()
    .forEach(({ el }) => anchor.after(el));

  return true;
};

/** Первый абзац ветки, которой принадлежит указанный абзац */
const startOfBranch = (
  nodes: OutlineNode[],
  index: number,
): HTMLElement => {
  const self = nodes[index];

  /* заголовок открывает свою ветку сам */
  if (self.level !== 0) return self.el;

  const parent = parentOf(nodes, index);
  return parent ? parent.el : self.el;
};

/** Собирает оглавление по уровням — для проверки структуры */
export const outlineSummary = (
  root: HTMLElement,
): { level: OutlineLevel; text: string }[] =>
  readOutline(root)
    .filter((n) => n.level > 0)
    .map((n) => ({ level: n.level, text: n.text }));
