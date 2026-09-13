import { PAGE_GAP } from '@/lib/paginate';

interface Props {
  zoom: number;
  /** Высота листа в пикселях */
  pageHeight: number;
  /** Верхнее и нижнее поля в пикселях */
  paddingTop: number;
  paddingBottom: number;
  /** Сколько страниц в документе — у каждой своя линейка */
  pages: number;
  /** Отступ сверху до начала первого листа */
  offsetTop?: number;
  /** Захват границы поля мышью */
  onDragMargin?: (edge: 'top' | 'bottom', event: React.MouseEvent) => void;
  /** Какую границу тянут и её значение — для подсказки */
  dragging?: 'left' | 'right' | 'top' | 'bottom' | null;
  preview?: number | null;
  /** Двойной щелчок по линейке — окно параметров страницы, как в Word */
  onPageSetup?: () => void;
  /** Уголок над линейкой — переключатель позиций табуляции */
  corner?: React.ReactNode;
}

/**
 * Вертикальная линейка слева от листов: у каждой страницы своя шкала
 * с верхним и нижним полем. Прокручивается вместе с документом и
 * прилипает к левому краю, как в Word.
 */
const DocRulerVertical = ({
  zoom,
  pageHeight,
  paddingTop,
  paddingBottom,
  pages,
  offsetTop = 16,
  onDragMargin,
  dragging,
  preview,
  onPageSetup,
  corner,
}: Props) => {
  const scale = zoom / 100;
  const height = pageHeight * scale;
  const padTop = paddingTop * scale;
  const padBottom = paddingBottom * scale;
  const cm = 37.8 * scale;

  /* шаг между листами вместе с серым зазором */
  const step = (pageHeight + PAGE_GAP) * scale;
  const total = pages * height + Math.max(0, pages - 1) * PAGE_GAP * scale;

  /* деления считаем по полосе набора, как на горизонтальной линейке */
  const marks = Math.floor((height - padTop - padBottom) / cm);

  return (
    <div className="sticky left-0 z-[26] w-[22px] shrink-0 border-r border-[hsl(var(--win-ribbon-border))] bg-[hsl(0_0%_96%)]">
      {/* уголок на пересечении линеек — как в Word */}
      <div className="sticky top-0 z-10 flex h-[20px] items-center justify-center border-b border-[hsl(var(--win-ribbon-border))] bg-[hsl(0_0%_96%)]">
        {corner}
      </div>

      <div style={{ paddingTop: offsetTop * scale }}>
        <div className="relative" style={{ height: total }}>
          {Array.from({ length: Math.max(1, pages) }, (_, page) => (
            <div
              key={page}
              className="absolute left-[3px] w-[15px] cursor-pointer"
              style={{ top: page * step, height }}
              title="Двойной щелчок — параметры страницы"
              onDoubleClick={onPageSetup}
            >
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

              {/* подсказку с размером показываем только у первой страницы */}
              {page === 0 &&
                preview !== null &&
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocRulerVertical;
