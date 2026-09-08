import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type {
  BorderPreset,
  BorderSetup,
  BorderSide,
  BorderStyle,
  PageBorderSetup,
} from '@/lib/borders';
import {
  BORDER_STYLE_LABELS,
  BORDER_WIDTHS,
  DEFAULT_BORDER,
  PAGE_ART,
  presetSides,
} from '@/lib/borders';

interface Props {
  open: boolean;
  initial: BorderSetup;
  pageInitial: PageBorderSetup;
  onClose: () => void;
  onApply: (setup: BorderSetup, target: 'paragraph' | 'text') => void;
  onApplyPage: (setup: PageBorderSetup) => void;
  /** Открыть сразу на вкладке «Страница» */
  startOnPage?: boolean;
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

const PRESETS: { value: BorderPreset; label: string; icon: string }[] = [
  { value: 'none', label: 'Нет', icon: 'Square' },
  { value: 'box', label: 'Рамка', icon: 'SquareDashedBottom' },
  { value: 'shadow', label: 'Тень', icon: 'Layers' },
  { value: 'custom', label: 'Другая', icon: 'PencilRuler' },
];

/** Окно «Границы и заливка»: абзац, текст и страница целиком */
const BordersDialog = ({
  open,
  initial,
  pageInitial,
  onClose,
  onApply,
  onApplyPage,
  startOnPage = false,
}: Props) => {
  const [tab, setTab] = useState<'border' | 'page' | 'fill'>('border');
  const [s, setS] = useState<BorderSetup>(initial);
  const [page, setPage] = useState<PageBorderSetup>(pageInitial);
  const [target, setTarget] = useState<'paragraph' | 'text'>('paragraph');

  useEffect(() => {
    if (!open) return;
    setS(initial);
    setPage(pageInitial);
    setTab(startOnPage ? 'page' : 'border');
  }, [open, initial, pageInitial, startOnPage]);

  if (!open) return null;

  const patch = (v: Partial<BorderSetup>) => setS((x) => ({ ...x, ...v }));

  const setPreset = (preset: BorderPreset) =>
    patch({
      preset,
      sides: preset === 'custom' ? s.sides : presetSides(preset),
      shadow: preset === 'shadow',
    });

  const toggleSide = (side: BorderSide) => {
    const sides = { ...s.sides, [side]: !s.sides[side] };
    const all = Object.values(sides).every(Boolean);
    const none = !Object.values(sides).some(Boolean);

    patch({
      sides,
      preset: none ? 'none' : all && !s.shadow ? 'box' : 'custom',
    });
  };

  /* образец: показывает, как ляжет обрамление */
  const sampleStyle: React.CSSProperties = {
    borderTop: s.sides.top ? `${s.width}px ${s.style} ${s.color}` : 'none',
    borderRight: s.sides.right ? `${s.width}px ${s.style} ${s.color}` : 'none',
    borderBottom: s.sides.bottom
      ? `${s.width}px ${s.style} ${s.color}`
      : 'none',
    borderLeft: s.sides.left ? `${s.width}px ${s.style} ${s.color}` : 'none',
    background: s.fill || '#fff',
    boxShadow: s.shadow ? '3px 3px 0 rgba(0,0,0,0.35)' : undefined,
  };

  const SideBtn = ({ side, icon }: { side: BorderSide; icon: string }) => (
    <button
      type="button"
      title={`Граница: ${
        { top: 'сверху', right: 'справа', bottom: 'снизу', left: 'слева' }[side]
      }`}
      onClick={() => toggleSide(side)}
      className={`flex h-[26px] w-[28px] items-center justify-center rounded-[2px] border ${
        s.sides[side]
          ? 'border-[hsl(var(--win-title))] bg-[hsl(var(--win-hover))]'
          : 'border-slate-300 bg-white'
      }`}
    >
      <Icon name={icon} size={14} />
    </button>
  );

  const TABS = [
    { id: 'border' as const, label: 'Граница' },
    { id: 'page' as const, label: 'Страница' },
    { id: 'fill' as const, label: 'Заливка' },
  ];

  return (
    <div
      className="fixed inset-0 z-[112] flex items-center justify-center bg-slate-900/30"
      onMouseDown={onClose}
    >
      <div
        className="w-[560px] rounded-md bg-[hsl(var(--win-ribbon))] shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          className="flex h-8 items-center justify-between px-3 text-[12px]"
          style={{
            background: 'hsl(var(--win-title))',
            color: 'hsl(var(--win-title-text))',
          }}
        >
          <span>Границы и заливка</span>
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

        {tab === 'border' && (
          <div className="flex gap-4 p-4">
            {/* тип обрамления */}
            <div className="w-[92px] space-y-1">
              <p className="mb-1 text-[11px] text-slate-600">Тип</p>
              {PRESETS.map((x) => (
                <button
                  key={x.value}
                  type="button"
                  onClick={() => setPreset(x.value)}
                  className={`flex w-full items-center gap-1.5 rounded-[2px] border px-2 py-1 text-left text-[11px] ${
                    s.preset === x.value
                      ? 'border-[hsl(var(--win-title))] bg-[hsl(var(--win-hover))]'
                      : 'border-transparent hover:bg-[hsl(var(--win-hover))]'
                  }`}
                >
                  <Icon name={x.icon} size={13} />
                  {x.label}
                </button>
              ))}
            </div>

            {/* вид линии */}
            <div className="w-[150px] space-y-2">
              <Field label="Тип линии">
                <select
                  value={s.style}
                  onChange={(e) =>
                    patch({ style: e.target.value as BorderStyle })
                  }
                  className={inputCls}
                >
                  {BORDER_STYLE_LABELS.map((x) => (
                    <option key={x.value} value={x.value}>
                      {x.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Цвет">
                <input
                  type="color"
                  value={s.color}
                  onChange={(e) => patch({ color: e.target.value })}
                  className="h-[26px] w-full cursor-pointer rounded-[2px] border border-slate-300 bg-white"
                />
              </Field>

              <Field label="Ширина, пт">
                <select
                  value={s.width}
                  onChange={(e) => patch({ width: Number(e.target.value) })}
                  className={inputCls}
                >
                  {BORDER_WIDTHS.map((w) => (
                    <option key={w} value={w}>
                      {String(w).replace('.', ',')}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Отступ от текста, пт">
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={s.padding}
                  onChange={(e) => patch({ padding: Number(e.target.value) })}
                  className={inputCls}
                />
              </Field>
            </div>

            {/* образец со сторонами */}
            <div className="flex-1">
              <p className="mb-1 text-[11px] text-slate-600">Образец</p>
              <div className="rounded-[2px] border border-slate-300 bg-[hsl(0_0%_97%)] p-3">
                <div
                  className="mb-2 flex h-[74px] items-center justify-center px-2 text-[11px] text-slate-600"
                  style={sampleStyle}
                >
                  Текст абзаца
                </div>

                <div className="flex justify-center gap-1">
                  <SideBtn side="top" icon="ArrowUpToLine" />
                  <SideBtn side="bottom" icon="ArrowDownToLine" />
                  <SideBtn side="left" icon="ArrowLeftToLine" />
                  <SideBtn side="right" icon="ArrowRightToLine" />
                </div>
              </div>

              <Field label="Применить к" width={150}>
                <select
                  value={target}
                  onChange={(e) =>
                    setTarget(e.target.value as 'paragraph' | 'text')
                  }
                  className={`${inputCls} mt-2`}
                >
                  <option value="paragraph">абзацу</option>
                  <option value="text">выделенному тексту</option>
                </select>
              </Field>
            </div>
          </div>
        )}

        {tab === 'fill' && (
          <div className="space-y-4 p-4">
            <div className="flex items-end gap-3">
              <Field label="Цвет заливки" width={140}>
                <input
                  type="color"
                  value={s.fill || '#ffffff'}
                  onChange={(e) => patch({ fill: e.target.value })}
                  className="h-[26px] w-full cursor-pointer rounded-[2px] border border-slate-300 bg-white"
                />
              </Field>

              <Button
                variant="outline"
                size="sm"
                onClick={() => patch({ fill: '' })}
              >
                Без заливки
              </Button>
            </div>

            <div>
              <p className="mb-1.5 text-[11px] text-slate-600">Готовые цвета</p>
              <div className="flex flex-wrap gap-1">
                {[
                  '#ffffff',
                  '#f2f2f2',
                  '#d9e2f3',
                  '#fff2cc',
                  '#e2efd9',
                  '#fbe4d5',
                  '#deeaf6',
                  '#ededed',
                  '#ffd966',
                  '#c5e0b4',
                ].map((c) => (
                  <button
                    key={c}
                    type="button"
                    title={c}
                    onClick={() => patch({ fill: c })}
                    className={`h-[22px] w-[22px] rounded-[2px] border ${
                      s.fill === c
                        ? 'border-[hsl(var(--win-title))] ring-1 ring-[hsl(var(--win-title))]'
                        : 'border-slate-300'
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1 text-[11px] text-slate-600">Образец</p>
              <div
                className="flex h-[64px] items-center justify-center rounded-[2px] border border-slate-300 text-[12px] text-slate-700"
                style={{ background: s.fill || '#fff' }}
              >
                Заливка абзаца
              </div>
            </div>
          </div>
        )}

        {tab === 'page' && (
          <div className="space-y-4 p-4">
            <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-slate-700">
              <input
                type="checkbox"
                checked={page.enabled}
                onChange={(e) =>
                  setPage((x) => ({ ...x, enabled: e.target.checked }))
                }
                className="h-3.5 w-3.5 accent-[hsl(var(--win-title))]"
              />
              Обрамить страницу рамкой
            </label>

            <div className="flex gap-3">
              <Field label="Тип линии" width={140}>
                <select
                  value={page.style}
                  disabled={!!page.art}
                  onChange={(e) =>
                    setPage((x) => ({
                      ...x,
                      style: e.target.value as BorderStyle,
                    }))
                  }
                  className={`${inputCls} disabled:bg-slate-100`}
                >
                  {BORDER_STYLE_LABELS.map((x) => (
                    <option key={x.value} value={x.value}>
                      {x.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Цвет" width={80}>
                <input
                  type="color"
                  value={page.color}
                  onChange={(e) =>
                    setPage((x) => ({ ...x, color: e.target.value }))
                  }
                  className="h-[26px] w-full cursor-pointer rounded-[2px] border border-slate-300 bg-white"
                />
              </Field>

              <Field label="Ширина, пт" width={90}>
                <select
                  value={page.width}
                  onChange={(e) =>
                    setPage((x) => ({ ...x, width: Number(e.target.value) }))
                  }
                  className={inputCls}
                >
                  {BORDER_WIDTHS.map((w) => (
                    <option key={w} value={w}>
                      {String(w).replace('.', ',')}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Отступ от края, пт" width={130}>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={page.margin}
                  onChange={(e) =>
                    setPage((x) => ({ ...x, margin: Number(e.target.value) }))
                  }
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Рисунок рамки" width={200}>
              <select
                value={page.art}
                onChange={(e) => setPage((x) => ({ ...x, art: e.target.value }))}
                className={inputCls}
              >
                {PAGE_ART.map((a) => (
                  <option key={a.label} value={a.value}>
                    {a.value ? `${a.value} ${a.label}` : a.label}
                  </option>
                ))}
              </select>
            </Field>

            <div>
              <p className="mb-1 text-[11px] text-slate-600">Образец</p>
              <div className="flex h-[110px] items-center justify-center rounded-[2px] border border-slate-300 bg-[hsl(0_0%_97%)] p-3">
                <div
                  className="flex h-full w-[74px] items-center justify-center bg-white text-[9px] text-slate-500"
                  style={
                    page.enabled && !page.art
                      ? {
                          border: `${page.width}px ${page.style} ${page.color}`,
                        }
                      : page.enabled && page.art
                        ? {
                            outline: `1px dashed ${page.color}`,
                            outlineOffset: '-3px',
                          }
                        : undefined
                  }
                >
                  {page.enabled && page.art ? (
                    <span style={{ color: page.color }}>{page.art}</span>
                  ) : (
                    'лист'
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-300 px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            className="mr-auto"
            onClick={() => setS(DEFAULT_BORDER)}
          >
            Снять обрамление
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (tab === 'page') onApplyPage(page);
              else onApply(s, target);
            }}
          >
            ОК
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BordersDialog;
