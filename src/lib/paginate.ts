/** Зазор между листами на экране, px */
export const PAGE_GAP = 24;

/** Служебный класс распорки, которая сдвигает блок на новую страницу */
const SPACER = 'pv-page-spacer';

export interface PaginateSetup {
  /** Высота листа целиком */
  pageHeight: number;
  /** Верхнее и нижнее поля */
  padTop: number;
  padBottom: number;
  /** Полезная высота: лист минус поля */
  contentHeight: number;
}

/** Убирает распорки, оставляя чистый текст документа */
export const stripSpacers = (root: HTMLElement): void => {
  root.querySelectorAll(`.${SPACER}`).forEach((s) => s.remove());
};

/** То же самое для строки разметки — при сохранении и печати */
export const stripSpacersHtml = (html: string): string =>
  html.replace(
    /<div[^>]*class="[^"]*pv-page-spacer[^"]*"[^>]*><\/div>/g,
    '',
  );

const makeSpacer = (height: number): HTMLElement => {
  const s = document.createElement('div');

  s.className = SPACER;
  s.contentEditable = 'false';
  s.setAttribute('data-spacer', '1');
  s.style.cssText = `height:${Math.round(height)}px;margin:0;padding:0;border:0;pointer-events:none;user-select:none`;

  return s;
};

/**
 * Раскладывает содержимое по страницам: блок, который не помещается
 * на текущем листе, целиком переносится на следующий. Так текст
 * никогда не попадает в поля и в зазор между листами — как в Word.
 *
 * Возвращает число получившихся страниц.
 */
export const paginate = (
  root: HTMLElement | null,
  setup: PaginateSetup,
): number => {
  if (!root) return 1;

  const { pageHeight, padTop, contentHeight } = setup;
  if (contentHeight <= 0) return 1;

  stripSpacers(root);

  /* шаг между началами соседних листов на экране */
  const step = pageHeight + PAGE_GAP;

  const blocks = [...root.children] as HTMLElement[];
  let page = 0;

  for (const block of blocks) {
    if (block.classList.contains(SPACER)) continue;

    /* нижняя граница полезной части текущего листа */
    const limit = page * step + padTop + contentHeight;

    const top = block.offsetTop - root.offsetTop;
    const bottom = top + block.offsetHeight;

    /* явный разрыв страницы: всё, что после него, идёт на новый лист */
    const forced =
      block.classList.contains('pv-break') &&
      (block.dataset.break === 'page' ||
        block.dataset.break?.startsWith('section'));

    if (!forced && bottom <= limit + 1) continue;

    /* блок выше целого листа — оставляем, он займёт страницы подряд */
    if (!forced && block.offsetHeight > contentHeight) {
      page += Math.ceil((bottom - (page * step + padTop)) / contentHeight) - 1;
      continue;
    }

    page += 1;

    const nextStart = page * step + padTop;
    const shift = nextStart - top;

    if (shift > 0) block.parentNode?.insertBefore(makeSpacer(shift), block);
  }

  /* сколько листов занял текст */
  const last = root.lastElementChild as HTMLElement | null;

  const filled = last
    ? last.offsetTop - root.offsetTop + last.offsetHeight
    : 0;

  const used = Math.max(1, Math.ceil((filled - padTop) / step) || 1);

  return Math.max(page + 1, used);
};

/** Высота editable-слоя, чтобы в нём поместились все листы с зазорами */
export const canvasHeight = (pages: number, pageHeight: number): number =>
  pages * pageHeight + Math.max(0, pages - 1) * PAGE_GAP;
