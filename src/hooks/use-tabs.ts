import { useCallback, useEffect, useState } from 'react';
import type { TabAlign, TabStop } from '@/lib/tab-stops';
import {
  DEFAULT_TAB_STEP,
  TAB_ALIGN_LABELS,
  addTabStop,
  alignDecimals,
  buildTabHtml,
  clearTabStops,
  cursorOffsetCm,
  nextStop,
  readTabStops,
  removeTabStop,
  writeTabStops,
} from '@/lib/tab-stops';
import { selectedParagraph, selectedParagraphs } from '@/lib/text-format';

interface Options {
  editorRef: React.RefObject<HTMLDivElement>;
  exec: (command: string, value?: string) => void;
  recount: () => void;
  notify: (title: string, description?: string) => void;
}

const ORDER: TabAlign[] = ['left', 'center', 'right', 'decimal', 'bar'];

/** Табуляция: позиции на линейке, их типы и заполнители */
export const useTabs = ({ editorRef, exec, recount, notify }: Options) => {
  const [stops, setStops] = useState<TabStop[]>([]);
  const [align, setAlign] = useState<TabAlign>('left');
  const [leader, setLeader] = useState<TabStop['leader']>('none');
  const [dialogOpen, setDialogOpen] = useState(false);

  const root = () => editorRef.current;

  /* показываем на линейке позиции того абзаца, где стоит курсор */
  const refresh = useCallback(() => {
    setStops(readTabStops(selectedParagraph(editorRef.current)));
  }, [editorRef]);

  useEffect(() => {
    document.addEventListener('selectionchange', refresh);
    return () => document.removeEventListener('selectionchange', refresh);
  }, [refresh]);

  /** Переключает тип позиции — как кнопка слева от линейки в Word */
  const cycleAlign = useCallback(() => {
    setAlign((prev) => {
      const next = ORDER[(ORDER.indexOf(prev) + 1) % ORDER.length];
      notify(
        `Тип позиции: ${TAB_ALIGN_LABELS.find((a) => a.value === next)?.label}`,
      );
      return next;
    });
  }, [notify]);

  const add = useCallback(
    (position: number) => {
      const n = addTabStop(root(), { position, align, leader });

      if (!n) {
        notify('Установите курсор в абзац');
        return;
      }

      refresh();
      recount();
      notify(
        `Позиция ${position.toFixed(2).replace('.', ',')} см`,
        TAB_ALIGN_LABELS.find((a) => a.value === align)?.label,
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [align, leader, refresh, recount, notify],
  );

  const remove = useCallback(
    (position: number) => {
      removeTabStop(root(), position);
      refresh();
      recount();
      notify('Позиция табуляции убрана');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [refresh, recount, notify],
  );

  const clearAll = useCallback(() => {
    const n = clearTabStops(root());
    refresh();
    recount();
    notify(n ? 'Все позиции убраны' : 'Установите курсор в абзац');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, recount, notify]);

  /** Применяет разом весь список из окна «Табуляция» */
  const applyAll = useCallback(
    (list: TabStop[], step: number) => {
      setDialogOpen(false);

      const paragraphs = selectedParagraphs(root());
      if (!paragraphs.length) {
        notify('Установите курсор в абзац');
        return;
      }

      paragraphs.forEach((el) => {
        writeTabStops(el, list);
        if (!list.length) el.style.tabSize = `${step * 37.8}px`;
      });

      refresh();
      recount();
      notify(
        list.length
          ? `Задано позиций: ${list.length}`
          : `Шаг табуляции ${step.toFixed(2).replace('.', ',')} см`,
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [refresh, recount, notify],
  );

  /**
   * Нажатие клавиши Tab: переводит текст к следующей позиции
   * и выравнивает его так, как у этой позиции задано.
   */
  const handleTabKey = useCallback((): boolean => {
    const paragraph = selectedParagraph(root());
    if (!paragraph) return false;

    const list = readTabStops(paragraph);
    const from = cursorOffsetCm(root());
    const stop = nextStop(list, from);

    exec('insertHTML', buildTabHtml(stop, from));

    /* числа по разделителю подравниваем сразу после вставки */
    if (stop.align === 'decimal') {
      window.setTimeout(() => alignDecimals(root()), 0);
    }

    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exec]);

  /** Пересчитывает выравнивание чисел — после правки текста */
  const realign = useCallback(() => {
    alignDecimals(root());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    stops,
    align,
    leader,
    setLeader,
    dialogOpen,
    setDialogOpen,
    cycleAlign,
    add,
    remove,
    clearAll,
    applyAll,
    handleTabKey,
    realign,
    defaultStep: DEFAULT_TAB_STEP,
  };
};
