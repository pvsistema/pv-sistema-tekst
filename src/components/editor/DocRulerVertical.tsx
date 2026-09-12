interface Props {
  zoom: number;
  /** Высота листа в пикселях */
  pageHeight: number;
  /** Верхнее и нижнее поля в пикселях */
  paddingTop: number;
  paddingBottom: number;
  /** Отступ сверху до начала листа — линейка встаёт вровень с ним */
  offsetTop?: number;
  /** Захват границы поля мышью */
  onDragMargin?: (edge: 'top' | 'bottom', event: React.MouseEvent) => void;
  /** Какую границу тянут и её значение — для подсказки */
  dragging?: 'left' | 'right' | 'top' | 'bottom' | null;
  preview?: number | null;
}

/**
 * Вертикальная линейка слева от листа: показывает верхнее и нижнее
 * поля и деления в сантиметрах, как в Word.
 */
const DocRulerVertical = ({
  zoom,
  pageHeight,
  paddingTop,
  paddingBottom,
  offsetTop = 16,
  onDragMargin,
  dragging,
  preview,
}: Props) => {
  const scale = zoom / 100;
  const height = pageHeight * scale;
  const padTop = paddingTop * scale;
  const padBottom = paddingBottom * scale;
  const cm = 37.8 * scale;

  /* деления считаем по полосе набора, как на горизонтальной линейке */
  const marks = Math.floor((height - padTop - padBottom) / cm);

  return (
    <div
      className="relative w-[20px] shrink-0 border-r border-[hsl(var(--win-ribbon-border))] bg-[hsl(0_0%_96%)]"
      style={{ paddingTop: offsetTop * scale }}
    >
      <div className="relative w-[15px] mx-auto" style={{ height }}>
        <div className="absolute inset-0 rounded-[1px] bg-[hsl(0_0%_78%)]" />

        {/* белая часть — рабочая область между полями */}
        <div
          className="absolute inset-x-0 rounded-[1px] border border-[hsl(0_0%_66%)] bg-white"
          style={{ top: padTop, bottom: padBottom }}
        />

        {/* границы полей: тянутся мышью, как в Word */}
        {onDragMargin && (
          <>
            <div
              role="presentation"
              title="Верхнее поле: потяните, чтобы изменить"
              onMouseDown={(e) => onDragMargin('top', e)}
              className="absolute inset-x-0 z-10 h-[7px] cursor-row-resize hover:bg-[hsl(210_60%_60%/0.35)]"
              style={{ top: padTop - 3 }}
            />
            <div
              role="presentation"
              title="Нижнее поле: потяните, чтобы изменить"
              onMouseDown={(e) => onDragMargin('bottom', e)}
              className="absolute inset-x-0 z-10 h-[7px] cursor-row-resize hover:bg-[hsl(210_60%_60%/0.35)]"
              style={{ top: height - padBottom - 3 }}
            />
          </>
        )}

        {/* во время перетаскивания показываем размер в сантиметрах */}
        {preview !== null &&
          preview !== undefined &&
          (dragging === 'top' || dragging === 'bottom') && (
            <span
              className="pointer-events-none absolute left-[18px] z-20 whitespace-nowrap rounded-[2px] border border-[hsl(0_0%_72%)] bg-[hsl(60_100%_96%)] px-1 text-[9px] leading-[13px] text-[hsl(0_0%_20%)] shadow-sm"
              style={{
                top:
                  dragging === 'bottom'
                    ? Math.max(0, height - padBottom - 7)
                    : Math.max(0, padTop - 7),
              }}
            >
              {preview.toFixed(2).replace('.', ',')} см
            </span>
          )}

        {Array.from({ length: Math.max(0, marks) }, (_, i) => (
          <span
            key={i}
            className="pointer-events-none absolute left-[2px] text-[8px] leading-none text-[hsl(0_0%_35%)]"
            style={{ top: padTop + (i + 1) * cm - 4 }}
          >
            {i + 1}
          </span>
        ))}
      </div>
    </div>
  );
};

export default DocRulerVertical;