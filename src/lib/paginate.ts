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

/** Сколько строк занимает абзац — нужно для запрета висячих строк */
const lineCount = (el: HTMLElement): number => {
  const cs = window.getComputedStyle(el);
  const line = parseFloat(cs.lineHeight);

  if (!line || Number.isNaN(line)) return 1;

  const inner =
    el.offsetHeight -
    parseFloat(cs.paddingTop || '0') -
    parseFloat(cs.paddingBottom || '0');

  return Math.max(1, Math.round(inner / line));
};

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

  const blocks = ([...root.children] as HTMLElement[]).filter(
    (b) => !b.classList.contains(SPACER),
  );

  let page = 0;

  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i];

    /* нижняя граница полезной части текущего листа */
    const limit = page * step + padTop + contentHeight;

    const top = block.offsetTop - root.offsetTop;
    const bottom = top + block.offsetHeight;

    /* явный разрыв страницы: всё, что после него, идёт на новый лист */
    const isBreak =
      block.classList.contains('pv-break') &&
      (block.dataset.break === 'page' ||
        block.dataset.break?.startsWith('section'));

    /* «с новой страницы» в настройках абзаца */
    const breakBefore = block.dataset.breakBefore === '1' && top > padTop;

    let forced = isBreak || breakBefore;

    if (!forced && bottom <= limit + 1) {
      /*
       * Абзац помещается, но может утащить за собой следующий:
       * «не отрывать от следующего» держит заголовок вместе с текстом.
       */
      if (block.dataset.keepNext === '1') {
        const next = blocks[i + 1];

        if (next) {
          const nextBottom =
            next.offsetTop - root.offsetTop + next.offsetHeight;

          /* пара не помещается целиком — переносим её вместе */
          if (nextBottom > limit + 1 && next.offsetHeight <= contentHeight)
            forced = true;
        }
      }

      if (!forced) continue;
    }

    /* высокий абзац занимает несколько листов подряд */
    if (!forced && block.offsetHeight > contentHeight) {
      /* «не разрывать абзац» уводит его целиком на новый лист */
      if (block.dataset.keepLines !== '1') {
        page += Math.ceil((bottom - (page * step + padTop)) / contentHeight) - 1;
        continue;
      }
    }

    /*
     * Запрет висячих строк: абзац не должен оставлять на листе одну
     * строку. Если на текущей странице помещается меньше двух строк,
     * переносим его целиком.
     */
    if (!forced && block.dataset.widow !== '0') {
      const lines = lineCount(block);

      if (lines >= 2) {
        const lineHeight = block.offsetHeight / lines;
        const fits = Math.floor((limit - top) / lineHeight);

        /* одна строка сверху или снизу — некрасиво, уводим абзац */
        if (fits >= 2 && lines - fits >= 2) continue;
      }
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