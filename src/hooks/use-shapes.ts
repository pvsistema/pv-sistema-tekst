import { useCallback, useEffect, useRef, useState } from 'react';
import type { ShapeKind, WrapMode } from '@/lib/shapes';
import {
  DEFAULT_SHAPE_STYLE,
  applyWrap,
  shapeHtml,
  textBoxHtml,
  wordArtHtml,
} from '@/lib/shapes';

interface Options {
  editorRef: React.RefObject<HTMLDivElement>;
  exec: (command: string, value?: string) => void;
  recount: () => void;
  notify: (title: string, description?: string) => void;
}

/** Фигуры, надписи и WordArt: вставка, перемещение, размер, обтекание */
export const useShapes = ({ editorRef, exec, recount, notify }: Options) => {
  const [selected, setSelected] = useState<HTMLElement | null>(null);
  const [shapeDialog, setShapeDialog] = useState(false);
  const [wordArtDialog, setWordArtDialog] = useState(false);

  /* данные перетаскивания живут вне перерисовок */
  const drag = useRef<{
    el: HTMLElement;
    mode: 'move' | 'resize';
    startX: number;
    startY: number;
    width: number;
    height: number;
    left: number;
    top: number;
  } | null>(null);

  /** Снимает выделение со всех объектов */
  const clearMarks = useCallback(() => {
    editorRef.current
      ?.querySelectorAll('.pv-object-active')
      .forEach((el) => el.classList.remove('pv-object-active'));
  }, [editorRef]);

  /** Выделяет объект под курсором мыши */
  const select = useCallback(
    (el: HTMLElement | null) => {
      clearMarks();

      if (el) el.classList.add('pv-object-active');
      setSelected(el);
    },
    [clearMarks],
  );

  /* клик по объекту выделяет его, клик мимо — снимает выделение */
  useEffect(() => {
    const root = editorRef.current;
    if (!root) return;

    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const obj = target.closest?.('.pv-object') as HTMLElement | null;

      if (!obj) {
        select(null);
        return;
      }

      /* внутри надписи текст правится обычным образом */
      if (target.closest('.pv-textbox-body')) {
        select(obj);
        return;
      }

      select(obj);
      e.preventDefault();

      const rect = obj.getBoundingClientRect();
      const handle = target.classList.contains('pv-object-handle');

      /* объект «за текстом» и «перед текстом» двигается свободно */
      const free =
        obj.dataset.wrap === 'behind' || obj.dataset.wrap === 'front';

      if (!handle && !free) return;

      drag.current = {
        el: obj,
        mode: handle ? 'resize' : 'move',
        startX: e.clientX,
        startY: e.clientY,
        width: rect.width,
        height: rect.height,
        left: parseFloat(obj.style.left) || 0,
        top: parseFloat(obj.style.top) || 0,
      };
    };

    const onMove = (e: MouseEvent) => {
      const d = drag.current;
      if (!d) return;

      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;

      if (d.mode === 'resize') {
        d.el.style.width = `${Math.max(24, d.width + dx)}px`;
        d.el.style.height = `${Math.max(16, d.height + dy)}px`;
        return;
      }

      d.el.style.left = `${d.left + dx}px`;
      d.el.style.top = `${d.top + dy}px`;
    };

    const onUp = () => {
      if (drag.current) {
        drag.current = null;
        recount();
      }
    };

    root.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
      root.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [editorRef, select, recount]);

  /* Delete убирает выбранный объект */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selected) return;
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;

      /* внутри надписи Delete правит текст, а не удаляет рамку */
      const inside = document
        .getSelection()
        ?.anchorNode?.parentElement?.closest('.pv-textbox-body');

      if (inside) return;

      e.preventDefault();
      selected.remove();
      setSelected(null);
      recount();
      notify('Объект удалён');
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, recount, notify]);

  const insertShape = useCallback(
    (kind: ShapeKind, text?: string) => {
      exec(
        'insertHTML',
        shapeHtml({
          kind,
          width: kind === 'line' ? 220 : 150,
          height: kind === 'line' ? 24 : 90,
          style: DEFAULT_SHAPE_STYLE,
          text,
          wrap: 'inline',
        }) + '&nbsp;',
      );

      recount();
      notify('Фигура добавлена', 'Потяните за уголок, чтобы изменить размер');
    },
    [exec, recount, notify],
  );

  const insertTextBox = useCallback(() => {
    exec(
      'insertHTML',
      textBoxHtml({
        width: 260,
        height: 110,
        wrap: 'square',
        text: 'Введите текст надписи',
        border: true,
        fill: '#ffffff',
      }) + '&nbsp;',
    );

    recount();
    notify('Надпись добавлена', 'Щёлкните внутри, чтобы набрать текст');
  }, [exec, recount, notify]);

  const insertWordArt = useCallback(
    (text: string, css: string, size: number) => {
      exec('insertHTML', wordArtHtml({ text, css, size, wrap: 'inline' }) + '&nbsp;');
      recount();
      notify('Фигурный текст добавлен');
    },
    [exec, recount, notify],
  );

  /** Меняет обтекание у выделенного объекта */
  const setWrap = useCallback(
    (wrap: WrapMode) => {
      if (!selected) {
        notify('Выберите объект', 'Щёлкните по фигуре или надписи');
        return;
      }

      applyWrap(selected, wrap);

      /* свободным режимам нужна точка отсчёта */
      if (wrap === 'behind' || wrap === 'front') {
        selected.style.left = selected.style.left || '40px';
        selected.style.top = selected.style.top || '20px';
      }

      recount();
      notify('Обтекание изменено');
    },
    [selected, recount, notify],
  );

  /** Заливка и контур выбранной фигуры */
  const styleShape = useCallback(
    (patch: { fill?: string; stroke?: string; opacity?: number }) => {
      const body = selected?.querySelector<HTMLElement>('.pv-shape-body');
      if (!body) {
        notify('Выберите фигуру');
        return;
      }

      if (patch.fill) body.style.background = patch.fill;
      if (patch.stroke) {
        body.style.borderColor = patch.stroke;
        if (!body.style.borderWidth) body.style.border = `1px solid ${patch.stroke}`;
      }
      if (patch.opacity !== undefined) {
        body.style.opacity = String(patch.opacity / 100);
      }

      recount();
    },
    [selected, recount, notify],
  );

  /** Порядок наложения объектов */
  const setOrder = useCallback(
    (dir: 'front' | 'back') => {
      if (!selected) {
        notify('Выберите объект');
        return;
      }

      selected.style.zIndex = dir === 'front' ? '10' : '0';
      recount();
      notify(dir === 'front' ? 'На передний план' : 'На задний план');
    },
    [selected, recount, notify],
  );

  return {
    selected,
    shapeDialog,
    setShapeDialog,
    wordArtDialog,
    setWordArtDialog,
    insertShape,
    insertTextBox,
    insertWordArt,
    setWrap,
    styleShape,
    setOrder,
    select,
  };
};
