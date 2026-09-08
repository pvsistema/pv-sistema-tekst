import { useCallback, useEffect, useState } from 'react';
import type { OutlineLevel, ShowLevel } from '@/lib/outline';
import {
  applyLevel,
  applyShowLevel,
  demote,
  levelOf,
  moveBranch,
  promote,
  toggleBranch,
} from '@/lib/outline';

interface Options {
  editorRef: React.RefObject<HTMLDivElement>;
  recount: () => void;
  notify: (title: string, description?: string) => void;
  /** Режим структуры включён */
  active: boolean;
}

/** Работа со структурой: уровни заголовков, перенос и сворачивание */
export const useOutline = ({
  editorRef,
  recount,
  notify,
  active,
}: Options) => {
  const [level, setLevel] = useState<OutlineLevel>(0);
  const [show, setShow] = useState<ShowLevel>('all');

  /** Абзац, в котором стоит курсор */
  const current = useCallback((): HTMLElement | null => {
    const root = editorRef.current;
    const node = window.getSelection()?.anchorNode;
    if (!root || !node) return null;

    const el = (
      node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element)
    ) as HTMLElement | null;

    if (!el || !root.contains(el)) return null;

    /* поднимаемся до абзаца верхнего уровня */
    let block = el;
    while (block.parentElement && block.parentElement !== root) {
      block = block.parentElement;
    }

    return block.parentElement === root ? block : null;
  }, [editorRef]);

  /* следим за уровнем абзаца под курсором */
  useEffect(() => {
    if (!active) return;

    const track = () => {
      const el = current();
      setLevel(el ? levelOf(el) : 0);
    };

    document.addEventListener('selectionchange', track);
    return () => document.removeEventListener('selectionchange', track);
  }, [active, current]);

  /** Ставит абзацу выбранный уровень */
  const setNodeLevel = useCallback(
    (next: OutlineLevel) => {
      const el = current();

      if (!el) {
        notify('Установите курсор в абзац');
        return;
      }

      /* запоминаем место курсора, чтобы вернуть его после замены тега */
      const offset = window.getSelection()?.anchorOffset ?? 0;
      const replaced = applyLevel(el, next);

      const range = document.createRange();
      const target = replaced.firstChild ?? replaced;

      const max =
        target.nodeType === Node.TEXT_NODE
          ? (target.textContent?.length ?? 0)
          : 0;

      range.setStart(target, Math.min(offset, max));
      range.collapse(true);

      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      setLevel(next);
      recount();
    },
    [current, notify, recount],
  );

  const doPromote = useCallback(() => {
    const el = current();
    if (!el) {
      notify('Установите курсор в абзац');
      return;
    }
    setNodeLevel(promote(levelOf(el)));
  }, [current, notify, setNodeLevel]);

  const doDemote = useCallback(() => {
    const el = current();
    if (!el) {
      notify('Установите курсор в абзац');
      return;
    }
    setNodeLevel(demote(levelOf(el)));
  }, [current, notify, setNodeLevel]);

  /** Сразу до основного текста — кнопка «Понизить до обычного текста» */
  const toBody = useCallback(() => setNodeLevel(0), [setNodeLevel]);

  /** Переносит заголовок вместе с подчинённым текстом */
  const move = useCallback(
    (dir: 'up' | 'down') => {
      const root = editorRef.current;
      const el = current();

      if (!root || !el) {
        notify('Установите курсор в абзац');
        return;
      }

      if (!moveBranch(root, el, dir)) {
        notify(dir === 'up' ? 'Это первый абзац' : 'Это последний абзац');
        return;
      }

      recount();
    },
    [editorRef, current, notify, recount],
  );

  /** Сворачивает ветку заголовка */
  const collapse = useCallback(() => {
    const root = editorRef.current;
    const el = current();

    if (!root || !el) return;

    if (levelOf(el) === 0) {
      notify('Свернуть можно только заголовок');
      return;
    }

    toggleBranch(root, el);
  }, [editorRef, current, notify]);

  /** Показывает заголовки не глубже выбранного уровня */
  const setShowLevel = useCallback(
    (next: ShowLevel) => {
      const root = editorRef.current;
      if (!root) return;

      setShow(next);
      applyShowLevel(root, next);
    },
    [editorRef],
  );

  /* выходя из режима структуры, возвращаем все абзацы на место */
  useEffect(() => {
    if (active) return;

    const root = editorRef.current;
    if (!root) return;

    root
      .querySelectorAll('.pv-outline-hidden, .pv-outline-collapsed')
      .forEach((el) => {
        el.classList.remove('pv-outline-hidden', 'pv-outline-collapsed');
      });

    setShow('all');
  }, [active, editorRef]);

  return {
    level,
    show,
    setNodeLevel,
    promote: doPromote,
    demote: doDemote,
    toBody,
    move,
    collapse,
    setShowLevel,
  };
};
