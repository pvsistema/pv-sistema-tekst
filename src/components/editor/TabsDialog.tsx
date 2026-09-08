import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { TabAlign, TabLeader, TabStop } from '@/lib/tab-stops';
import {
  DEFAULT_TAB_STEP,
  TAB_ALIGN_LABELS,
  TAB_LEADER_LABELS,
} from '@/lib/tab-stops';

interface Props {
  open: boolean;
  stops: TabStop[];
  onClose: () => void;
  onApply: (stops: TabStop[], step: number) => void;
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

/** Окно «Табуляция»: список позиций, их тип и заполнитель */
const TabsDialog = ({ open, stops, onClose, onApply }: Props) => {
  const [list, setList] = useState<TabStop[]>(stops);
  const [step, setStep] = useState(DEFAULT_TAB_STEP);
  const [position, setPosition] = useState(2);
  const [align, setAlign] = useState<TabAlign>('left');
  const [leader, setLeader] = useState<TabLeader>('none');
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setList(stops);
    setPicked(null);
  }, [open, stops]);

  if (!open) return null;

  const add = () => {
    const fresh: TabStop = { position, align, leader };
    setList((prev) =>
      [...prev.filter((t) => Math.abs(t.position - position) > 0.05), fresh].sort(
        (a, b) => a.position - b.position,
      ),
    );
  };

  const removePicked = () => {
    if (picked === null) return;
    setList((prev) => prev.filter((t) => Math.abs(t.position - picked) > 0.05));
    setPicked(null);
  };

  const pick = (t: TabStop) => {
    setPicked(t.position);
    setPosition(t.position);
    setAlign(t.align);
    setLeader(t.leader);
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/30"
      onMouseDown={onClose}
    >
      <div
        className="w-[480px] rounded-md bg-[hsl(var(--win-ribbon))] shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          className="flex h-8 items-center justify-between px-3 text-[12px]"
          style={{
            background: 'hsl(var(--win-title))',
            color: 'hsl(var(--win-title-text))',
          }}
        >
          <span>Табуляция</span>
          <button type="button" onClick={onClose} className="px-1">
            ✕
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="flex gap-3">
            <Field label="Позиции табуляции, см" width={180}>
              <input
                type="number"
                step={0.25}
                min={0}
                value={position}
                onChange={(e) => setPosition(Number(e.target.value))}
                className={inputCls}
              />
              <div className="mt-1 h-[112px] overflow-y-auto rounded-[2px] border border-slate-300 bg-white">
                {list.length ? (
                  list.map((t) => (
                    <button
                      key={`${t.position}-${t.align}`}
                      type="button"
                      onClick={() => pick(t)}
                      className={`block w-full px-2 py-1 text-left text-[12px] ${
                        picked === t.position
                          ? 'bg-[hsl(var(--win-title))] text-white'
                          : 'hover:bg-[hsl(var(--win-hover))]'
                      }`}
                    >
                      {t.position.toFixed(2).replace('.', ',')} см ·{' '}
                      {TAB_ALIGN_LABELS.find((a) => a.value === t.align)?.sign}
                    </button>
                  ))
                ) : (
                  <p className="px-2 py-2 text-[11px] text-slate-500">
                    Позиции не заданы
                  </p>
                )}
              </div>
            </Field>

            <div className="flex flex-1 flex-col gap-3">
              <Field label="По умолчанию через, см">
                <input
                  type="number"
                  step={0.25}
                  min={0.25}
                  value={step}
                  onChange={(e) => setStep(Number(e.target.value))}
                  className={inputCls}
                />
              </Field>

              <div>
                <p className="mb-1 text-[11px] text-slate-600">Выравнивание</p>
                <div className="space-y-0.5">
                  {TAB_ALIGN_LABELS.map((a) => (
                    <label
                      key={a.value}
                      className="flex cursor-pointer items-center gap-1.5 text-[12px] text-slate-700"
                    >
                      <input
                        type="radio"
                        checked={align === a.value}
                        onChange={() => setAlign(a.value)}
                        className="h-3 w-3 accent-[hsl(var(--win-title))]"
                      />
                      {a.label}
                    </label>
                  ))}
                </div>
              </div>

              <Field label="Заполнитель">
                <select
                  value={leader}
                  onChange={(e) => setLeader(e.target.value as TabLeader)}
                  className={inputCls}
                >
                  {TAB_LEADER_LABELS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={add}>
              Установить
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={picked === null}
              onClick={removePicked}
            >
              Удалить
            </Button>
            <Button variant="outline" size="sm" onClick={() => setList([])}>
              Удалить все
            </Button>
          </div>

          <p className="text-[10px] text-slate-500">
            Заполнитель рисует точки или линию до позиции — так набирают
            оглавления и бланки
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-300 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button size="sm" onClick={() => onApply(list, step)}>
            ОК
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TabsDialog;
