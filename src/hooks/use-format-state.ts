import { useCallback, useEffect, useState } from 'react';

/** Какие начертания и выравнивания включены в месте курсора */
export interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  sub: boolean;
  sup: boolean;
  bullet: boolean;
  numbered: boolean;
  align: 'left' | 'center' | 'right' | 'justify';
}

const EMPTY: FormatState = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  sub: false,
  sup: false,
  bullet: false,
  numbered: false,
  align: 'left',
};

/** Безопасно спрашивает у браузера, включено ли начертание */
const isOn = (command: string): boolean => {
  try {
    return document.queryCommandState(command);
  } catch {
    return false;
  }
};

interface Options {
  editorRef: React.RefObject<HTMLDivElement>;
}

/**
 * Подсветка кнопок начертания: показывает, что включено там,
 * где стоит курсор — как в Word.
 */
export const useFormatState = ({ editorRef }: Options) => {
  const [state, setState] = useState<FormatState>(EMPTY);

  const refresh = useCallback(() => {
    const root = editorRef.current;
    if (!root) return;

    const sel = window.getSelection();
    const node = sel?.anchorNode;

    /* курсор вне документа — кнопки гасим */
    if (!node || !root.contains(node)) {
      setState(EMPTY);
      return;
    }

    const el =
      node.nodeType === Node.ELEMENT_NODE
        ? (node as HTMLElement)
        : node.parentElement;

    /* выравнивание берём у абзаца, а не у куска текста */
    const block = el?.closest('p,h1,h2,h3,h4,h5,h6,li,td,th,div');

    const raw = block ? getComputedStyle(block).textAlign : 'left';

    const align: FormatState['align'] =
      raw === 'center'
        ? 'center'
        : raw === 'right' || raw === 'end'
          ? 'right'
          : raw === 'justify'
            ? 'justify'
            : 'left';

    setState({
      bold: isOn('bold'),
      italic: isOn('italic'),
      underline: isOn('underline'),
      strike: isOn('strikeThrough'),
      sub: isOn('subscript'),
      sup: isOn('superscript'),
      bullet: isOn('insertUnorderedList'),
      numbered: isOn('insertOrderedList'),
      align,
    });
  }, [editorRef]);

  /* следим за перемещением курсора и правками текста */
  useEffect(() => {
    const root = editorRef.current;
    if (!root) return;

    const onChange = () => refresh();

    document.addEventListener('selectionchange', onChange);
    root.addEventListener('keyup', onChange);
    root.addEventListener('mouseup', onChange);
    root.addEventListener('input', onChange);
    root.addEventListener('focus', onChange);

    return () => {
      document.removeEventListener('selectionchange', onChange);
      root.removeEventListener('keyup', onChange);
      root.removeEventListener('mouseup', onChange);
      root.removeEventListener('input', onChange);
      root.removeEventListener('focus', onChange);
    };
  }, [editorRef, refresh]);

  return { format: state, refreshFormat: refresh };
};
