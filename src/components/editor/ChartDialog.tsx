import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { ChartKind, ChartSetup } from '@/lib/chart';
import {
  CHART_KINDS,
  DEFAULT_CHART,
  PALETTES,
  chartSvg,
  parseTableText,
} from '@/lib/chart';

interface Props {
  open: boolean;
  initial?: ChartSetup | null;
  onClose: () => void;
  onApply: (setup: ChartSetup) => void;
}

const inputCls =
  'h-[24px] w-full rounded-[2px] border border-slate-300 bg-white px-1 text-[12px] outline-none focus:border-primary';

/** Окно диаграммы: выбор вида и таблица данных */
const ChartDialog = ({ open, initial, onClose, onApply }: Props) => {
  const [s, setS] = useState<ChartSetup>(initial ?? DEFAULT_CHART);
  const [tab, setTab] = useState<'kind' | 'data' | 'look'>('kind');

  useEffect(() => {
    if (!open) return;
    setS(initial ?? DEFAULT_CHART);
    setTab(initial ? 'data' : 'kind');
  }, [open, initial]);

  if (!open) return null;

  const patch = (v: Partial<ChartSetup>) => setS((x) => ({ ...x, ...v }));

  const setCell = (si: number, ci: number, raw: string) => {
    const value = Number(raw.replace(',', '.'));

    setS((x) => ({
      ...x,
      data: {
        ...x.data,
        series: x.data.series.map((ser, i) =>
          i === si
            ? {
                ...ser,
                values: ser.values.map((v, j) =>
                  j === ci ? (Number.isFinite(value) ? value : 0) : v,
                ),
              }
            : ser,
        ),
      },
    }));
  };

  const setSeriesName = (si: number, name: string) =>
    setS((x) => ({
      ...x,
      data: {
        ...x.data,
        series: x.data.series.map((ser, i) =>
          i === si ? { ...ser, name } : ser,
        ),
      },
    }));

  const setCategory = (ci: number, name: string) =>
    setS((x) => ({
      ...x,
      data: {
        ...x.data,
        categories: x.data.categories.map((c, i) => (i === ci ? name : c)),
      },
    }));

  const addRow = () =>
    setS((x) => ({
      ...x,
      data: {
        ...x.data,
        series: [
          ...x.data.series,
          {
            name: `Ряд ${x.data.series.length + 1}`,
            values: x.data.categories.map(() => 0),
          },
        ],
      },
    }));

  const addColumn = () =>
    setS((x) => ({
      ...x,
      data: {
        categories: [
          ...x.data.categories,
          `Категория ${x.data.categories.length + 1}`,
        ],
        series: x.data.series.map((ser) => ({
          ...ser,
          values: [...ser.values, 0],
        })),
      },
    }));

  const removeRow = (si: number) =>
    setS((x) => ({
      ...x,
      data: {
        ...x.data,
        series: x.data.series.filter((_, i) => i !== si),
      },
    }));

  const removeColumn = (ci: number) =>
    setS((x) => ({
      ...x,
      data: {
        categories: x.data.categories.filter((_, i) => i !== ci),
        series: x.data.series.map((ser) => ({
          ...ser,
          values: ser.values.filter((_, i) => i !== ci),
        })),
      },
    }));

  /* вставка таблицы из буфера — переносим данные целиком */
  const onPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text/plain');
    if (!text.includes('\t') && !text.includes(';')) return;

    const data = parseTableText(text);
    if (!data) return;

    e.preventDefault();
    patch({ data });
  };

  const TABS = [
    { id: 'kind' as const, label: 'Тип диаграммы' },
    { id: 'data' as const, label: 'Данные' },
    { id: 'look' as const, label: 'Оформление' },
  ];

  return (
    <div
      className="fixed inset-0 z-[112] flex items-center justify-center bg-slate-900/30"
      onMouseDown={onClose}
    >
      <div
        className="w-[720px] rounded-md bg-[hsl(var(--win-ribbon))] shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          className="flex h-8 items-center justify-between px-3 text-[12px]"
          style={{
            background: 'hsl(var(--win-title))',
            color: 'hsl(var(--win-title-text))',
          }}
        >
          <span>{initial ? 'Изменение диаграммы' : 'Вставка диаграммы'}</span>
          <button type="button" onClick={onClose} className="px-1">
            ✕
          </button>
        </div>

        <div className="flex gap-1 border-b border-slate-300 px-4 pt-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-t-[3px] border border-b-0 px-3 py-1.5 text-[12px] ${
                tab === t.id
                  ? 'border-slate-300 bg-white font-medium'
                  : 'border-transparent text-slate-600 hover:bg-white/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-4 p-4">
          <div className="min-w-0 flex-1">
            {tab === 'kind' && (
              <div className="grid grid-cols-4 gap-1">
                {CHART_KINDS.map((k) => (
                  <button
                    key={k.value}
                    type="button"
                    title={k.hint}
                    onClick={() => patch({ kind: k.value as ChartKind })}
                    className={`flex h-[68px] flex-col items-center justify-center gap-1 rounded-[2px] border px-1 ${
                      s.kind === k.value
                        ? 'border-[hsl(var(--win-title))] bg-[hsl(var(--win-hover))]'
                        : 'border-slate-300 bg-white hover:border-[hsl(var(--win-title))]'
                    }`}
                  >
                    <Icon name={k.icon} size={20} className="text-[hsl(215_45%_45%)]" />
                    <span className="text-center text-[10px] leading-[1.1]">
                      {k.label}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {tab === 'data' && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={addRow}>
                    <Icon name="Plus" size={12} className="mr-1" />
                    Строка
                  </Button>
                  <Button variant="outline" size="sm" onClick={addColumn}>
                    <Icon name="Plus" size={12} className="mr-1" />
                    Столбец
                  </Button>
                  <span className="text-[10px] text-slate-500">
                    Таблицу можно вставить из буфера
                  </span>
                </div>

                <div
                  className="max-h-[230px] overflow-auto rounded-[2px] border border-slate-300 bg-white"
                  onPaste={onPaste}
                >
                  <table className="w-full border-collapse text-[12px]">
                    <thead>
                      <tr>
                        <th className="sticky left-0 z-10 w-[92px] border border-slate-200 bg-[hsl(0_0%_96%)] p-[2px] text-[10px] font-normal text-slate-500">
                          Ряд \ Категория
                        </th>
                        {s.data.categories.map((c, ci) => (
                          <th
                            key={ci}
                            className="group border border-slate-200 bg-[hsl(0_0%_96%)] p-[2px]"
                          >
                            <div className="flex items-center gap-[2px]">
                              <input
                                value={c}
                                onChange={(e) => setCategory(ci, e.target.value)}
                                className={inputCls}
                              />
                              {s.data.categories.length > 1 && (
                                <button
                                  type="button"
                                  title="Удалить столбец"
                                  onClick={() => removeColumn(ci)}
                                  className="opacity-0 group-hover:opacity-100"
                                >
                                  <Icon name="X" size={11} />
                                </button>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {s.data.series.map((ser, si) => (
                        <tr key={si} className="group">
                          <td className="sticky left-0 z-10 border border-slate-200 bg-[hsl(0_0%_98%)] p-[2px]">
                            <div className="flex items-center gap-[2px]">
                              <input
                                value={ser.name}
                                onChange={(e) =>
                                  setSeriesName(si, e.target.value)
                                }
                                className={inputCls}
                              />
                              {s.data.series.length > 1 && (
                                <button
                                  type="button"
                                  title="Удалить строку"
                                  onClick={() => removeRow(si)}
                                  className="opacity-0 group-hover:opacity-100"
                                >
                                  <Icon name="X" size={11} />
                                </button>
                              )}
                            </div>
                          </td>
                          {s.data.categories.map((_, ci) => (
                            <td
                              key={ci}
                              className="border border-slate-200 p-[2px]"
                            >
                              <input
                                value={String(ser.values[ci] ?? 0).replace(
                                  '.',
                                  ',',
                                )}
                                onChange={(e) =>
                                  setCell(si, ci, e.target.value)
                                }
                                className={`${inputCls} text-right`}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="mt-1 text-[10px] text-slate-500">
                  Строка таблицы — это серия данных, столбец — категория
                </p>
              </div>
            )}

            {tab === 'look' && (
              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-[11px] text-slate-600">
                    Название диаграммы
                  </p>
                  <input
                    value={s.title}
                    onChange={(e) => patch({ title: e.target.value })}
                    className="h-[26px] w-full rounded-[2px] border border-slate-300 bg-white px-1.5 text-[12px] outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <p className="mb-1 text-[11px] text-slate-600">Цвета</p>
                  <div className="flex flex-wrap gap-1">
                    {PALETTES.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        title={p.label}
                        onClick={() => patch({ palette: p.colors })}
                        className={`flex gap-[1px] rounded-[2px] border p-1 ${
                          s.palette[0] === p.colors[0]
                            ? 'border-[hsl(var(--win-title))]'
                            : 'border-slate-300'
                        }`}
                      >
                        {p.colors.slice(0, 5).map((c) => (
                          <span
                            key={c}
                            className="h-[14px] w-[9px] rounded-[1px]"
                            style={{ background: c }}
                          />
                        ))}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  {[
                    {
                      key: 'legend' as const,
                      label: 'Легенда — имена серий под диаграммой',
                    },
                    {
                      key: 'dataLabels' as const,
                      label: 'Подписи значений на диаграмме',
                    },
                    { key: 'gridLines' as const, label: 'Линии сетки' },
                  ].map((c) => (
                    <label
                      key={c.key}
                      className="flex cursor-pointer items-center gap-1.5 text-[12px] text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={s[c.key]}
                        onChange={(e) => patch({ [c.key]: e.target.checked })}
                        className="h-3.5 w-3.5 accent-[hsl(var(--win-title))]"
                      />
                      {c.label}
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <div className="w-[110px]">
                    <p className="mb-1 text-[11px] text-slate-600">Ширина, px</p>
                    <input
                      type="number"
                      min={200}
                      max={900}
                      value={s.width}
                      onChange={(e) =>
                        patch({ width: Number(e.target.value) || 460 })
                      }
                      className="h-[26px] w-full rounded-[2px] border border-slate-300 bg-white px-1.5 text-[12px] outline-none"
                    />
                  </div>
                  <div className="w-[110px]">
                    <p className="mb-1 text-[11px] text-slate-600">Высота, px</p>
                    <input
                      type="number"
                      min={150}
                      max={700}
                      value={s.height}
                      onChange={(e) =>
                        patch({ height: Number(e.target.value) || 280 })
                      }
                      className="h-[26px] w-full rounded-[2px] border border-slate-300 bg-white px-1.5 text-[12px] outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* образец */}
          <div className="w-[290px] shrink-0">
            <p className="mb-1 text-[11px] text-slate-600">Образец</p>
            <div
              className="flex items-center justify-center overflow-hidden rounded-[2px] border border-slate-300 bg-white p-1"
              style={{ height: 240 }}
              dangerouslySetInnerHTML={{
                __html: chartSvg({ ...s, width: 274, height: 228 }),
              }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-300 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onApply(s);
              onClose();
            }}
          >
            {initial ? 'Применить' : 'Вставить'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChartDialog;
