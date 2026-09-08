import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/ui/icon';
import { RibbonGroup, BigCmd } from './RibbonControls';
import type { StructureGroup } from '@/lib/equation';
import { EQ_SYMBOL_SETS, READY_EQUATIONS, STRUCTURES } from '@/lib/equation';

export interface RibbonEquationProps {
  onEquationStructure?: (html: string) => void;
  onEquationSymbol?: (char: string) => void;
  onEquationReady?: (html: string, label: string) => void;
  onEquationNew?: (display: boolean) => void;
  onEquationDisplay?: () => void;
  onEquationRemove?: () => void;
}

/** Короткие подписи для узких кнопок ленты */
const SHORT: Record<string, string> = {
  'Крупный оператор': 'Оператор',
  'Диакритические знаки': 'Диакрит.',
  'Предел и логарифм': 'Предел',
};

/** Кнопка структуры с раскрывающейся галереей вариантов */
const StructureBtn = ({
  group,
  onPick,
}: {
  group: StructureGroup;
  onPick: (html: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);

  /* список рисуем поверх страницы — лента его обрезает */
  const box = btn.current?.getBoundingClientRect();

  return (
    <div className="relative">
      <button
        ref={btn}
        type="button"
        title={group.title}
        onClick={() => setOpen((v) => !v)}
        className="flex h-[48px] w-[62px] flex-col items-center justify-center gap-[3px] rounded-[2px] border border-transparent px-[2px] hover:border-[hsl(var(--win-ribbon-border))] hover:bg-[hsl(var(--win-hover))]"
      >
        <Icon name={group.icon} size={17} />
        <span className="flex items-center gap-[1px] text-center text-[9px] leading-[1.1]">
          {SHORT[group.title] ?? group.title}
          <Icon name="ChevronDown" size={8} className="shrink-0" />
        </span>
      </button>

      {open &&
        box &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[120]"
              onClick={() => setOpen(false)}
            />
            <div
              className="fixed z-[121] w-[240px] rounded-[3px] border border-[hsl(var(--win-ribbon-border))] bg-white p-1 shadow-xl"
              style={{
                left: Math.min(box.left, window.innerWidth - 250),
                top: box.bottom + 2,
              }}
            >
              <p className="px-1 pb-1 text-[10px] font-semibold uppercase text-slate-500">
                {group.title}
              </p>
              {group.items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    onPick(item.html);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-[2px] px-2 py-[5px] text-left hover:bg-[hsl(var(--win-hover))]"
                >
                  <span
                    className="pv-page shrink-0 text-[13px]"
                    dangerouslySetInnerHTML={{ __html: item.html }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[11px] text-slate-600">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
};

/** Вкладка «Конструктор формул»: сервис, символы, структуры */
const RibbonEquation = (p: RibbonEquationProps) => {
  const [symbolSet, setSymbolSet] = useState(0);
  const [ready, setReady] = useState(false);

  const chars = EQ_SYMBOL_SETS[symbolSet].chars;

  return (
    <>
      <RibbonGroup title="Сервис">
        <div className="relative">
          <BigCmd
            glyph="π"
            lines={['Формула']}
            caret
            width={58}
            onClick={() => setReady((v) => !v)}
          />

          {ready &&
            createPortal(
            <>
              <div
                className="fixed inset-0 z-[120]"
                onClick={() => setReady(false)}
              />
              <div className="fixed left-2 top-[128px] z-[121] max-h-[70vh] w-[280px] overflow-y-auto rounded-[3px] border border-[hsl(var(--win-ribbon-border))] bg-white p-1 shadow-xl">
                <p className="px-1 pb-1 text-[10px] font-semibold uppercase text-slate-500">
                  Встроенные формулы
                </p>
                {READY_EQUATIONS.map((e) => (
                  <button
                    key={e.label}
                    type="button"
                    onClick={() => {
                      p.onEquationReady?.(e.html, e.label);
                      setReady(false);
                    }}
                    className="block w-full rounded-[2px] px-2 py-[5px] text-left hover:bg-[hsl(var(--win-hover))]"
                  >
                    <span
                      className="pv-page block text-[13px]"
                      dangerouslySetInnerHTML={{ __html: e.html }}
                    />
                    <span className="block text-[10px] text-slate-500">
                      {e.label}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    p.onEquationNew?.(false);
                    setReady(false);
                  }}
                  className="mt-1 block w-full border-t border-slate-200 px-2 py-[6px] text-left text-[11px] hover:bg-[hsl(var(--win-hover))]"
                >
                  Вставить новую формулу
                </button>
              </div>
            </>,
            document.body,
          )}
        </div>

        <BigCmd
          icon="Rows2"
          lines={['Обычный', 'текст']}
          width={58}
          onClick={p.onEquationDisplay}
        />
        <BigCmd
          icon="Trash2"
          lines={['Удалить', 'формулу']}
          width={58}
          onClick={p.onEquationRemove}
        />
      </RibbonGroup>

      <RibbonGroup title="Символы">
        <div className="flex items-start gap-1">
          <select
            value={symbolSet}
            onChange={(e) => setSymbolSet(Number(e.target.value))}
            className="mt-[2px] h-[22px] w-[104px] rounded-[2px] border border-[hsl(var(--win-ribbon-border))] bg-white px-1 text-[11px] outline-none"
          >
            {EQ_SYMBOL_SETS.map((s, i) => (
              <option key={s.title} value={i}>
                {s.title}
              </option>
            ))}
          </select>

          <div className="grid max-h-[70px] grid-flow-col grid-rows-3 gap-[1px] overflow-x-auto">
            {chars.map((ch) => (
              <button
                key={ch}
                type="button"
                title={ch}
                onClick={() => p.onEquationSymbol?.(ch)}
                className="h-[21px] w-[23px] rounded-[2px] border border-transparent text-[13px] hover:border-[hsl(var(--win-title))] hover:bg-[hsl(var(--win-hover))]"
                style={{ fontFamily: 'Cambria Math, Cambria, Georgia, serif' }}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      </RibbonGroup>

      <RibbonGroup title="Структуры">
        <div className="flex flex-wrap gap-[1px]">
          {STRUCTURES.map((g) => (
            <StructureBtn
              key={g.kind}
              group={g}
              onPick={(html) => p.onEquationStructure?.(html)}
            />
          ))}
        </div>
      </RibbonGroup>
    </>
  );
};

export default RibbonEquation;
