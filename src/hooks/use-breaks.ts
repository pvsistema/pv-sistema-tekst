import { useCallback, useEffect, useState } from 'react';
import type { BreakKind } from '@/lib/breaks';
import {
  BREAK_OPTIONS,
  breakHtml,
  clearBreaks,
  countSections,
  currentSection,
  layoutBreaks,
  removeBreakAt,
} from '@/lib/breaks';

interface Options {
  editorRef: React.RefObject<HTMLDivElement>;
  exec: (command: string, value?: string) => void;
  recount: () => void;
  notify: (title: string, description?: string) => void;
  /** Высота полезной части страницы — по ней тянутся разрывы */
  contentHeight: number;
}

/** Разрывы страниц, колонок и разделов */
export const useBreaks = ({
  editorRef,
  exec,
  recount,
  notify,
  contentHeight,
}: Options) => {
  const [section, setSection] = useState(1);
  const [sections, setSections] = useState(1);

  const root = () => editorRef.current;

  /** Пересчитывает высоту разрывов, чтобы они дотягивали до конца листа */
  const relayout = useCallback(() => {
    layoutBreaks(editorRef.current, contentHeight);
  }, [editorRef, contentHeight]);

  useEffect(() => {
    relayout();
  }, [relayout]);

  /* показываем в строке состояния, в каком разделе курсор */
  useEffect(() => {
    const check = () => {
      setSection(currentSection(editorRef.current));
      setSections(countSections(editorRef.current));
    };

    document.addEventListener('selectionchange', check);
    return () => document.removeEventListener('selectionchange', check);
  }, [editorRef]);

  const insert = useCallback(
    (kind: BreakKind) => {
      exec('insertHTML', breakHtml(kind));

      /* высоту считаем после того, как разметка попала в документ */
      window.setTimeout(() => {
        relayout();
        setSections(countSections(root()));
      }, 0);

      recount();

      const option = BREAK_OPTIONS.find((o) => o.kind === kind);
      notify(
        option?.section ? 'Разрыв раздела вставлен' : 'Разрыв вставлен',
        option?.hint,
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [exec, relayout, recount, notify],
  );

  const removeOne = useCallback(() => {
    if (!removeBreakAt(root())) {
      notify('Разрыв не найден', 'Поставьте курсор сразу после разрыва');
      return;
    }

    relayout();
    setSections(countSections(root()));
    recount();
    notify('Разрыв удалён');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relayout, recount, notify]);

  const removeAll = useCallback(() => {
    const n = clearBreaks(root());
    relayout();
    setSections(1);
    recount();
    notify(n ? `Убрано разрывов: ${n}` : 'Разрывов нет');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relayout, recount, notify]);

  return {
    section,
    sections,
    insert,
    removeOne,
    removeAll,
    relayout,
  };
};
