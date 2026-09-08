import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { NumberPosition, PageFurniture } from '@/lib/page-numbers';
import { DEFAULT_FURNITURE, NUMBER_FORMAT_LABELS } from '@/lib/page-numbers';

interface Props {
  open: boolean;
  initial: PageFurniture;
  /** С какой части открыли окно */
  part: 'header' | 'footer';
  onClose: () => void;
  onApply: (f: PageFurniture) => void;
}

const inputCls =
  'h-[26px] rounded-[2px] border border-slate-300 bg-white px-1.5 text-[12px] outline-none focus:border-primary';

const Field = ({
  label,
  children,
  width,
}: {
  label: string;
  children: React.ReactNode;
  width?: number;
}) => (
  <div className="flex flex-col gap-1" style={width ? { width } : undefined}>
    <span className="text-[11px] text-slate-600">{label}</span>
    {children}
  </div>
);

/** Поля, которые можно вставить в колонтитул одним щелчком */
const FIELDS = [
  { code: '{СТРАНИЦА}', label: 'Номер страницы' },
  { code: '{ВСЕГО}', label: 'Всего страниц' },
  { code: '{ДАТА}', label: 'Дата' },
  { code: '{ИМЯ}', label: 'Имя документа' },
];

/** Шесть положений номера страницы */
const POSITIONS: { value: NumberPosition; label: string }[] = [
  { value: 'none', label: 'Без номера' },
  { value: 'top-left', label: 'Вверху слева' },
  { value: 'top-center', label: 'Вверху по центру' },
  { value: 'top-right', label: 'Вверху справа' },
  { value: 'bottom-left', label: 'Внизу слева' },
  { value: 'bottom-center', label: 'Внизу по центру' },
  { value: 'bottom-right', label: 'Внизу справа' },
];

const ALIGNS: { value: 'left' | 'center' | 'right'; icon: string }[] = [
  { value: 'left', icon: 'AlignLeft' },
  { value: 'center', icon: 'AlignCenter' },
  { value: 'right', icon: 'AlignRight' },
];

/** Окно «Колонтитулы»: надписи сверху и снизу, номера страниц */
const HeaderFooterDialog = ({ open, initial, part, onClose, onApply }: Props) => {
  const [f, setF] = useState<PageFurniture>(initial);
  const [tab, setTab] = useState<'header' | 'footer' | 'numbers'>(part);

  useEffect(() => {
    if (!open) return;
    setF(initial);
    setTab(part);
  }, [open, initial, part]);

  if (!open) return null;

  const patch = (v: Partial<PageFurniture>) => setF((s) => ({ ...s, ...v }));

  const isHeader = tab === 'header';
  const text = isHeader ? f.headerText : f.footerText;

  const setText = (v: string) =>
    patch(isHeader ? { headerText: v } : { footerText: v });

  const align = isHeader ? f.headerAlign : f.footerAlign;
  const setAlign = (v: 'left' | 'center' | 'right') =>
    patch(isHeader ? { headerAlign: v } : { footerAlign: v });

  const TABS = [
    { id: 'header' as const, label: 'Верхний' },
    { id: 'footer' as const, label: 'Нижний' },
    { id: 'numbers' as const, label: 'Номера страниц' },
  ];

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/30"
      onMouseDown={onClose}
    >
      <div
        className="w-[520px] rounded-md bg-[hsl(var(--win-ribbon))] shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          className="flex h-8 items-center justify-between px-3 text-[12px]"
          style={{
            background: 'hsl(var(--win-title))',
            color: 'hsl(var(--win-title-text))',
          }}
        >
          <span>Колонтитулы</span>
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

        <div className="space-y-4 p-4">
          {tab !== 'numbers' ? (
            <>
              <Field
                label={`Текст ${isHeader ? 'верхнего' : 'нижнего'} колонтитула`}
              >
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Например: Отчёт за 2026 год"
                  className={inputCls}
                />
              </Field>

              <div>
                <p className="mb-1.5 text-[11px] text-slate-600">
                  Вставить поле
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {FIELDS.map((x) => (
                    <button
                      key={x.code}
                      type="button"
                      onClick={() => setText(`${text}${text ? ' ' : ''}${x.code}`)}
                      className="rounded-[2px] border border-slate-300 bg-white px-2 py-1 text-[11px] hover:border-[hsl(var(--win-title))]"
                    >
                      {x.label}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[10px] text-slate-500">
                  Поля заменяются на настоящие значения при просмотре и печати
                </p>
              </div>

              <Field label="Выравнивание" width={130}>
                <div className="flex gap-1">
                  {ALIGNS.map((a) => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => setAlign(a.value)}
                      className={`flex h-[26px] w-[38px] items-center justify-center rounded-[2px] border ${
                        align === a.value
                          ? 'border-[hsl(var(--win-title))] bg-[hsl(var(--win-hover))]'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      <Icon name={a.icon} size={14} />
                    </button>
                  ))}
                </div>
              </Field>

              <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-slate-700">
                <input
                  type="checkbox"
                  checked={f.differentFirst}
                  onChange={(e) => patch({ differentFirst: e.target.checked })}
                  className="h-3.5 w-3.5 accent-[hsl(var(--win-title))]"
                />
                Особый колонтитул для первой страницы
              </label>
            </>
          ) : (
            <>
              <div className="flex gap-3">
                <Field label="Положение номера" width={190}>
                  <select
                    value={f.numberPosition}
                    onChange={(e) =>
                      patch({
                        numberPosition: e.target.value as NumberPosition,
                      })
                    }
                    className={inputCls}
                  >
                    {POSITIONS.map((x) => (
                      <option key={x.value} value={x.value}>
                        {x.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Формат номера" width={150}>
                  <select
                    value={f.numberFormat}
                    onChange={(e) =>
                      patch({
                        numberFormat: e.target
                          .value as PageFurniture['numberFormat'],
                      })
                    }
                    className={inputCls}
                  >
                    {NUMBER_FORMAT_LABELS.map((x) => (
                      <option key={x.value} value={x.value}>
                        {x.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Начать с" width={90}>
                  <input
                    type="number"
                    min={0}
                    value={f.numberStart}
                    onChange={(e) =>
                      patch({ numberStart: Number(e.target.value) })
                    }
                    className={inputCls}
                  />
                </Field>
              </div>

              <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-slate-700">
                <input
                  type="checkbox"
                  checked={f.numberOnFirst}
                  onChange={(e) => patch({ numberOnFirst: e.target.checked })}
                  className="h-3.5 w-3.5 accent-[hsl(var(--win-title))]"
                />
                Номер на первой странице
              </label>

              <div className="rounded-[2px] border border-slate-300 bg-white p-3">
                <p className="mb-1 text-[10px] text-slate-500">Образец</p>
                <p className="text-center text-[13px]">
                  {f.numberPosition === 'none'
                    ? 'Номера страниц выключены'
                    : NUMBER_FORMAT_LABELS.find(
                        (x) => x.value === f.numberFormat,
                      )?.label}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-300 px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setF(DEFAULT_FURNITURE)}
          >
            Удалить всё
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button size="sm" onClick={() => onApply(f)}>
            ОК
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeaderFooterDialog;
