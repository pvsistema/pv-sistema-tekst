import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { DropCapKind, DropCapSetup } from '@/lib/drop-cap';
import { DEFAULT_DROP_CAP } from '@/lib/drop-cap';

interface Props {
  open: boolean;
  initial?: DropCapSetup;
  onClose: () => void;
  onApply: (setup: DropCapSetup) => void;
}

const KINDS: { value: DropCapKind; label: string; hint: string }[] = [
  { value: 'none', label: 'Нет', hint: 'Обычный текст' },
  { value: 'in-text', label: 'В тексте', hint: 'Буква внутри абзаца' },
  { value: 'in-margin', label: 'На поле', hint: 'Буква вынесена влево' },
];

/** Маленький образец: как будет выглядеть абзац */
const Preview = ({ kind, lines }: { kind: DropCapKind; lines: number }) => (
  <div className="h-[74px] overflow-hidden rounded-[2px] border border-slate-300 bg-white p-1.5 text-[7px] leading-[1.35] text-slate-700">
    {kind !== 'none' && (
      <span
        className="float-left pr-[2px] font-semibold text-slate-800"
        style={{
          fontSize: `${lines * 7.6}px`,
          lineHeight: 0.82,
          marginLeft: kind === 'in-margin' ? -lines * 2.2 : 0,
        }}
      >
        А
      </span>
    )}
    {kind === 'none' && <span className="font-semibold">А</span>}
    бзац документа начинается с крупной буквы. Остальной текст обтекает её
    сбоку, как это принято в книжной вёрстке и оформлении по ГОСТ. Строки
    ложатся ровно, буква занимает заданную высоту.
  </div>
);

/** Окно «Буквица» — настоящая крупная первая буква, как в Word */
const DropCapDialog = ({ open, initial, onClose, onApply }: Props) => {
  const [s, setS] = useState<DropCapSetup>(initial ?? DEFAULT_DROP_CAP);

  useEffect(() => {
    if (open) setS(initial ?? DEFAULT_DROP_CAP);
  }, [open, initial]);

  if (!open) return null;

  const patch = (v: Partial<DropCapSetup>) => setS((x) => ({ ...x, ...v }));

  return (
    <div
      className="fixed inset-0 z-[118] flex items-center justify-center bg-slate-900/30"
      onMouseDown={onClose}
    >
      <div
        className="w-[430px] rounded-md bg-[hsl(var(--win-ribbon))] shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          className="flex h-8 items-center justify-between px-3 text-[12px]"
          style={{
            background: 'hsl(var(--win-title))',
            color: 'hsl(var(--win-title-text))',
          }}
        >
          <span>Буквица</span>
          <button type="button" onClick={onClose} className="px-1">
            ✕
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div>
            <p className="mb-1.5 text-[11px] text-slate-600">Положение</p>
            <div className="grid grid-cols-3 gap-2">
              {KINDS.map((k) => (
                <button
                  key={k.value}
                  type="button"
                  onClick={() => patch({ kind: k.value })}
                  className={`rounded-[2px] border p-1.5 text-left ${
                    s.kind === k.value
                      ? 'border-[hsl(var(--win-title))] bg-[hsl(var(--win-hover))]'
                      : 'border-slate-300 bg-white hover:border-[hsl(var(--win-title))]'
                  }`}
                >
                  <Preview kind={k.value} lines={s.lines} />
                  <p className="mt-1 text-[11px] font-medium">{k.label}</p>
                  <p className="text-[10px] leading-tight text-slate-500">
                    {k.hint}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-[150px]">
              <p className="mb-1 text-[11px] text-slate-600">Высота в строках</p>
              <input
                type="number"
                min={2}
                max={6}
                value={s.lines}
                disabled={s.kind === 'none'}
                onChange={(e) =>
                  patch({
                    lines: Math.min(6, Math.max(2, Number(e.target.value) || 3)),
                  })
                }
                className="h-[26px] w-full rounded-[2px] border border-slate-300 bg-white px-1.5 text-[12px] outline-none focus:border-[hsl(var(--win-title))] disabled:bg-slate-100"
              />
            </div>

            <div className="w-[170px]">
              <p className="mb-1 text-[11px] text-slate-600">
                Расстояние до текста, см
              </p>
              <input
                type="number"
                min={0}
                max={2}
                step={0.1}
                value={s.distance}
                disabled={s.kind === 'none'}
                onChange={(e) =>
                  patch({ distance: Math.max(0, Number(e.target.value) || 0) })
                }
                className="h-[26px] w-full rounded-[2px] border border-slate-300 bg-white px-1.5 text-[12px] outline-none focus:border-[hsl(var(--win-title))] disabled:bg-slate-100"
              />
            </div>
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
            ОК
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DropCapDialog;
