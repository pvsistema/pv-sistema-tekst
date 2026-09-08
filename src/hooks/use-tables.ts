import { useCallback, useEffect, useState } from 'react';
import * as T from '@/lib/table-tools';

interface Options {
  editorRef: React.RefObject<HTMLDivElement>;
  exec: (command: string, value?: string) => void;
  recount: () => void;
  notify: (title: string, description?: string) => void;
}

/** Работа с таблицами: вставка, строки, столбцы, объединение, оформление */
export const useTables = ({ editorRef, exec, recount, notify }: Options) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  /* курсор внутри таблицы — показываем контекстную вкладку */
  const [inTable, setInTable] = useState(false);
  const [borderColor, setBorderColor] = useState('#4472c4');

  const root = () => editorRef.current;

  /* следим, где стоит курсор */
  useEffect(() => {
    const check = () => setInTable(!!T.currentTable(editorRef.current));

    document.addEventListener('selectionchange', check);
    return () => document.removeEventListener('selectionchange', check);
  }, [editorRef]);

  const insert = useCallback(
    (rows: number, cols: number, header: boolean) => {
      setDialogOpen(false);
      exec('insertHTML', T.buildTable(rows, cols, header));
      recount();
      notify('Таблица вставлена', `${rows} × ${cols}`);
    },
    [exec, recount, notify],
  );

  /** Выполняет операцию и сообщает, если курсор не в таблице */
  const run = useCallback(
    (action: () => boolean | number, ok: string, fail?: string) => {
      const result = action();
      if (!result) {
        notify(
          fail ?? 'Курсор не в таблице',
          'Установите курсор в ячейку таблицы',
        );
        return;
      }
      recount();
      notify(ok);
    },
    [recount, notify],
  );

  const addRow = useCallback(
    (where: 'above' | 'below') =>
      run(
        () => T.insertRow(root(), where),
        where === 'above' ? 'Строка добавлена сверху' : 'Строка добавлена снизу',
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [run],
  );

  const addColumn = useCallback(
    (where: 'left' | 'right') =>
      run(
        () => T.insertColumn(root(), where),
        where === 'left' ? 'Столбец добавлен слева' : 'Столбец добавлен справа',
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [run],
  );

  const removeRow = useCallback(
    () => run(() => T.deleteRow(root()), 'Строка удалена'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [run],
  );

  const removeColumn = useCallback(
    () => run(() => T.deleteColumn(root()), 'Столбец удалён'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [run],
  );

  const removeTable = useCallback(
    () => run(() => T.deleteTable(root()), 'Таблица удалена'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [run],
  );

  const merge = useCallback(
    () =>
      run(
        () => T.mergeCells(root()),
        'Ячейки объединены',
        'Выделите две ячейки или более',
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [run],
  );

  const split = useCallback(
    () => run(() => T.splitCell(root()), 'Ячейка разделена'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [run],
  );

  const borders = useCallback(
    (side: T.BorderSide) =>
      run(
        () => T.setTableBorders(root(), side, borderColor),
        side === 'none' ? 'Границы убраны' : 'Границы применены',
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [run, borderColor],
  );

  const changeBorderColor = useCallback(
    (color: string) => {
      setBorderColor(color);
      run(() => T.setTableBorders(root(), 'all', color), 'Цвет границ изменён');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [run],
  );

  const shading = useCallback(
    (color: string) =>
      run(() => T.setCellShading(root(), color), 'Заливка применена'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [run],
  );

  const align = useCallback(
    (h: 'left' | 'center' | 'right', v: 'top' | 'middle' | 'bottom') =>
      run(() => T.setCellAlign(root(), h, v), 'Выравнивание применено'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [run],
  );

  const style = useCallback(
    (id: string) =>
      run(() => T.applyTableStyle(root(), id), 'Стиль таблицы применён'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [run],
  );

  const sort = useCallback(
    (desc: boolean) =>
      run(
        () => T.sortTable(root(), desc),
        desc ? 'Отсортировано по убыванию' : 'Отсортировано по возрастанию',
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [run],
  );

  /** Подставляет сумму чисел столбца в текущую ячейку */
  const sum = useCallback(() => {
    const cell = T.currentCell(root());
    const total = T.sumColumn(root());

    if (!cell || total === null) {
      notify('Не удалось посчитать', 'В столбце нет чисел');
      return;
    }

    cell.textContent = String(total).replace('.', ',');
    recount();
    notify(`Сумма по столбцу: ${String(total).replace('.', ',')}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recount, notify]);

  return {
    dialogOpen,
    setDialogOpen,
    inTable,
    insert,
    addRow,
    addColumn,
    removeRow,
    removeColumn,
    removeTable,
    merge,
    split,
    borders,
    changeBorderColor,
    shading,
    align,
    style,
    sort,
    sum,
  };
};
