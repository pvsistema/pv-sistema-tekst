import { useCallback, useEffect, useState } from 'react';
import type { ContextTarget } from '@/components/editor/DocumentContextMenu';
import type { MiniPosition } from '@/components/editor/MiniToolbar';
import type { PasteMode } from '@/lib/clipboard';
import { cleanPasted } from '@/lib/clipboard';

interface Options {
  editorRef: React.RefObject<HTMLDivElement>;
  exec: (command: string, value?: string) => void;
  recount: () => void;
  notify: (title: string, description?: string) => void;
  /** Показывать мини-панель при выделении */
  miniEnabled: boolean;
}

/** Есть ли сейчас непустое выделение внутри документа */
const selectionInside = (root: HTMLElement | null): boolean => {
  const sel = window.getSelection();
  if (!root || !sel || sel.isCollapsed || !sel.rangeCount) return false;

  return root.contains(sel.getRangeAt(0).commonAncestorContainer);
};

/**
 * Меню по правой кнопке, мини-панель при выделении,
 * параметры вставки и выделение строки по полосе слева.
 */
export const useContextMenu = ({
  editorRef,
  exec,
  recount,
  notify,
  miniEnabled,
}: Options) => {
  const [target, setTarget] = useState<ContextTarget | null>(null);
  const [mini, setMini] = useState<MiniPosition | null>(null);

  /** Вставка выбранным способом */
  const paste = useCallback(
    async (mode: PasteMode) => {
      editorRef.current?.focus();

      try {
        /* сначала пробуем забрать размеченный текст */
        if (mode !== 'text' && navigator.clipboard?.read) {
          const items = await navigator.clipboard.read();

          for (const item of items) {
            if (!item.types.includes('text/html')) continue;

            const blob = await item.getType('text/html');
            const html = await blob.text();

            exec('insertHTML', cleanPasted(html, mode));
            recount();
            return;
          }
        }

        const text = await navigator.clipboard.readText();

        if (mode === 'text') exec('insertText', text);
        else exec('insertHTML', cleanPasted(text, mode));

        recount();
      } catch {
        notify(
          'Вставка из буфера',
          'Нажмите Ctrl+V — браузер не даёт доступ к буферу',
        );
      }
    },
    [editorRef, exec, recount, notify],
  );

  /*
   * Ctrl+V: чужие шрифты и цвета из браузера или Word приводим
   * к оформлению документа, структуру текста при этом сохраняем.
   */
  useEffect(() => {
    const root = editorRef.current;
    if (!root) return;

    const onPaste = (e: ClipboardEvent) => {
      const data = e.clipboardData;
      if (!data) return;

      const html = data.getData('text/html');
      if (!html) return;

      e.preventDefault();
      exec('insertHTML', cleanPasted(html, 'merge'));
      recount();
    };

    root.addEventListener('paste', onPaste);
    return () => root.removeEventListener('paste', onPaste);
  }, [editorRef, exec, recount]);

  /* правая кнопка в документе открывает наше меню */
  useEffect(() => {
    const root = editorRef.current;
    if (!root) return;

    const onMenu = (e: MouseEvent) => {
      e.preventDefault();
      setMini(null);

      const node = e.target as HTMLElement;

      setTarget({
        x: e.clientX,
        y: e.clientY,
        hasSelection: selectionInside(root),
        inTable: !!node.closest?.('table'),
        onImage: node.tagName === 'IMG',
      });
    };

    root.addEventListener('contextmenu', onMenu);
    return () => root.removeEventListener('contextmenu', onMenu);
  }, [editorRef]);

  /* мини-панель появляется после того, как отпустили кнопку мыши */
  useEffect(() => {
    if (!miniEnabled) {
      setMini(null);
      return;
    }

    const root = editorRef.current;
    if (!root) return;

    const show = () => {
      if (!selectionInside(root)) {
        setMini(null);
        return;
      }

      const rect = window
        .getSelection()
        ?.getRangeAt(0)
        .getBoundingClientRect();

      if (!rect || (!rect.width && !rect.height)) {
        setMini(null);
        return;
      }

      setMini({ x: rect.left + rect.width / 2, y: rect.top });
    };

    const hide = () => setMini(null);

    /* панель не должна мешать при наборе текста */
    root.addEventListener('mouseup', show);
    root.addEventListener('keyup', hide);
    root.addEventListener('mousedown', hide);
    root.addEventListener('scroll', hide);

    return () => {
      root.removeEventListener('mouseup', show);
      root.removeEventListener('keyup', hide);
      root.removeEventListener('mousedown', hide);
      root.removeEventListener('scroll', hide);
    };
  }, [editorRef, miniEnabled]);

  /**
   * Полоса слева от текста: щелчок выделяет строку,
   * двойной — абзац, тройной — весь документ.
   */
  useEffect(() => {
    const root = editorRef.current;
    if (!root) return;

    const onDown = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      const styles = window.getComputedStyle(root);
      const padLeft = parseFloat(styles.paddingLeft) || 0;

      /* полоса шириной 26 точек внутри левого поля */
      const inBar =
        e.clientX >= rect.left &&
        e.clientX < rect.left + Math.min(padLeft, 26 + padLeft * 0);

      if (!inBar || padLeft < 20) return;

      const point = document.caretRangeFromPoint?.(
        rect.left + padLeft + 2,
        e.clientY,
      );

      if (!point) return;

      const node = point.startContainer;
      const el = (
        node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element)
      ) as HTMLElement | null;

      if (!el || !root.contains(el)) return;

      e.preventDefault();

      /* тройной щелчок — весь документ */
      if (e.detail >= 3) {
        exec('selectAll');
        return;
      }

      let block = el;
      while (block.parentElement && block.parentElement !== root) {
        block = block.parentElement;
      }

      const range = document.createRange();
      range.selectNodeContents(block);

      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    };

    root.addEventListener('mousedown', onDown);
    return () => root.removeEventListener('mousedown', onDown);
  }, [editorRef, exec]);

  return {
    target,
    closeMenu: () => setTarget(null),
    mini,
    hideMini: () => setMini(null),
    paste,
  };
};
