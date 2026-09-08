import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { AutoCorrectSetup } from '@/lib/autocorrect';
import { DEFAULT_AUTOCORRECT } from '@/lib/autocorrect';

interface Props {
  open: boolean;
  initial: AutoCorrectSetup;
  onClose: () => void;
  onApply: (setup: AutoCorrectSetup) => void;
}

const inputCls =
  'h-[26px] rounded-[2px] border border-slate-300 bg-white px-1.5 text-[12px] outline-none focus:border-primary';

const Check = ({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <label className="flex cursor-pointer items-start gap-1.5 py-[3px] text-[12px] text-slate-700">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-[2px] h-3.5 w-3.5 accent-[hsl(var(--win-title))]"
    />
    <span>
      {label}
      {hint && (
        <span className="block text-[10px] leading-tight text-slate-500">
          {hint}
        </span>
      )}
    </span>
  </label>
);

/** Окно «Автозамена»: правила при вводе и список замен */
const AutoCorrectDialog = ({ open, initial, onClose, onApply }: Props) => {
  const [s, setS] = useState<AutoCorrectSetup>(initial);
  const [tab, setTab] = useState<'correct' | 'format'>('correct');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    setS(initial);
    setFrom('');
    setTo('');
  }, [open, initial]);

  if (!open) return null;

  const patch = (v: Partial<AutoCorrectSetup>) => setS((x) => ({ ...x, ...v }));

  const add = () => {
    const key = from.trim();
    if (!key || !to.trim()) return;

    patch({
      entries: [
        ...s.entries.filter((e) => e.from.toLowerCase() !== key.toLowerCase()),
        { from: key, to: to.trim() },
      ],
    });

    setFrom('');
    setTo('');
  };

  const shown = s.entries.filter(
    (e) =>
      !search ||
      e.from.toLowerCase().includes(search.toLowerCase()) ||
      e.to.toLowerCase().includes(search.toLowerCase()),
  );

  const TABS = [
    { id: 'correct' as const, label: 'Автозамена' },
    { id: 'format' as const, label: 'Автоформат при вводе' },
  ];

  return (
    <div
      className="fixed inset-0 z-[112] flex items-center justify-center bg-slate-900/30"
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
          <span>Автозамена</span>
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

        {tab === 'correct' ? (
          <div className="space-y-3 p-4">
            <div>
              <Check
                label="Делать первые буквы предложений прописными"
                checked={s.capitalizeSentence}
                onChange={(v) => patch({ capitalizeSentence: v })}
              />
              <Check
                label="Исправлять ДВе ПРописные буквы в начале слова"
                checked={s.fixTwoCaps}
                onChange={(v) => patch({ fixTwoCaps: v })}
              />
              <Check
                label="Английские дни и месяцы с прописной буквы"
                hint="В русском языке они пишутся со строчной — правило их не трогает"
                checked={s.capitalizeDays}
                onChange={(v) => patch({ capitalizeDays: v })}
              />
              <Check
                label="Заменять по списку"
                hint="Опечатки исправляются, как только слово закончено"
                checked={s.replaceTypos}
                onChange={(v) => patch({ replaceTypos: v })}
              />
            </div>

            <div className="border-t border-slate-300 pt-3">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <p className="mb-1 text-[11px] text-slate-600">заменять</p>
                  <input
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="вообщем"
                    className={`${inputCls} w-full`}
                  />
                </div>
                <div className="flex-1">
                  <p className="mb-1 text-[11px] text-slate-600">на</p>
                  <input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="в общем"
                    onKeyDown={(e) => e.key === 'Enter' && add()}
                    className={`${inputCls} w-full`}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={add}>
                  Добавить
                </Button>
              </div>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по списку"
                className={`${inputCls} mt-2 w-full`}
              />

              <div className="mt-2 h-[150px] overflow-y-auto rounded-[2px] border border-slate-300 bg-white">
                {shown.length ? (
                  shown.map((e) => (
                    <div
                      key={e.from}
                      className="group flex items-center gap-2 px-2 py-[3px] text-[12px] hover:bg-[hsl(var(--win-hover))]"
                    >
                      <span className="w-[45%] truncate text-slate-700">
                        {e.from}
                      </span>
                      <Icon
                        name="ArrowRight"
                        size={11}
                        className="shrink-0 text-slate-400"
                      />
                      <span className="flex-1 truncate">{e.to}</span>
                      <button
                        type="button"
                        title="Убрать замену"
                        onClick={() =>
                          patch({
                            entries: s.entries.filter((x) => x.from !== e.from),
                          })
                        }
                        className="opacity-0 group-hover:opacity-100"
                      >
                        <Icon name="X" size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="px-2 py-2 text-[11px] text-slate-500">
                    Ничего не найдено
                  </p>
                )}
              </div>

              <p className="mt-1 text-[10px] text-slate-500">
                Всего замен: {s.entries.length}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-4">
            <p className="mb-1 text-[11px] font-semibold uppercase text-slate-500">
              Заменять при вводе
            </p>
            <Check
              label="Прямые кавычки «ёлочками»"
              hint='"текст" превращается в «текст», внутри — „лапки“'
              checked={s.smartQuotes}
              onChange={(v) => patch({ smartQuotes: v })}
            />
            <Check
              label="Дефис (-) на тире (—)"
              hint="Работает, когда дефис окружён пробелами"
              checked={s.dashes}
              onChange={(v) => patch({ dashes: v })}
            />
            <Check
              label="Знаки и дроби"
              hint="(с) → ©, 1/2 → ½, ... → …, -> → →"
              checked={s.symbols}
              onChange={(v) => patch({ symbols: v })}
            />
            <Check
              label="Адреса сайтов и почты — ссылками"
              checked={s.autoLinks}
              onChange={(v) => patch({ autoLinks: v })}
            />
            <Check
              label="Порядковые числительные"
              hint="1-й, 25-го не разрываются переносом"
              checked={s.ordinals}
              onChange={(v) => patch({ ordinals: v })}
            />

            <p className="mb-1 mt-3 border-t border-slate-300 pt-3 text-[11px] font-semibold uppercase text-slate-500">
              Применять при вводе
            </p>
            <Check
              label="Стили маркированных и нумерованных списков"
              hint="«1. » или «- » в начале строки создают список"
              checked={s.autoLists}
              onChange={(v) => patch({ autoLists: v })}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-300 px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            className="mr-auto"
            onClick={() => setS(DEFAULT_AUTOCORRECT)}
          >
            По умолчанию
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button size="sm" onClick={() => onApply(s)}>
            ОК
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AutoCorrectDialog;
