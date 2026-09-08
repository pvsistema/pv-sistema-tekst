import { useCallback, useState } from 'react';
import type {
  BorderSetup,
  BorderSide,
  PageBorderSetup,
} from '@/lib/borders';
import {
  DEFAULT_BORDER,
  DEFAULT_PAGE_BORDER,
  applyBorder,
  applyBorderToText,
  clearBorder,
  readBorder,
} from '@/lib/borders';

interface Options {
  editorRef: React.RefObject<HTMLDivElement>;
  recount: () => void;
  notify: (title: string, description?: string) => void;
}

/** Границы и заливка: абзац, текст и обрамление страницы */
export const useBorders = ({ editorRef, recount, notify }: Options) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [initial, setInitial] = useState<BorderSetup>(DEFAULT_BORDER);
  /* окно открыто с вкладки «Страница» */
  const [pageTab, setPageTab] = useState(false);
  const [pageBorder, setPageBorder] =
    useState<PageBorderSetup>(DEFAULT_PAGE_BORDER);

  const root = () => editorRef.current;

  /** Открывает окно, подставив обрамление текущего абзаца */
  const open = useCallback(() => {
    setInitial(readBorder(root()));
    setPageTab(false);
    setDialogOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Открывает окно сразу на вкладке «Страница» */
  const openPage = useCallback(() => {
    setInitial(readBorder(root()));
    setPageTab(true);
    setDialogOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apply = useCallback(
    (setup: BorderSetup, target: 'paragraph' | 'text') => {
      setDialogOpen(false);

      if (target === 'text') {
        if (!applyBorderToText(setup)) {
          notify('Выделите текст', 'Обрамление текста требует выделения');
          return;
        }
        recount();
        notify('Обрамление применено к тексту');
        return;
      }

      const n = applyBorder(root(), setup);
      if (!n) {
        notify('Установите курсор в абзац');
        return;
      }

      recount();
      notify(
        setup.preset === 'none' && !setup.fill
          ? 'Обрамление снято'
          : 'Обрамление применено',
        n > 1 ? `Абзацев: ${n}` : undefined,
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [recount, notify],
  );

  const applyPage = useCallback(
    (setup: PageBorderSetup) => {
      setDialogOpen(false);
      setPageBorder(setup);
      notify(
        setup.enabled ? 'Рамка страницы включена' : 'Рамка страницы убрана',
        setup.art ? 'Рамка из рисунка' : undefined,
      );
    },
    [notify],
  );

  /** Быстрая установка одной стороны — кнопки на ленте */
  const quickSide = useCallback(
    (side: BorderSide | 'all' | 'none') => {
      const current = readBorder(root());

      const sides =
        side === 'all'
          ? { top: true, right: true, bottom: true, left: true }
          : side === 'none'
            ? { top: false, right: false, bottom: false, left: false }
            : { ...current.sides, [side]: !current.sides[side] };

      const n = applyBorder(root(), {
        ...current,
        sides,
        preset: Object.values(sides).some(Boolean) ? 'custom' : 'none',
      });

      if (!n) {
        notify('Установите курсор в абзац');
        return;
      }

      recount();
      notify(side === 'none' ? 'Границы убраны' : 'Границы применены');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [recount, notify],
  );

  /** Заливка абзаца одним цветом */
  const shade = useCallback(
    (color: string) => {
      const current = readBorder(root());
      const n = applyBorder(root(), { ...current, fill: color });

      if (!n) {
        notify('Установите курсор в абзац');
        return;
      }

      recount();
      notify('Заливка применена');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [recount, notify],
  );

  const clear = useCallback(() => {
    const n = clearBorder(root());
    if (!n) {
      notify('Установите курсор в абзац');
      return;
    }
    recount();
    notify('Обрамление и заливка сняты');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recount, notify]);

  return {
    dialogOpen,
    setDialogOpen,
    initial,
    pageBorder,
    setPageBorder,
    open,
    openPage,
    pageTab,
    apply,
    applyPage,
    quickSide,
    shade,
    clear,
  };
};
