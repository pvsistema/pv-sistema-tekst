import { useCallback, useEffect, useRef, useState } from 'react';

/** Какую границу поля тянут мышью */
export type MarginEdge = 'left' | 'right' | 'top' | 'bottom';

interface Options {
  /** Пикселей в сантиметре с учётом масштаба */
  pixelsPerCm: number;
  /** Размер листа по нужной стороне в сантиметрах */
  paperSize: (edge: MarginEdge) => number;
  /** Текущее значение поля в сантиметрах */
  current: (edge: MarginEdge) => number;
  /** Противоположное поле — чтобы полоса набора не исчезла */
  opposite: (edge: MarginEdge) => number;
  /** Сохранить новое значение поля */
  onChange: (edge: MarginEdge, valueCm: number) => void;
}

/** Меньше сантиметра текста на листе не оставляем */
const MIN_CONTENT_CM = 1;

/**
 * Перетаскивание полей мышью прямо по линейке, как в Word:
 * тянем границу серой зоны, и отступ меняется.
 */
export const useMarginDrag = ({
  pixelsPerCm,
  paperSize,
  current,
  opposite,
  onChange,
}: Options) => {
  const [edge, setEdge] = useState<MarginEdge | null>(null);
  const [hint, setHint] = useState<number | null>(null);

  /* исходная точка захвата и значение поля на момент нажатия */
  const from = useRef({ coord: 0, value: 0 });

  const start = useCallback(
    (target: MarginEdge, event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const vertical = target === 'top' || target === 'bottom';

      from.current = {
        coord: vertical ? event.clientY : event.clientX,
        value: current(target),
      };

      setEdge(target);
      setHint(current(target));
    },
    [current],
  );

  useEffect(() => {
    if (!edge) return;

    const vertical = edge === 'top' || edge === 'bottom';

    /* к правому и нижнему полю движение мыши применяется наоборот */
    const sign = edge === 'right' || edge === 'bottom' ? -1 : 1;

    const limit = paperSize(edge) - opposite(edge) - MIN_CONTENT_CM;

    const move = (e: MouseEvent) => {
      const now = vertical ? e.clientY : e.clientX;
      const shift = ((now - from.current.coord) / pixelsPerCm) * sign;

      /* шаг в полмиллиметра: тянется плавно, но без дребезга */
      const raw = from.current.value + shift;
      const value = Math.round(raw * 20) / 20;

      setHint(Math.min(Math.max(value, 0), Math.max(limit, 0)));
    };

    const up = () => setEdge(null);

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [edge, pixelsPerCm, paperSize, opposite]);

  /* отпустили мышь — сохраняем то, что показывала подсказка */
  const settled = useRef<MarginEdge | null>(null);

  useEffect(() => {
    if (edge) {
      settled.current = edge;
      return;
    }

    const target = settled.current;
    settled.current = null;

    if (target && hint !== null) onChange(target, hint);

    setHint(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edge]);

  return {
    /** Начать перетаскивание границы поля */
    start,
    /** Какую границу тянут сейчас */
    dragging: edge,
    /** Значение для показа во время перетаскивания */
    preview: hint,
  };
};
