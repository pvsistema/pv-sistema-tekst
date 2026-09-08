import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { CharFormat } from '@/lib/text-format';
import { DEFAULT_CHAR } from '@/lib/text-format';

interface Props {
  open: boolean;
  initial: CharFormat;
  onClose: () => void;
  onApply: (f: CharFormat) => void;
}

const FONTS = [
  'Calibri',
  'Times New Roman',
  'Arial',
  'Georgia',
  'Courier New',
  'Verdana',
  'Tahoma',
  'Cambria',
  'Garamond',
  'Segoe UI',
];

const SIZES = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72,
];

const UNDERLINES: { value: CharFormat['underline']; label: string }[] = [
  { value: 'none', label: '(нет)' },
  { value: 'single', label: 'Одинарное' },
  { value: 'double', label: 'Двойное' },
  { value: 'dotted', label: 'Пунктирное' },
  { value: 'dashed', label: 'Штриховое' },
  { value: 'wavy', label: 'Волнистое' },
];

/** Список с подписью — основной элемент этого окна */
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

const selectCls =
  'h-[26px] rounded-[2px] border border-slate-300 bg-white px-1.5 text-[12px] outline-none focus:border-primary';

/** Флажок в стиле окна параметров Word */
const Check = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-slate-700">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-3.5 w-3.5 accent-[hsl(var(--win-title))]"
    />
    {label}
  </label>
);

/** Окно «Шрифт»: начертание, размер, цвет, видоизменение и образец */
const FontDialog = ({ open, initial, onClose, onApply }: Props) => {
  const [f, setF] = useState<CharFormat>(initial);

  useEffect(() => {
    if (open) setF(initial);
  }, [open, initial]);

  if (!open) return null;

  const patch = (p: Partial<CharFormat>) => setF((v) => ({ ...v, ...p }));

  /* так текст будет выглядеть после применения */
  const preview: React.CSSProperties = {
    fontFamily: f.family,
    fontSize: Math.min(28, f.size * 1.34),
    fontWeight: f.bold ? 700 : 400,
    fontStyle: f.italic ? 'italic' : 'normal',
    color: f.color,
    background: f.highlight === 'transparent' ? undefined : f.highlight,
    textDecorationLine:
      [f.underline !== 'none' && 'underline', f.strike && 'line-through']
        .filter(Boolean)
        .join(' ') || 'none',
    textDecorationStyle:
      f.underline === 'none' || f.underline === 'single'
        ? undefined
        : (f.underline as 'double' | 'dotted' | 'dashed' | 'wavy'),
    textTransform: f.caps === 'upper' ? 'uppercase' : undefined,
    fontVariantCaps: f.caps === 'small' ? 'small-caps' : undefined,
    letterSpacing: f.spacing ? `${f.spacing * 1.34}px` : undefined,
    verticalAlign: f.vertical === 'none' ? undefined : f.vertical,
  };

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
          <span>Шрифт</span>
          <button type="button" onClick={onClose} className="px-1">
            ✕
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="flex gap-3">
            <Field label="Шрифт" width={220}>
              <select
                value={f.family}
                onChange={(e) => patch({ family: e.target.value })}
                className={selectCls}
              >
                {FONTS.map((x) => (
                  <option key={x} value={x} style={{ fontFamily: x }}>
                    {x}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Начертание" width={140}>
              <select
                value={`${f.bold ? 'b' : ''}${f.italic ? 'i' : ''}` || 'n'}
                onChange={(e) => {
                  const v = e.target.value;
                  patch({ bold: v.includes('b'), italic: v.includes('i') });
                }}
                className={selectCls}
              >
                <option value="n">Обычный</option>
                <option value="i">Курсив</option>
                <option value="b">Полужирный</option>
                <option value="bi">Полужирный курсив</option>
              </select>
            </Field>

            <Field label="Размер" width={80}>
              <select
                value={f.size}
                onChange={(e) => patch({ size: Number(e.target.value) })}
                className={selectCls}
              >
                {SIZES.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex gap-3">
            <Field label="Цвет текста" width={120}>
              <input
                type="color"
                value={f.color}
                onChange={(e) => patch({ color: e.target.value })}
                className="h-[26px] w-full cursor-pointer rounded-[2px] border border-slate-300 bg-white"
              />
            </Field>

            <Field label="Подчёркивание" width={150}>
              <select
                value={f.underline}
                onChange={(e) =>
                  patch({ underline: e.target.value as CharFormat['underline'] })
                }
                className={selectCls}
              >
                {UNDERLINES.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Интервал, пт" width={110}>
              <input
                type="number"
                step={0.1}
                value={f.spacing}
                onChange={(e) => patch({ spacing: Number(e.target.value) })}
                className={selectCls}
              />
            </Field>
          </div>

          <div>
            <p className="mb-2 text-[11px] text-slate-600">Видоизменение</p>
            <div className="grid grid-cols-3 gap-y-1.5">
              <Check
                label="зачёркнутый"
                checked={f.strike}
                onChange={(v) => patch({ strike: v })}
              />
              <Check
                label="надстрочный"
                checked={f.vertical === 'super'}
                onChange={(v) => patch({ vertical: v ? 'super' : 'none' })}
              />
              <Check
                label="подстрочный"
                checked={f.vertical === 'sub'}
                onChange={(v) => patch({ vertical: v ? 'sub' : 'none' })}
              />
              <Check
                label="все прописные"
                checked={f.caps === 'upper'}
                onChange={(v) => patch({ caps: v ? 'upper' : 'none' })}
              />
              <Check
                label="малые прописные"
                checked={f.caps === 'small'}
                onChange={(v) => patch({ caps: v ? 'small' : 'none' })}
              />
              <Check
                label="выделение цветом"
                checked={f.highlight !== 'transparent'}
                onChange={(v) =>
                  patch({ highlight: v ? '#ffff00' : 'transparent' })
                }
              />
            </div>
          </div>

          <div>
            <p className="mb-1 text-[11px] text-slate-600">Образец</p>
            <div className="flex h-[70px] items-center justify-center rounded-[2px] border border-slate-300 bg-white px-3">
              <span style={preview} className="truncate">
                Съешь ещё этих мягких булок — AaBbYyZz
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-300 px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setF({ ...DEFAULT_CHAR, family: f.family })}
          >
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

export default FontDialog;
