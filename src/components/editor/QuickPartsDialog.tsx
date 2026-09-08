import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { QuickPart } from '@/lib/symbols';
import { BUILTIN_PARTS, dateFormats } from '@/lib/symbols';

interface DateProps {
  open: boolean;
  onClose: () => void;
  onPick: (text: string, autoUpdate: boolean, formatIndex: number) => void;
}

/** Окно «Дата и время» с выбором формата */
export const DateTimeDialog = ({ open, onClose, onPick }: DateProps) => {
  const [pick, setPick] = useState(0);
  const [auto, setAuto] = useState(false);

  const formats = useMemo(() => dateFormats(new Date()), []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[112] flex items-center justify-center bg-slate-900/30"
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
          <span>Дата и время</span>
          <button type="button" onClick={onClose} className="px-1">
            ✕
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div>
            <p className="mb-1 text-[11px] text-slate-600">Форматы</p>
            <div className="max-h-[220px] overflow-y-auto rounded-[2px] border border-slate-300 bg-white">
              {formats.map((f, i) => (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => setPick(i)}
                  className={`block w-full px-3 py-[5px] text-left text-[12px] ${
                    pick === i
                      ? 'bg-[hsl(var(--win-title))] text-white'
                      : 'hover:bg-[hsl(var(--win-hover))]'
                  }`}
                >
                  {f.value}
                  <span
                    className={`ml-2 text-[10px] ${
                      pick === i ? 'text-white/70' : 'text-slate-500'
                    }`}
                  >
                    {f.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-1.5 text-[12px] text-slate-700">
            <input
              type="checkbox"
              checked={auto}
              onChange={(e) => setAuto(e.target.checked)}
              className="mt-[2px] h-3.5 w-3.5 accent-[hsl(var(--win-title))]"
            />
            <span>
              Обновлять автоматически
              <span className="block text-[10px] leading-tight text-slate-500">
                Дата будет меняться при каждом открытии документа
              </span>
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-300 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onPick(formats[pick].value, auto, pick);
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

interface PartsProps {
  open: boolean;
  parts: QuickPart[];
  onClose: () => void;
  onPick: (part: QuickPart) => void;
  onRemove: (id: string) => void;
  /** Сохранить выделенный фрагмент как новый блок */
  onSaveSelection: (title: string) => void;
}

/** Окно «Экспресс-блоки»: готовые куски документа */
export const QuickPartsDialog = ({
  open,
  parts,
  onClose,
  onPick,
  onRemove,
  onSaveSelection,
}: PartsProps) => {
  const [active, setActive] = useState<string | null>(null);
  const [title, setTitle] = useState('');

  const all = useMemo(() => [...BUILTIN_PARTS, ...parts], [parts]);

  useEffect(() => {
    if (open) setActive(all[0]?.id ?? null);
  }, [open, all]);

  if (!open) return null;

  const current = all.find((p) => p.id === active);

  /* группируем по разделам, как в Word */
  const groups = all.reduce<Record<string, QuickPart[]>>((acc, p) => {
    (acc[p.category] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 z-[112] flex items-center justify-center bg-slate-900/30"
      onMouseDown={onClose}
    >
      <div
        className="w-[620px] rounded-md bg-[hsl(var(--win-ribbon))] shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          className="flex h-8 items-center justify-between px-3 text-[12px]"
          style={{
            background: 'hsl(var(--win-title))',
            color: 'hsl(var(--win-title-text))',
          }}
        >
          <span>Экспресс-блоки</span>
          <button type="button" onClick={onClose} className="px-1">
            ✕
          </button>
        </div>

        <div className="flex gap-3 p-4">
          {/* список блоков */}
          <div className="h-[300px] w-[220px] shrink-0 overflow-y-auto rounded-[2px] border border-slate-300 bg-white">
            {Object.entries(groups).map(([category, items]) => (
              <div key={category}>
                <p className="bg-[hsl(0_0%_96%)] px-2 py-[3px] text-[10px] font-semibold uppercase text-slate-500">
                  {category}
                </p>
                {items.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActive(p.id)}
                    onDoubleClick={() => {
                      onPick(p);
                      onClose();
                    }}
                    className={`group flex w-full items-center gap-1 px-2 py-[5px] text-left text-[12px] ${
                      active === p.id
                        ? 'bg-[hsl(var(--win-title))] text-white'
                        : 'hover:bg-[hsl(var(--win-hover))]'
                    }`}
                  >
                    <span className="flex-1 truncate">{p.title}</span>
                    {!BUILTIN_PARTS.some((b) => b.id === p.id) && (
                      <span
                        role="button"
                        tabIndex={0}
                        title="Удалить блок"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(p.id);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && onRemove(p.id)}
                        className="opacity-0 group-hover:opacity-100"
                      >
                        <Icon name="X" size={11} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* предпросмотр */}
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="mb-1 text-[11px] text-slate-600">Образец</p>
            <div className="h-[220px] overflow-auto rounded-[2px] border border-slate-300 bg-white p-3 text-[13px]">
              {current ? (
                <div dangerouslySetInnerHTML={{ __html: current.html }} />
              ) : (
                <p className="text-[11px] text-slate-500">Выберите блок слева</p>
              )}
            </div>

            {current && (
              <p className="mt-1 text-[11px] text-slate-500">{current.hint}</p>
            )}

            <div className="mt-auto flex items-end gap-2 pt-3">
              <div className="flex-1">
                <p className="mb-1 text-[11px] text-slate-600">
                  Сохранить выделенный фрагмент
                </p>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Название блока"
                  className="h-[26px] w-full rounded-[2px] border border-slate-300 bg-white px-1.5 text-[12px] outline-none focus:border-primary"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!title.trim()) return;
                  onSaveSelection(title.trim());
                  setTitle('');
                }}
              >
                Сохранить
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-300 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button
            size="sm"
            disabled={!current}
            onClick={() => {
              if (current) onPick(current);
              onClose();
            }}
          >
            Вставить
          </Button>
        </div>
      </div>
    </div>
  );
};
