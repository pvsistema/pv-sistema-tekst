/** Вид разрыва — как в меню «Разрывы» вкладки «Макет» */
export type BreakKind =
  | 'page'
  | 'column'
  | 'section-next'
  | 'section-continuous'
  | 'section-even'
  | 'section-odd';

export interface BreakOption {
  kind: BreakKind;
  label: string;
  hint: string;
  /** Разрывы разделов идут во второй группе меню */
  section: boolean;
}

export const BREAK_OPTIONS: BreakOption[] = [
  {
    kind: 'page',
    label: 'Страница',
    hint: 'Текст после разрыва начнётся с новой страницы',
    section: false,
  },
  {
    kind: 'column',
    label: 'Колонка',
    hint: 'Текст перейдёт в следующую колонку',
    section: false,
  },
  {
    kind: 'section-next',
    label: 'Следующая страница',
    hint: 'Новый раздел начнётся с новой страницы',
    section: true,
  },
  {
    kind: 'section-continuous',
    label: 'Текущая страница',
    hint: 'Новый раздел продолжится на этой же странице',
    section: true,
  },
  {
    kind: 'section-even',
    label: 'С чётной страницы',
    hint: 'Новый раздел начнётся с чётной страницы',
    section: true,
  },
  {
    kind: 'section-odd',
    label: 'С нечётной страницы',
    hint: 'Новый раздел начнётся с нечётной страницы',
    section: true,
  },
];

/** Настройки, которые раздел может переопределить */
export interface SectionSetup {
  columns: number;
  landscape: boolean;
  margin: number;
}

/** Собирает разметку разрыва */
export const breakHtml = (kind: BreakKind): string => {
  const label =
    BREAK_OPTIONS.find((o) => o.kind === kind)?.label ?? 'Разрыв';

  const isSection = kind.startsWith('section');
  const title = isSection ? `Разрыв раздела (${label.toLowerCase()})` : `Разрыв ${
    kind === 'page' ? 'страницы' : 'колонки'
  }`;

  return (
    `<div class="pv-break" data-break="${kind}" contenteditable="false" ` +
    `title="${title}"><span>${title}</span></div><p><br></p>`
  );
};

/** Все разрывы документа по порядку */
export const listBreaks = (root: HTMLElement | null): HTMLElement[] =>
  root ? Array.from(root.querySelectorAll<HTMLElement>('.pv-break')) : [];

/** Убирает разрыв, в котором или рядом с которым стоит курсор */
export const removeBreakAt = (root: HTMLElement | null): boolean => {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || !root) return false;

  let node: Node | null = sel.getRangeAt(0).startContainer;
  if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;

  const el = node as HTMLElement | null;
  const own = el?.closest?.('.pv-break') as HTMLElement | null;

  if (own) {
    own.remove();
    return true;
  }

  /* курсор в начале абзаца сразу после разрыва */
  const block = el?.closest?.('p, h1, h2, h3, h4, div') as HTMLElement | null;
  const prev = block?.previousElementSibling as HTMLElement | null;

  if (prev?.classList.contains('pv-break')) {
    prev.remove();
    return true;
  }

  return false;
};

/** Убирает все разрывы документа */
export const clearBreaks = (root: HTMLElement | null): number => {
  const list = listBreaks(root);
  list.forEach((b) => b.remove());
  return list.length;
};

/**
 * Пересчитывает высоту разрывов страницы: каждый должен дотянуть
 * содержимое ровно до конца текущей страницы.
 */
export const layoutBreaks = (
  root: HTMLElement | null,
  contentHeight: number,
): void => {
  if (!root || contentHeight <= 0) return;

  const breaks = listBreaks(root).filter(
    (b) =>
      b.dataset.break === 'page' ||
      b.dataset.break === 'section-next' ||
      b.dataset.break === 'section-even' ||
      b.dataset.break === 'section-odd',
  );

  /* сначала обнуляем, чтобы измерить настоящее положение */
  breaks.forEach((b) => {
    b.style.height = '0px';
  });

  breaks.forEach((b) => {
    const top = b.offsetTop;
    const used = top % contentHeight;
    let gap = used > 1 ? contentHeight - used : 0;

    /* чётные и нечётные страницы могут потребовать пропустить лист */
    const kind = b.dataset.break;
    if (kind === 'section-even' || kind === 'section-odd') {
      const pageAfter = Math.floor((top + gap) / contentHeight) + 1;
      const wantEven = kind === 'section-even';

      if (pageAfter % 2 === 0 !== wantEven) gap += contentHeight;
    }

    b.style.height = `${Math.max(0, gap)}px`;
  });
};

/** Номер раздела, в котором стоит курсор */
export const currentSection = (root: HTMLElement | null): number => {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || !root) return 1;

  let node: Node | null = sel.getRangeAt(0).startContainer;
  if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;

  const el = node as HTMLElement | null;
  if (!el) return 1;

  const marks = Array.from(
    root.querySelectorAll<HTMLElement>('.pv-break[data-break^="section"]'),
  );

  let index = 1;

  for (const mark of marks) {
    /* разрыв стоит выше курсора — значит, начался следующий раздел */
    if (
      mark.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING
    ) {
      index += 1;
    }
  }

  return index;
};

/** Сколько разделов в документе */
export const countSections = (root: HTMLElement | null): number =>
  1 +
  (root?.querySelectorAll('.pv-break[data-break^="section"]').length ?? 0);
