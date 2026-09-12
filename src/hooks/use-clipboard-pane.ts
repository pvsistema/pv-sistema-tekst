import { useCallback, useEffect, useState } from 'react';

export interface ClipItem {
  id: string;
  /** Разметка фрагмента — вставляется с оформлением */
  html: string;
  /** Текст для показа в списке */
  text: string;
  at: number;
}

/** Больше 24 фрагментов Word тоже не хранит */
const LIMIT = 24;

interface Options {
  editorRef: React.RefObject<HTMLDivElement>;
}

/**
 * Панель буфера обмена: помнит последние копирования и позволяет
 * вставить любое из них — как область буфера в Word.
 */
export const useClipboardPane = ({ editorRef }: Options) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ClipItem[]>([]);

  /** Кладёт выделенный фрагмент в историю */
  const remember = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return;

    const root = editorRef.current;
    if (!root || !root.contains(selection.anchorNode)) return;

    const holder = document.createElement('div');
    holder.appendChild(selection.getRangeAt(0).cloneContents());

    const text = holder.innerText.replace(/\s+/g, ' ').trim();
    if (!text) return;

    setItems((prev) => {
      /* повтор того же фрагмента наверх, а не вторым пунктом */
      const rest = prev.filter((i) => i.text !== text);

      return [
        { id: `clip-${Date.now()}`, html: holder.innerHTML, text, at: Date.now() },
        ...rest,
      ].slice(0, LIMIT);
    });
  }, [editorRef]);

  /* следим за копированием и вырезанием внутри документа */
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    const onCopy = () => remember();

    el.addEventListener('copy', onCopy);
    el.addEventListener('cut', onCopy);

    return () => {
      el.removeEventListener('copy', onCopy);
      el.removeEventListener('cut', onCopy);
    };
  }, [editorRef, remember]);

  const clear = useCallback(() => setItems([]), []);

  const removeOne = useCallback(
    (id: string) => setItems((prev) => prev.filter((i) => i.id !== id)),
    [],
  );

  return {
    open,
    setOpen,
    items,
    remember,
    clear,
    removeOne,
  };
};
