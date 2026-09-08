import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
  onInsert: (rows: number, cols: number, header: boolean) => void;
}

const MAX_ROWS = 8;
const MAX_COLS = 10;

/** Вставка таблицы: сетка для быстрого выбора и точные поля размера */
const TableDialog = ({ open, onClose, onInsert }: Props) => {
  const [hover, setHover] = useState({ r: 0, c: 0 });
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [header, setHeader] = useState(true);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/30"
      onMouseDown={onClose}
    >
      <div
        className="w-[380px] rounded-md bg-[hsl(var(--win-ribbon))] shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          className="flex h-8 items-center justify-between px-3 text-[12px]"
          style={{
            background: 'hsl(var(--win-title))',
            color: 'hsl(var(--win-title-text))',
          }}
        >
          <span>Вставка таблицы</span>
          <button type="button" onClick={onClose} className="px-1">
            ✕
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <p className="mb-2 text-[11px] text-slate-600">
              {hover.r
                ? `Таблица ${hover.r} × ${hover.c}`
                : 'Наведите указатель, чтобы выбрать размер'}
            </p>

            <div
              className="inline-block rounded-[2px] border border-slate-300 bg-white p-1"
              onMouseLeave={() => setHover({ r: 0, c: 0 })}
            >
              {Array.from({ length: MAX_ROWS }).map((_, r) => (
                <div key={r} className="flex">
                  {Array.from({ length: MAX_COLS }).map((_, c) => {
                    const on = r < hover.r && c < hover.c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onMouseEnter={() => setHover({ r: r + 1, c: c + 1 })}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setRows(r + 1);
                          setCols(c + 1);
                          onInsert(r + 1, c + 1, header);
                        }}
                        className={`m-[1px] h-[15px] w-[15px] border ${
                          on
                            ? 'border-[hsl(var(--win-title))] bg-[hsl(var(--win-title))]/25'
                            : 'border-slate-300 bg-white'
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-600">Строк</span>
              <input
                type="number"
                min={1}
                max={50}
                value={rows}
                onChange={(e) => setRows(Math.max(1, Number(e.target.value)))}
                className="h-[26px] w-[80px] rounded-[2px] border border-slate-300 px-1.5 text-[12px] outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-600">Столбцов</span>
              <input
                type="number"
                min={1}
                max={20}
                value={cols}
                onChange={(e) => setCols(Math.max(1, Number(e.target.value)))}
                className="h-[26px] w-[80px] rounded-[2px] border border-slate-300 px-1.5 text-[12px] outline-none focus:border-primary"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-slate-700">
            <input
              type="checkbox"
              checked={header}
              onChange={(e) => setHeader(e.target.checked)}
              className="h-3.5 w-3.5 accent-[hsl(var(--win-title))]"
            />
            Строка заголовков
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-300 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button size="sm" onClick={() => onInsert(rows, cols, header)}>
            ОК
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TableDialog;
