import { useCallback, useEffect, useRef, useState } from 'react';

interface Options {
  editorRef: React.RefObject<HTMLDivElement>;
  recount: () => void;
  /** Масштаб листа: при увеличении мышь проходит меньше точек документа */
  zoom?: number;
}

/** Какой уголок держим мышью */
type Corner = 'nw' | 'ne' | 'sw' | 'se';

const CORNERS: Corner[] = ['nw', 'ne', 'sw', 'se'];

/** Как выглядит курсор над уголком */
const CURSOR: Record<Corner, string> = {
  nw: 'nwse-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  se: 'nwse-resize',
};

/** Где стоит уголок относительно картинки */
const PLACE: Record<Corner, { x: string; y: string }> = {
  nw: { x: 'left', y: 'top' },
  ne: { x: 'right', y: 'top' },
  sw: { x: 'left', y: 'bottom' },
  se: { x: 'right', y: 'bottom' },
};

const MIN_SIZE = 24;

/**
 * Изменение размера картинки мышью за уголок.
 * Рамка с уголками рисуется поверх листа и следует за картинкой.
 */
export const useImageResize = ({ editorRef, recount, zoom = 1 }: Options) => {
  const [selected, setSelected] = useState<HTMLImageElement | null>(null);

  /* рамка живёт вне разметки документа, чтобы не попасть в текст */
  const frame = useRef<HTMLDivElement | null>(null);

  const drag = useRef<{
    img: HTMLImageElement;
    corner: Corner;
    startX: number;
    startY: number;
    width: number;
    height: number;
    ratio: number;
  } | null>(null);

  /** Ставит рамку по месту картинки */
  const place = useCallback(() => {
    const box = frame.current;
    const img = selected;

    if (!box) return;

    if (!img || !img.isConnected) {
      box.style.display = 'none';
      return;
    }

    /*
     * Рамку ставим по месту картинки внутри самого листа: считаем
     * смещение от листа, а не от прокручиваемой области, иначе рамка
     * уезжает при прокрутке.
     */
    const host = box.parentElement;
    const base = host?.getBoundingClientRect();

    /* прокрутка области с листом входит в смещение */
    const scrollTop = host?.scrollTop ?? 0;
    const scrollLeft = host?.scrollLeft ?? 0;
    const rect = img.getBoundingClientRect();

    const left = rect.left - (base?.left ?? 0) + scrollLeft;
    const top = rect.top - (base?.top ?? 0) + scrollTop;

    box.style.display = 'block';
    box.style.left = `${left}px`;
    box.style.top = `${top}px`;
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;
  }, [selected]);

  /* создаём рамку один раз и держим её рядом с листом */
  useEffect(() => {
    const root = editorRef.current;
    if (!root) return;

    /*
     * Рамку держим рядом с листом, а не внутри него: всё, что лежит
     * внутри области правки, попадает в сохранённый документ.
     */
    const host = root.parentElement;
    if (!host) return;

    const box = document.createElement('div');
    box.className = 'pv-img-frame';
    box.style.display = 'none';
    box.contentEditable = 'false';

    CORNERS.forEach((corner) => {
      const dot = document.createElement('div');

      dot.className = 'pv-img-handle';
      dot.dataset.corner = corner;
      dot.style.cursor = CURSOR[corner];
      dot.style[PLACE[corner].x as 'left'] = '-4px';
      dot.style[PLACE[corner].y as 'top'] = '-4px';

      box.appendChild(dot);
    });

    /* лист должен быть точкой отсчёта для рамки */
    if (getComputedStyle(host).position === 'static') {
      host.style.position = 'relative';
    }

    host.appendChild(box);
    frame.current = box;

    return () => {
      box.remove();
      frame.current = null;
    };
  }, [editorRef]);

  /* рамка следует за картинкой при правках и прокрутке */
  useEffect(() => {
    place();

    if (!selected) return;

    const onScroll = () => place();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [selected, place, zoom]);

  /* выбор картинки и перетаскивание уголка */
  useEffect(() => {
    const root = editorRef.current;
    const box = frame.current;

    if (!root) return;

    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      /* нажали уголок — начинаем менять размер */
      const corner = target.dataset?.corner as Corner | undefined;

      if (corner && selected) {
        e.preventDefault();

        const rect = selected.getBoundingClientRect();

        drag.current = {
          img: selected,
          corner,
          startX: e.clientX,
          startY: e.clientY,
          width: rect.width / zoom,
          height: rect.height / zoom,
          ratio: rect.width / Math.max(1, rect.height),
        };

        return;
      }

      if (target.tagName === 'IMG' && root.contains(target)) {
        setSelected(target as HTMLImageElement);
        return;
      }

      /* щелчок мимо картинки снимает выбор */
      if (!box?.contains(target)) setSelected(null);
    };

    const onMove = (e: MouseEvent) => {
      const d = drag.current;
      if (!d) return;

      e.preventDefault();

      /* уголок тянем «от себя»: для левых сторон знак обратный */
      const signX = d.corner === 'ne' || d.corner === 'se' ? 1 : -1;
      const signY = d.corner === 'sw' || d.corner === 'se' ? 1 : -1;

      const dx = ((e.clientX - d.startX) / zoom) * signX;
      const dy = ((e.clientY - d.startY) / zoom) * signY;

      /* пропорции сохраняем: ведём по той стороне, что двинулась сильнее */
      const byWidth = Math.abs(dx) > Math.abs(dy);

      const width = byWidth
        ? d.width + dx
        : Math.max(MIN_SIZE, d.height + dy) * d.ratio;

      const w = Math.max(MIN_SIZE, Math.round(width));

      d.img.style.width = `${w}px`;
      d.img.style.height = 'auto';

      /* размер в атрибутах — его читает сохранение в Word */
      d.img.setAttribute('width', String(w));
      d.img.setAttribute('height', String(Math.round(w / d.ratio)));

      place();
    };

    const onUp = () => {
      if (!drag.current) return;

      drag.current = null;
      place();
      recount();
    };

    /* правый щелчок по картинке тоже выбирает её — для меню */
    const onMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') setSelected(target as HTMLImageElement);
    };

    root.addEventListener('mousedown', onDown);
    root.addEventListener('contextmenu', onMenu);
    box?.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
      root.removeEventListener('mousedown', onDown);
      root.removeEventListener('contextmenu', onMenu);
      box?.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [editorRef, selected, zoom, place, recount]);

  /* Delete убирает выбранную картинку, Escape снимает выбор */
  useEffect(() => {
    if (!selected) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelected(null);
        return;
      }

      if (e.key !== 'Delete' && e.key !== 'Backspace') return;

      /* курсор стоит в тексте — там Delete работает как обычно */
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) return;

      e.preventDefault();
      selected.remove();

      setSelected(null);
      recount();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, recount]);

  /** Задаёт ширину выбранной картинки в процентах от строки */
  const setWidthPercent = useCallback(
    (percent: number) => {
      const img = selected;
      if (!img) return;

      img.style.width = `${percent}%`;
      img.style.height = 'auto';
      img.removeAttribute('width');
      img.removeAttribute('height');

      place();
      recount();
    },
    [selected, place, recount],
  );

  /** Убирает выбранную картинку из документа */
  const removeImage = useCallback(() => {
    if (!selected) return;

    selected.remove();
    setSelected(null);
    recount();
  }, [selected, recount]);

  return { selectedImage: selected, setWidthPercent, removeImage };
};
