import { useCallback, useEffect, useState } from 'react';
import type { ChartSetup } from '@/lib/chart';
import { chartHtml, readChart } from '@/lib/chart';

interface Options {
  editorRef: React.RefObject<HTMLDivElement>;
  exec: (command: string, value?: string) => void;
  recount: () => void;
  notify: (title: string, description?: string) => void;
}

/** Диаграммы: вставка, изменение данных, повторное открытие */
export const useCharts = ({ editorRef, exec, recount, notify }: Options) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  /* какую диаграмму правим; null — создаём новую */
  const [editing, setEditing] = useState<HTMLElement | null>(null);
  const [initial, setInitial] = useState<ChartSetup | null>(null);

  /** Двойной щелчок по диаграмме открывает её данные */
  useEffect(() => {
    const root = editorRef.current;
    if (!root) return;

    const onDouble = (e: MouseEvent) => {
      const chart = (e.target as HTMLElement).closest?.(
        '.pv-chart',
      ) as HTMLElement | null;

      if (!chart) return;

      e.preventDefault();

      const setup = readChart(chart);
      if (!setup) return;

      setEditing(chart);
      setInitial(setup);
      setDialogOpen(true);
    };

    root.addEventListener('dblclick', onDouble);
    return () => root.removeEventListener('dblclick', onDouble);
  }, [editorRef]);

  const open = useCallback(() => {
    setEditing(null);
    setInitial(null);
    setDialogOpen(true);
  }, []);

  const apply = useCallback(
    (setup: ChartSetup) => {
      /* правим существующую — подменяем её разметку на месте */
      if (editing) {
        const holder = document.createElement('div');
        holder.innerHTML = chartHtml(setup);

        const next = holder.firstElementChild;
        if (next) editing.replaceWith(next);

        setEditing(null);
        recount();
        notify('Диаграмма обновлена');
        return;
      }

      exec('insertHTML', `${chartHtml(setup)}&nbsp;`);
      recount();
      notify(
        'Диаграмма добавлена',
        'Дважды щёлкните по ней, чтобы изменить данные',
      );
    },
    [editing, exec, recount, notify],
  );

  /** Открывает данные выбранной диаграммы — кнопка «Изменить данные» */
  const editSelected = useCallback(() => {
    const node = window.getSelection()?.anchorNode;

    const chart = (
      node?.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element)
    )?.closest?.('.pv-chart') as HTMLElement | null;

    const target =
      chart ?? editorRef.current?.querySelector<HTMLElement>('.pv-chart');

    if (!target) {
      notify('Диаграмм в документе нет');
      return;
    }

    const setup = readChart(target);
    if (!setup) return;

    setEditing(target);
    setInitial(setup);
    setDialogOpen(true);
  }, [editorRef, notify]);

  return {
    dialogOpen,
    setDialogOpen,
    initial,
    open,
    apply,
    editSelected,
  };
};
