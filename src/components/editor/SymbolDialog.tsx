import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  SPECIAL_CHARS,
  SYMBOL_NAMES,
  SYMBOL_SETS,
  charCode,
} from '@/lib/symbols';

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (char: string) => void;
}

const RECENT_KEY = 'pv-tekst-recent-symbols';

/** Окно «Символ»: наборы знаков и специальные символы */
const SymbolDialog = ({ open, onClose, onPick }: Props) => {
  const [tab, setTab] = useState<'symbols' | 'special'>('symbols');
  const [set, setSet] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      setRecent(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setRecent([]);
    }
  }, [open]);

  if (!open) return null;

  const pick = (ch: string) => {
    onPick(ch);

    const next = [ch, ...recent.filter((x) => x !== ch)].slice(0, 20);
    setRecent(next);

    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* пропускаем */
    }
  };

  const current = SYMBOL_SETS[set];
  const shown = hover ?? current.chars[0];

  const Cell = ({ ch }: { ch: string }) => (
    <button
      type="button"
      title={SYMBOL_NAMES[ch] ?? `Код ${charCode(ch)}`}
      onMouseEnter={() => setHover(ch)}
      onClick={() => pick(ch)}
      className="flex h-[30px] w-[30px] items-center justify-center rounded-[2px] border border-transparent text-[16px] hover:border-[hsl(var(--win-title))] hover:bg-[hsl(var(--win-hover))]"
    >
      {ch}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-[112] flex items-center justify-center bg-slate-900/30"
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
          <span>Символ</span>
          <button type="button" onClick={onClose} className="px-1">
            ✕
          </button>
        </div>

        <div className="flex gap-1 border-b border-slate-300 px-4 pt-3">
          {[
            { id: 'symbols' as const, label: 'Символы' },
            { id: 'special' as const, label: 'Специальные знаки' },
          ].map((t) => (
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

        {tab === 'symbols' ? (
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-600">Набор:</span>
              <select
                value={set}
                onChange={(e) => setSet(Number(e.target.value))}
                className="h-[26px] flex-1 rounded-[2px] border border-slate-300 bg-white px-1.5 text-[12px] outline-none focus:border-primary"
              >
                {SYMBOL_SETS.map((s, i) => (
                  <option key={s.title} value={i}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-[2px] rounded-[2px] border border-slate-300 bg-white p-2">
              {current.chars.map((ch) => (
                <Cell key={ch} ch={ch} />
              ))}
            </div>

            {recent.length > 0 && (
              <div>
                <p className="mb-1 text-[11px] text-slate-600">
                  Ранее использованные
                </p>
                <div className="flex flex-wrap gap-[2px] rounded-[2px] border border-slate-300 bg-white p-2">
                  {recent.map((ch) => (
                    <Cell key={`r-${ch}`} ch={ch} />
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 rounded-[2px] bg-white px-3 py-2">
              <span className="text-[26px] leading-none">{shown}</span>
              <span className="text-[11px] leading-tight text-slate-600">
                {SYMBOL_NAMES[shown] ?? 'Символ'}
                <br />
                Код знака: {charCode(shown)}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="max-h-[280px] overflow-y-auto rounded-[2px] border border-slate-300 bg-white">
              {SPECIAL_CHARS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => pick(s.char)}
                  className="flex w-full items-center gap-2 px-3 py-[6px] text-left text-[12px] hover:bg-[hsl(var(--win-hover))]"
                >
                  <span className="w-[26px] text-center text-[15px] text-slate-700">
                    {s.char.trim() ? s.char : '␣'}
                  </span>
                  <span className="flex-1">{s.label}</span>
                  {s.hint && (
                    <span className="text-[11px] text-slate-500">{s.hint}</span>
                  )}
                </button>
              ))}
            </div>

            <p className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
              <Icon name="Info" size={11} />
              Неразрывный пробел не даёт словам разойтись по разным строкам
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-300 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SymbolDialog;
