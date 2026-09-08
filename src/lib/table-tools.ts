/**
 * Ближайший элемент к точке выделения. Курсор может стоять как в тексте,
 * так и на строке таблицы — учитываем оба случая.
 */
const elementAt = (node: Node | null, offset: number): HTMLElement | null => {
  if (!node) return null;

  if (node.nodeType === Node.TEXT_NODE) {
    return node.parentElement;
  }

  const children = node.childNodes;
  const child = children[Math.min(offset, children.length - 1)];

  if (child && child.nodeType === Node.ELEMENT_NODE) {
    return child as HTMLElement;
  }

  return node as HTMLElement;
};

/** Ячейка, в которой стоит курсор */
export const currentCell = (
  root: HTMLElement | null,
): HTMLTableCellElement | null => {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || !root) return null;

  const range = sel.getRangeAt(0);
  const el = elementAt(range.startContainer, range.startOffset);

  const cell = (el?.closest?.('td, th') ??
    el?.querySelector?.('td, th')) as HTMLTableCellElement | null;

  return cell && root.contains(cell) ? cell : null;
};

/** Таблица, в которой стоит курсор */
export const currentTable = (
  root: HTMLElement | null,
): HTMLTableElement | null => {
  const cell = currentCell(root);
  if (cell) return cell.closest('table');

  /* курсор может стоять и вне ячейки — например, сразу за таблицей */
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || !root) return null;

  const range = sel.getRangeAt(0);
  const el = elementAt(range.commonAncestorContainer, 0);
  const table = (el?.closest?.('table') ??
    el?.querySelector?.('table')) as HTMLTableElement | null;

  return table && root.contains(table) ? table : null;
};

/** Порядковый номер столбца с учётом объединённых ячеек */
const columnIndex = (cell: HTMLTableCellElement): number => {
  const row = cell.parentElement as HTMLTableRowElement;
  let index = 0;

  for (const c of Array.from(row.cells)) {
    if (c === cell) return index;
    index += c.colSpan || 1;
  }
  return index;
};

/** Строит таблицу заданного размера */
export const buildTable = (
  rows: number,
  cols: number,
  header: boolean,
): string => {
  let html = '<table class="pv-table">';

  if (header) {
    html += '<thead><tr>';
    for (let c = 0; c < cols; c += 1) html += `<th>Заголовок ${c + 1}</th>`;
    html += '</tr></thead>';
  }

  html += '<tbody>';
  for (let r = 0; r < rows; r += 1) {
    html += '<tr>';
    for (let c = 0; c < cols; c += 1) html += '<td><br></td>';
    html += '</tr>';
  }
  html += '</tbody></table><p><br></p>';

  return html;
};

/** Создаёт пустую ячейку того же типа, что образец */
const emptyLike = (sample: HTMLTableCellElement): HTMLTableCellElement => {
  const cell = document.createElement(sample.tagName.toLowerCase()) as HTMLTableCellElement;
  cell.innerHTML = '<br>';
  return cell;
};

/** Добавляет строку выше или ниже текущей */
export const insertRow = (
  root: HTMLElement | null,
  where: 'above' | 'below',
): boolean => {
  const cell = currentCell(root);
  const row = cell?.parentElement as HTMLTableRowElement | null;
  if (!cell || !row) return false;

  const fresh = document.createElement('tr');
  const count = Array.from(row.cells).reduce((n, c) => n + (c.colSpan || 1), 0);

  for (let i = 0; i < count; i += 1) {
    const td = document.createElement('td');
    td.innerHTML = '<br>';
    fresh.appendChild(td);
  }

  /* строку над шапкой добавляем в тело таблицы, иначе она станет заголовком */
  if (where === 'above' && row.parentElement?.tagName === 'THEAD') {
    const body = row.closest('table')?.querySelector('tbody');
    body?.insertBefore(fresh, body.firstChild);
    return true;
  }

  row.parentElement?.insertBefore(fresh, where === 'above' ? row : row.nextSibling);
  return true;
};

/** Добавляет столбец слева или справа от текущего */
export const insertColumn = (
  root: HTMLElement | null,
  where: 'left' | 'right',
): boolean => {
  const cell = currentCell(root);
  const table = cell?.closest('table');
  if (!cell || !table) return false;

  const target = columnIndex(cell);

  Array.from(table.rows).forEach((row) => {
    let index = 0;
    let placed = false;

    for (const c of Array.from(row.cells)) {
      const span = c.colSpan || 1;

      if (index <= target && target < index + span) {
        const fresh = emptyLike(c);
        row.insertBefore(fresh, where === 'left' ? c : c.nextSibling);
        placed = true;
        break;
      }
      index += span;
    }

    if (!placed && row.cells.length) {
      row.appendChild(emptyLike(row.cells[row.cells.length - 1]));
    }
  });

  return true;
};

/** Удаляет строку с курсором; последнюю строку убираем вместе с таблицей */
export const deleteRow = (root: HTMLElement | null): boolean => {
  const cell = currentCell(root);
  const row = cell?.parentElement as HTMLTableRowElement | null;
  const table = cell?.closest('table');
  if (!row || !table) return false;

  if (table.rows.length <= 1) {
    table.remove();
    return true;
  }

  row.remove();
  return true;
};

/** Удаляет столбец с курсором */
export const deleteColumn = (root: HTMLElement | null): boolean => {
  const cell = currentCell(root);
  const table = cell?.closest('table');
  if (!cell || !table) return false;

  const target = columnIndex(cell);
  const width = Array.from(table.rows[0]?.cells ?? []).reduce(
    (n, c) => n + (c.colSpan || 1),
    0,
  );

  if (width <= 1) {
    table.remove();
    return true;
  }

  Array.from(table.rows).forEach((row) => {
    let index = 0;

    for (const c of Array.from(row.cells)) {
      const span = c.colSpan || 1;

      if (index <= target && target < index + span) {
        if (span > 1) c.colSpan = span - 1;
        else c.remove();
        break;
      }
      index += span;
    }
  });

  return true;
};

/** Удаляет всю таблицу */
export const deleteTable = (root: HTMLElement | null): boolean => {
  const table = currentTable(root);
  if (!table) return false;
  table.remove();
  return true;
};

/** Ячейки, попавшие в выделение */
export const selectedCells = (
  root: HTMLElement | null,
): HTMLTableCellElement[] => {
  const table = currentTable(root);
  if (!table) return [];

  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return [];

  const range = sel.getRangeAt(0);
  const cells = Array.from(table.querySelectorAll<HTMLTableCellElement>('td, th'))
    .filter((c) => range.intersectsNode(c));

  if (cells.length > 1) return cells;

  const single = currentCell(root);
  return single ? [single] : [];
};

/**
 * Объединяет выделенные ячейки. Ячейки одной строки сливаются по
 * горизонтали, ячейки одного столбца — по вертикали.
 */
export const mergeCells = (root: HTMLElement | null): number => {
  const cells = selectedCells(root);
  if (cells.length < 2) return 0;

  const rows = new Set(cells.map((c) => c.parentElement));
  const first = cells[0];

  const text = cells
    .map((c) => c.innerHTML.replace(/<br\s*\/?>/gi, ' ').trim())
    .filter(Boolean)
    .join(' ');

  if (rows.size === 1) {
    first.colSpan = cells.reduce((n, c) => n + (c.colSpan || 1), 0);
  } else {
    const column = columnIndex(first);
    const sameColumn = cells.filter((c) => columnIndex(c) === column);

    if (sameColumn.length < 2) return 0;

    first.rowSpan = sameColumn.reduce((n, c) => n + (c.rowSpan || 1), 0);
    sameColumn.slice(1).forEach((c) => c.remove());
    first.innerHTML = text || '<br>';
    return sameColumn.length;
  }

  first.innerHTML = text || '<br>';
  cells.slice(1).forEach((c) => c.remove());
  return cells.length;
};

/** Разбивает объединённую ячейку обратно на несколько */
export const splitCell = (root: HTMLElement | null, parts = 2): boolean => {
  const cell = currentCell(root);
  if (!cell) return false;

  const span = cell.colSpan || 1;
  const rowSpan = cell.rowSpan || 1;
  const row = cell.parentElement as HTMLTableRowElement;

  /* сначала возвращаем ячейки, объединённые по вертикали */
  if (rowSpan > 1) {
    const table = cell.closest('table');
    const rows = Array.from(table?.rows ?? []);
    const start = rows.indexOf(row);
    const column = columnIndex(cell);

    cell.rowSpan = 1;

    for (let i = 1; i < rowSpan; i += 1) {
      const target = rows[start + i];
      if (!target) break;

      const fresh = emptyLike(cell);
      const before = target.cells[Math.min(column, target.cells.length)] ?? null;
      target.insertBefore(fresh, before);
    }
    return true;
  }

  if (span > 1) {
    cell.colSpan = 1;
    for (let i = 1; i < span; i += 1) {
      row.insertBefore(emptyLike(cell), cell.nextSibling);
    }
    return true;
  }

  /* обычную ячейку делим, добавляя столбец во всю таблицу */
  for (let i = 1; i < parts; i += 1) {
    row.insertBefore(emptyLike(cell), cell.nextSibling);
  }

  const table = cell.closest('table');
  Array.from(table?.rows ?? []).forEach((r) => {
    if (r === row) return;
    const last = r.cells[r.cells.length - 1];
    if (last) last.colSpan = (last.colSpan || 1) + parts - 1;
  });

  return true;
};

export type BorderSide = 'all' | 'outside' | 'inside' | 'none';

/** Границы таблицы: толщина, цвет и какие именно линии показывать */
export const setTableBorders = (
  root: HTMLElement | null,
  side: BorderSide,
  color = '#808080',
  width = 1,
  style = 'solid',
): boolean => {
  const table = currentTable(root);
  if (!table) return false;

  const line = `${width}px ${style} ${color}`;
  const cells = Array.from(table.querySelectorAll<HTMLTableCellElement>('td, th'));
  const rows = Array.from(table.rows);

  cells.forEach((c) => {
    c.style.border = side === 'none' ? 'none' : line;
  });

  table.style.border = side === 'none' ? 'none' : line;

  if (side === 'outside') {
    cells.forEach((c) => {
      c.style.border = 'none';
    });
    rows.forEach((row, ri) => {
      Array.from(row.cells).forEach((c, ci) => {
        if (ri === 0) c.style.borderTop = line;
        if (ri === rows.length - 1) c.style.borderBottom = line;
        if (ci === 0) c.style.borderLeft = line;
        if (ci === row.cells.length - 1) c.style.borderRight = line;
      });
    });
  }

  if (side === 'inside') {
    table.style.border = 'none';
    rows.forEach((row, ri) => {
      Array.from(row.cells).forEach((c, ci) => {
        c.style.border = 'none';
        if (ri > 0) c.style.borderTop = line;
        if (ci > 0) c.style.borderLeft = line;
      });
    });
  }

  return true;
};

/** Заливка выделенных ячеек */
export const setCellShading = (
  root: HTMLElement | null,
  color: string,
): number => {
  const cells = selectedCells(root);
  cells.forEach((c) => {
    c.style.backgroundColor = color;
  });
  return cells.length;
};

/** Выравнивание содержимого ячеек по горизонтали и вертикали */
export const setCellAlign = (
  root: HTMLElement | null,
  horizontal: 'left' | 'center' | 'right',
  vertical: 'top' | 'middle' | 'bottom',
): number => {
  const cells = selectedCells(root);
  cells.forEach((c) => {
    c.style.textAlign = horizontal;
    c.style.verticalAlign = vertical;
  });
  return cells.length;
};

/** Готовые оформления таблицы, как экспресс-стили Word */
export const TABLE_STYLES = [
  { id: 'plain', label: 'Обычная', head: '#f2f2f2', line: '#808080', stripe: '' },
  { id: 'grid', label: 'Сетка', head: '#d9e2f3', line: '#4472c4', stripe: '' },
  { id: 'stripe', label: 'Полосы', head: '#4472c4', line: '#8faadc', stripe: '#eef2fa' },
  { id: 'accent', label: 'Акцент', head: '#2f5496', line: '#2f5496', stripe: '' },
  { id: 'light', label: 'Светлая', head: '#ffffff', line: '#bfbfbf', stripe: '' },
] as const;

/** Применяет готовое оформление ко всей таблице */
export const applyTableStyle = (
  root: HTMLElement | null,
  id: string,
): boolean => {
  const table = currentTable(root);
  const preset = TABLE_STYLES.find((s) => s.id === id);
  if (!table || !preset) return false;

  const line = `1px solid ${preset.line}`;
  const dark = preset.head === '#4472c4' || preset.head === '#2f5496';

  Array.from(table.querySelectorAll<HTMLTableCellElement>('td, th')).forEach(
    (c) => {
      c.style.border = line;
      c.style.backgroundColor = '';
      c.style.color = '';
    },
  );

  Array.from(table.querySelectorAll<HTMLTableCellElement>('th')).forEach((c) => {
    c.style.backgroundColor = preset.head;
    if (dark) c.style.color = '#ffffff';
  });

  if (preset.stripe) {
    const body = table.querySelector('tbody');
    Array.from(body?.rows ?? []).forEach((row, i) => {
      if (i % 2 === 1) {
        Array.from(row.cells).forEach((c) => {
          c.style.backgroundColor = preset.stripe;
        });
      }
    });
  }

  table.setAttribute('data-style', id);
  return true;
};

/** Сортировка строк таблицы по выбранному столбцу */
export const sortTable = (
  root: HTMLElement | null,
  desc = false,
): boolean => {
  const cell = currentCell(root);
  const table = cell?.closest('table');
  const body = table?.querySelector('tbody');
  if (!cell || !body) return false;

  const target = columnIndex(cell);
  const rows = Array.from(body.rows);

  rows
    .sort((a, b) => {
      const x = a.cells[target]?.textContent?.trim() ?? '';
      const y = b.cells[target]?.textContent?.trim() ?? '';

      const nx = parseFloat(x.replace(',', '.'));
      const ny = parseFloat(y.replace(',', '.'));

      const r =
        !Number.isNaN(nx) && !Number.isNaN(ny)
          ? nx - ny
          : x.localeCompare(y, 'ru');

      return desc ? -r : r;
    })
    .forEach((row) => body.appendChild(row));

  return true;
};

/** Сумма чисел в столбце — простое вычисление из темы про таблицы */
export const sumColumn = (root: HTMLElement | null): number | null => {
  const cell = currentCell(root);
  const table = cell?.closest('table');
  const body = table?.querySelector('tbody');
  if (!cell || !body) return null;

  const target = columnIndex(cell);
  let total = 0;
  let found = false;

  Array.from(body.rows).forEach((row) => {
    if (row.contains(cell)) return;
    const text = row.cells[target]?.textContent?.trim().replace(',', '.') ?? '';
    const n = parseFloat(text);
    if (!Number.isNaN(n)) {
      total += n;
      found = true;
    }
  });

  return found ? Number(total.toFixed(2)) : null;
};