import type { TabAlign, TabStop } from '@/lib/tab-stops';
import { TAB_ALIGN_LABELS } from '@/lib/tab-stops';

interface Props {
  zoom: number;
  pageWidth: number;
  /** Левое поле листа в пикселях */
  padding: number;
  /** Правое поле листа: в документе оно может отличаться от левого */
  paddingRight?: number;
  /** Позиции табуляции текущего абзаца */
  tabStops?: TabStop[];
  /** Тип, который поставится при щелчке по линейке */
  tabAlign?: TabAlign;
  onTabAlign?: () => void;
  onAddTab?: (positionCm: number) => void;
  onRemoveTab?: (positionCm: number) => void;
  /** Захват границы поля мышью */
  onDragMargin?: (edge: 'left' | 'right', event: React.MouseEvent) => void;
  /** Какую границу тянут и её значение — для подсказки */
  dragging?: 'left' | 'right' | 'top' | 'bottom' | null;
  preview?: number | null;
  /** Двойной щелчок по линейке — окно параметров страницы, как в Word */
  onPageSetup?: () => void;
}

const SIGN: Record<TabAlign, string> = {
  left: '⌐',
  center: '⊥',
  right: '¬',
  decimal: '⊥',
  bar: '|',
};

/** Горизонтальная линейка над листом с позициями табуляции */
const DocRuler = ({
  zoom,
  pageWidth,
  padding,
  paddingRight,
  tabStops = [],
  tabAlign = 'left',
  onTabAlign,
  onAddTab,
  onRemoveTab,
  onDragMargin,
  dragging,
  preview,
  onPageSetup,
}: Props) => {
  const scale = zoom / 100;
  const width = pageWidth * scale;
  const pad = padding * scale;
  const padRight = (paddingRight ?? padding) * scale;
  const cm = 37.8 * scale;

  /* деления считаем по настоящей ширине полосы набора */
  const marks = Math.floor((width - pad - padRight) / cm);

  const current = TAB_ALIGN_LABELS.find((t) => t.value === tabAlign);

  /* щелчок по линейке ставит позицию там, куда попали */
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onAddTab) return;

    /* тянули поле — это не установка позиции табуляции */
    if (dragging || preview !== null) return;

    const box = e.currentTarget.getBoundingClientRect();
    const position = (e.clientX - box.left - pad) / cm;

    if (position > 0.1) onAddTab(Number(position.toFixed(2)));
  };

  return (
    <div className="flex h-[20px] shrink-0 items-center justify-center border-b border-[hsl(var(--win-ribbon-border))] bg-[hsl(0_0%_96%)]">
      {/* переключатель типа позиции — левый край линейки, как в Word */}
      <button
        type="button"
        title={`Тип позиции табуляции: ${current?.label ?? ''}`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onTabAlign}
        className="absolute left-1 flex h-[16px] w-[18px] items-center justify-center rounded-[2px] border border-[hsl(0_0%_72%)] bg-white text-[10px] leading-none hover:border-[hsl(var(--win-title))]"
      >
        {current?.sign ?? '⌐'}
      </button>

      <div
        className="relative h-[15px] cursor-pointer"
        style={{ width }}
        title="Двойной щелчок — параметры страницы"
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleClick}
        onDoubleClick={onPageSetup}
      >
        <div className="absolute inset-0 rounded-[1px] bg-[hsl(0_0%_78%)]" />
        <div
          className="absolute inset-y-0 rounded-[1px] border border-[hsl(0_0%_66%)] bg-white"
          style={{ left: pad, right: padRight }}
        />

        {/* границы полей: тянутся мышью, как в Word */}
        {onDragMargin && (
          <>
            <div
              role="presentation"
              title="Левое поле: потяните, чтобы изменить"
              onMouseDown={(e) => onDragMargin('left', e)}
              className="absolute inset-y-0 z-10 w-[7px] cursor-col-resize hover:bg-[hsl(210_60%_60%/0.35)]"
              style={{ left: pad - 3 }}
            />
            <div
              role="presentation"
              title="Правое поле: потяните, чтобы изменить"
              onMouseDown={(e) => onDragMargin('right', e)}
              className="absolute inset-y-0 z-10 w-[7px] cursor-col-resize hover:bg-[hsl(210_60%_60%/0.35)]"
              style={{ left: width - padRight - 3 }}
            />
          </>
        )}

        {/* во время перетаскивания показываем размер в сантиметрах */}
        {preview !== null && preview !== undefined && (
          <span
            className="pointer-events-none absolute top-[17px] z-20 whitespace-nowrap rounded-[2px] border border-[hsl(0_0%_72%)] bg-[hsl(60_100%_96%)] px-1 text-[9px] leading-[13px] text-[hsl(0_0%_20%)] shadow-sm"
            style={{
              left:
                dragging === 'right'
                  ? Math.max(0, width - padRight - 20)
                  : Math.max(0, pad - 20),
            }}
          >
            {preview.toFixed(2).replace('.', ',')} см
          </span>
        )}

        {Array.from({ length: marks }, (_, i) => (
          <span
            key={i}
            className="pointer-events-none absolute top-[3px] text-[8px] leading-none text-[hsl(0_0%_35%)]"
            style={{ left: pad + (i + 1) * cm - 3 }}
          >
            {i + 1}
          </span>
        ))}

        {/* маркеры позиций табуляции */}
        {tabStops.map((t) => (
          <button
            key={`${t.position}-${t.align}`}
            type="button"
            title={`${
              TAB_ALIGN_LABELS.find((a) => a.value === t.align)?.label ?? ''
            } — ${t.position.toFixed(2).replace('.', ',')} см. Щёлкните, чтобы убрать`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              onRemoveTab?.(t.position);
            }}
            className="absolute bottom-0 flex h-[11px] w-[11px] items-center justify-center text-[10px] leading-none text-[hsl(215_70%_35%)] hover:text-[hsl(0_70%_45%)]"
            style={{ left: pad + t.position * cm - 5 }}
          >
            {SIGN[t.align]}
            {t.align === 'decimal' && (
              <span className="absolute -bottom-[1px] text-[7px]">·</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DocRuler;