import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { ParaFormat } from '@/lib/text-format';
import { DEFAULT_PARA } from '@/lib/text-format';

interface Props {
  open: boolean;
  initial: ParaFormat;
  onClose: () => void;
  onApply: (f: ParaFormat) => void;
}

const ALIGNS: { value: ParaFormat['align']; label: string }[] = [
  { value: 'left', label: 'По левому краю' },
  { value: 'center', label: 'По центру' },
  { value: 'right', label: 'По правому краю' },
  { value: 'justify', label: 'По ширине' },
];

const LINE_RULES: { value: ParaFormat['lineRule']; label: string }[] = [
  { value: 'single', label: 'Одинарный' },
  { value: '1.15', label: '1,15 строки' },
  { value: '1.5', label: 'Полуторный' },
  { value: 'double', label: 'Двойной' },
  { value: 'multiple', label: 'Множитель' },
  { value: 'exact', label: 'Точно, пт' },
];

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

const inputCls =
  'h-[26px] rounded-[2px] border border-slate-300 bg-white px-1.5 text-[12px] outline-none focus:border-primary';

/** Числовое поле с шагом — отступы и интервалы задаются именно так */
const Num = ({
  value,
  onChange,
  step = 0.25,
  min = -10,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
}) => (
  <input
    type="number"
    step={step}
    min={min}
    value={value}
    onChange={(e) => onChange(Number(e.target.value))}
    className={inputCls}
  />
);

/** Окно «Абзац»: выравнивание, отступы и интервалы с образцом */
const ParagraphDialog = ({ open, initial, onClose, onApply }: Props) => {
  const [f, setF] = useState<ParaFormat>(initial);

  useEffect(() => {
    if (open) setF(initial);
  }, [open, initial]);

  if (!open) return null;

  const patch = (p: Partial<ParaFormat>) => setF((v) => ({ ...v, ...p }));

  const lineHeight =
    f.lineRule === 'single'
      ? 1
      : f.lineRule === '1.15'
        ? 1.15
        : f.lineRule === '1.5'
          ? 1.5
          : f.lineRule === 'double'
            ? 2
            : f.lineRule === 'exact'
              ? `${f.lineValue}px`
              : f.lineValue;

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
          <span>Абзац</span>
          <button type="button" onClick={onClose} className="px-1">
            ✕
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <p className="mb-2 text-[11px] font-semibold text-slate-700">
              Общие
            </p>
            <Field label="Выравнивание" width={200}>
              <select
                value={f.align}
                onChange={(e) =>
                  patch({ align: e.target.value as ParaFormat['align'] })
                }
                className={inputCls}
              >
                {ALIGNS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold text-slate-700">
              Отступ
            </p>
            <div className="flex gap-3">
              <Field label="Слева, см" width={110}>
                <Num
                  value={f.indentLeft}
                  onChange={(v) => patch({ indentLeft: v })}
                  min={0}
                />
              </Field>
              <Field label="Справа, см" width={110}>
                <Num
                  value={f.indentRight}
                  onChange={(v) => patch({ indentRight: v })}
                  min={0}
                />
              </Field>
              <Field label="Первая строка, см" width={150}>
                <Num
                  value={f.firstLine}
                  onChange={(v) => patch({ firstLine: v })}
                />
              </Field>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              Отрицательное значение первой строки даёт выступ — так набирают
              списки и словарные статьи
            </p>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold text-slate-700">
              Интервал
            </p>
            <div className="flex gap-3">
              <Field label="Перед, пт" width={100}>
                <Num
                  value={f.spaceBefore}
                  onChange={(v) => patch({ spaceBefore: v })}
                  step={2}
                  min={0}
                />
              </Field>
              <Field label="После, пт" width={100}>
                <Num
                  value={f.spaceAfter}
                  onChange={(v) => patch({ spaceAfter: v })}
                  step={2}
                  min={0}
                />
              </Field>
              <Field label="Междустрочный" width={140}>
                <select
                  value={f.lineRule}
                  onChange={(e) =>
                    patch({
                      lineRule: e.target.value as ParaFormat['lineRule'],
                    })
                  }
                  className={inputCls}
                >
                  {LINE_RULES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </Field>

              {(f.lineRule === 'multiple' || f.lineRule === 'exact') && (
                <Field label="Значение" width={90}>
                  <Num
                    value={f.lineValue}
                    onChange={(v) => patch({ lineValue: v })}
                    step={f.lineRule === 'exact' ? 1 : 0.05}
                    min={0.5}
                  />
                </Field>
              )}
            </div>
          </div>

          <div>
            <p className="mb-1 text-[11px] text-slate-600">Образец</p>
            <div className="h-[92px] overflow-hidden rounded-[2px] border border-slate-300 bg-white px-3 py-2">
              <p
                className="text-[10px] text-slate-800"
                style={{
                  textAlign: f.align,
                  marginLeft: `${f.indentLeft * 12}px`,
                  marginRight: `${f.indentRight * 12}px`,
                  textIndent: `${f.firstLine * 12}px`,
                  marginTop: `${f.spaceBefore * 0.7}px`,
                  marginBottom: `${f.spaceAfter * 0.7}px`,
                  lineHeight,
                }}
              >
                Образец текста показывает, как будет выглядеть абзац с
                выбранными отступами и интервалами. Настройки применяются ко
                всем выделенным абзацам сразу.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-300 px-4 py-3">
          <Button variant="outline" size="sm" onClick={() => setF(DEFAULT_PARA)}>
            По умолчанию
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

export default ParagraphDialog;
