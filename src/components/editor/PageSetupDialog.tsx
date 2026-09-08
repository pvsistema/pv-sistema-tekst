import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { PageSetup } from './RibbonLayout';
import type { Unit } from '@/lib/page-setup';
import {
  CUSTOM_SIZE_ID,
  MARGIN_PRESETS,
  PAPER_SIZES,
  UNIT_LABELS,
  fromCm,
  marginsFit,
  matchPaper,
  readNum,
  round2,
  showNum,
  toCm,
} from '@/lib/page-setup';

interface Props {
  open: boolean;
  setup: PageSetup;
  onClose: () => void;
  onApply: (patch: Partial<PageSetup>) => void;
}

/** Поле ввода размера с переводом единиц */
const NumBox = ({
  value,
  unit,
  onChange,
  disabled,
}: {
  value: number;
  unit: Unit;
  onChange: (cm: number) => void;
  disabled?: boolean;
}) => {
  const [text, setText] = useState(showNum(fromCm(value, unit)));

  useEffect(() => {
    setText(showNum(fromCm(value, unit)));
  }, [value, unit]);

  const commit = (raw: string) => {
    const v = readNum(raw);
    if (v === null || v < 0) {
      setText(showNum(fromCm(value, unit)));
      return;
    }

    onChange(round2(toCm(v, unit)));
  };

  return (
    <div className="flex items-center gap-1">
      <input
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
        className="h-[24px] w-[62px] rounded-[2px] border border-slate-300 bg-white px-1.5 text-right text-[12px] outline-none focus:border-primary disabled:bg-slate-100 disabled:text-slate-400"
      />
      <span className="text-[11px] text-slate-500">{UNIT_LABELS[unit]}</span>
    </div>
  );
};

/** Окно «Параметры страницы»: поля, размер бумаги, макет */
const PageSetupDialog = ({ open, setup, onClose, onApply }: Props) => {
  const [tab, setTab] = useState<'margins' | 'paper' | 'layout'>('margins');
  const [unit, setUnit] = useState<Unit>('cm');
  const [s, setS] = useState<PageSetup>(setup);

  useEffect(() => {
    if (open) setS(setup);
  }, [open, setup]);

  if (!open) return null;

  const patch = (v: Partial<PageSetup>) => setS((x) => ({ ...x, ...v }));

  const paperId = matchPaper(s.paperWidth, s.paperHeight);

  const fits = marginsFit(
    { width: s.paperWidth, height: s.paperHeight },
    {
      top: s.marginTop,
      bottom: s.marginBottom,
      left: s.marginLeft,
      right: s.marginRight,
      gutter: s.gutter,
    },
    s.landscape,
  );

  /* образец листа с полями */
  const previewW = s.landscape ? s.paperHeight : s.paperWidth;
  const previewH = s.landscape ? s.paperWidth : s.paperHeight;
  const scale = Math.min(120 / previewW, 150 / previewH);

  const TABS = [
    { id: 'margins' as const, label: 'Поля' },
    { id: 'paper' as const, label: 'Размер бумаги' },
    { id: 'layout' as const, label: 'Источник бумаги' },
  ];

  const Row = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center gap-2">
      <span className="w-[74px] text-[12px] text-slate-700">{label}</span>
      {children}
    </div>
  );

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
          <span>Параметры страницы</span>
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
          <div className="min-w-0 flex-1 space-y-3">
            {tab === 'margins' && (
              <>
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase text-slate-500">
                    Поля
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <Row label="Верхнее">
                      <NumBox
                        value={s.marginTop}
                        unit={unit}
                        onChange={(v) => patch({ marginTop: v })}
                      />
                    </Row>
                    <Row label="Нижнее">
                      <NumBox
                        value={s.marginBottom}
                        unit={unit}
                        onChange={(v) => patch({ marginBottom: v })}
                      />
                    </Row>
                    <Row label="Левое">
                      <NumBox
                        value={s.marginLeft}
                        unit={unit}
                        onChange={(v) => patch({ marginLeft: v })}
                      />
                    </Row>
                    <Row label="Правое">
                      <NumBox
                        value={s.marginRight}
                        unit={unit}
                        onChange={(v) => patch({ marginRight: v })}
                      />
                    </Row>
                    <Row label="Переплёт">
                      <NumBox
                        value={s.gutter}
                        unit={unit}
                        onChange={(v) => patch({ gutter: v })}
                      />
                    </Row>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase text-slate-500">
                    Ориентация
                  </p>
                  <div className="flex gap-2">
                    {[
                      { land: false, label: 'Книжная', icon: 'RectangleVertical' },
                      { land: true, label: 'Альбомная', icon: 'RectangleHorizontal' },
                    ].map((o) => (
                      <button
                        key={o.label}
                        type="button"
                        onClick={() => patch({ landscape: o.land })}
                        className={`flex h-[52px] w-[86px] flex-col items-center justify-center gap-1 rounded-[2px] border text-[11px] ${
                          s.landscape === o.land
                            ? 'border-[hsl(var(--win-title))] bg-[hsl(var(--win-hover))]'
                            : 'border-slate-300 bg-white hover:border-[hsl(var(--win-title))]'
                        }`}
                      >
                        <Icon name={o.icon} size={17} />
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase text-slate-500">
                    Готовые наборы
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {MARGIN_PRESETS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        title={m.hint}
                        onClick={() =>
                          patch({
                            marginTop: m.margins.top,
                            marginBottom: m.margins.bottom,
                            marginLeft: m.margins.left,
                            marginRight: m.margins.right,
                            margin: m.margins.top,
                          })
                        }
                        className="rounded-[2px] border border-slate-300 bg-white px-2 py-[3px] text-[11px] hover:border-[hsl(var(--win-title))] hover:bg-[hsl(var(--win-hover))]"
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {tab === 'paper' && (
              <>
                <div>
                  <p className="mb-1 text-[11px] text-slate-600">Размер бумаги</p>
                  <select
                    value={paperId}
                    onChange={(e) => {
                      const found = PAPER_SIZES.find(
                        (x) => x.id === e.target.value,
                      );
                      if (found)
                        patch({
                          paperWidth: found.width,
                          paperHeight: found.height,
                        });
                    }}
                    className="h-[26px] w-full rounded-[2px] border border-slate-300 bg-white px-1.5 text-[12px] outline-none focus:border-primary"
                  >
                    {paperId === CUSTOM_SIZE_ID && (
                      <option value={CUSTOM_SIZE_ID}>Другой размер</option>
                    )}
                    {PAPER_SIZES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label} — {showNum(p.width)} × {showNum(p.height)} см
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <Row label="Ширина">
                    <NumBox
                      value={s.paperWidth}
                      unit={unit}
                      onChange={(v) => patch({ paperWidth: Math.max(1, v) })}
                    />
                  </Row>
                  <Row label="Высота">
                    <NumBox
                      value={s.paperHeight}
                      unit={unit}
                      onChange={(v) => patch({ paperHeight: Math.max(1, v) })}
                    />
                  </Row>
                </div>

                <p className="flex items-start gap-1.5 rounded-[2px] bg-white px-2.5 py-2 text-[11px] leading-tight text-slate-600">
                  <Icon name="Info" size={12} className="mt-[1px] shrink-0" />
                  <span>
                    Для визитки задайте 9 × 5 см и нулевые поля, для буклета —
                    10 × 15 см.
                  </span>
                </p>
              </>
            )}

            {tab === 'layout' && (
              <>
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase text-slate-500">
                    Колонки
                  </p>
                  <div className="space-y-2">
                    <Row label="Число">
                      <input
                        type="number"
                        min={1}
                        max={6}
                        value={s.columns}
                        onChange={(e) =>
                          patch({
                            columns: Math.min(
                              6,
                              Math.max(1, Number(e.target.value) || 1),
                            ),
                          })
                        }
                        className="h-[24px] w-[62px] rounded-[2px] border border-slate-300 bg-white px-1.5 text-right text-[12px] outline-none focus:border-primary"
                      />
                    </Row>
                    <Row label="Промежуток">
                      <NumBox
                        value={s.columnGap}
                        unit={unit}
                        disabled={s.columns < 2}
                        onChange={(v) => patch({ columnGap: v })}
                      />
                    </Row>
                  </div>

                  <label className="mt-2 flex cursor-pointer items-center gap-1.5 text-[12px] text-slate-700">
                    <input
                      type="checkbox"
                      checked={s.columnRule}
                      disabled={s.columns < 2}
                      onChange={(e) => patch({ columnRule: e.target.checked })}
                      className="h-3.5 w-3.5 accent-[hsl(var(--win-title))]"
                    />
                    Разделитель между колонками
                  </label>
                </div>

                <div className="space-y-1 border-t border-slate-200 pt-2">
                  <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-slate-700">
                    <input
                      type="checkbox"
                      checked={s.lineNumbers}
                      onChange={(e) => patch({ lineNumbers: e.target.checked })}
                      className="h-3.5 w-3.5 accent-[hsl(var(--win-title))]"
                    />
                    Нумерация строк
                  </label>
                  <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-slate-700">
                    <input
                      type="checkbox"
                      checked={s.hyphenation}
                      onChange={(e) => patch({ hyphenation: e.target.checked })}
                      className="h-3.5 w-3.5 accent-[hsl(var(--win-title))]"
                    />
                    Автоматическая расстановка переносов
                  </label>
                  <p className="pl-5 text-[10px] leading-tight text-slate-500">
                    Переносы убирают широкие пробелы в узких колонках
                  </p>
                </div>
              </>
            )}
          </div>

          {/* образец */}
          <div className="w-[140px] shrink-0">
            <p className="mb-1 text-[11px] text-slate-600">Образец</p>
            <div className="flex h-[160px] items-center justify-center rounded-[2px] border border-slate-300 bg-white p-1">
              <div
                className="relative border border-slate-400 bg-white shadow-sm"
                style={{
                  width: previewW * scale,
                  height: previewH * scale,
                }}
              >
                <div
                  className="absolute border border-dashed border-[hsl(var(--win-title))]"
                  style={{
                    top: s.marginTop * scale,
                    bottom: s.marginBottom * scale,
                    left: (s.marginLeft + s.gutter) * scale,
                    right: s.marginRight * scale,
                  }}
                >
                  {s.columns > 1 && (
                    <div
                      className="flex h-full w-full"
                      style={{ gap: s.columnGap * scale }}
                    >
                      {Array.from({ length: s.columns }, (_, i) => (
                        <div key={i} className="flex-1 bg-slate-100" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-1 text-center text-[10px] text-slate-500">
              {showNum(previewW)} × {showNum(previewH)} см
            </p>

            <div className="mt-2">
              <p className="mb-1 text-[11px] text-slate-600">Единицы</p>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as Unit)}
                className="h-[24px] w-full rounded-[2px] border border-slate-300 bg-white px-1 text-[11px] outline-none"
              >
                {(Object.keys(UNIT_LABELS) as Unit[]).map((u) => (
                  <option key={u} value={u}>
                    {UNIT_LABELS[u]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {!fits && (
          <p className="mx-4 mb-2 flex items-start gap-1.5 rounded-[2px] bg-amber-50 px-2.5 py-2 text-[11px] leading-tight text-amber-800">
            <Icon name="TriangleAlert" size={12} className="mt-[1px] shrink-0" />
            Поля слишком велики — для текста не остаётся места
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-300 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button
            size="sm"
            disabled={!fits}
            onClick={() => {
              onApply({ ...s, margin: s.marginTop });
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

export default PageSetupDialog;
