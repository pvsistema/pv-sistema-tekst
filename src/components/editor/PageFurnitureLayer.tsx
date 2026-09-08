import type { PageFurniture } from '@/lib/page-numbers';
import { expandFields, formatNumber } from '@/lib/page-numbers';

interface Props {
  furniture: PageFurniture;
  pages: number;
  /** Высота одной страницы и поля — чтобы попасть в нужное место листа */
  pageHeight: number;
  padding: number;
  /** Поля слева и справа — колонтитул выравнивается по тексту */
  padLeft?: number;
  padRight?: number;
  contentHeight: number;
  docTitle: string;
  onEdit: (part: 'header' | 'footer') => void;
}

const alignClass = {
  left: 'justify-start text-left',
  center: 'justify-center text-center',
  right: 'justify-end text-right',
};

/**
 * Колонтитулы и номера страниц. Рисуются поверх листа и повторяются
 * на каждой странице — как в режиме разметки Word.
 */
const PageFurnitureLayer = ({
  furniture: f,
  pages,
  pageHeight,
  padding,
  padLeft,
  padRight,
  contentHeight,
  docTitle,
  onEdit,
}: Props) => {
  const active =
    f.headerText || f.footerText || f.numberPosition !== 'none';

  if (!active) return null;

  const isTop = f.numberPosition.startsWith('top');
  const side = f.numberPosition.split('-')[1] as 'left' | 'center' | 'right';

  return (
    <>
      {Array.from({ length: Math.max(1, pages) }, (_, i) => {
        const page = i + 1;
        const number = f.numberStart + i;
        const first = page === 1;

        /* на первой странице колонтитул можно не показывать */
        const skip = f.differentFirst && first;
        const showNumber =
          f.numberPosition !== 'none' && (!first || f.numberOnFirst);

        const top = i * contentHeight;

        const header = skip
          ? ''
          : expandFields(f.headerText, number, pages, docTitle);
        const footer = skip
          ? ''
          : expandFields(f.footerText, number, pages, docTitle);

        const label = formatNumber(number, f.numberFormat);

        return (
          <div key={i}>
            {/* верхнее поле */}
            {(header || (showNumber && isTop)) && (
              <button
                type="button"
                title="Изменить верхний колонтитул"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onEdit('header')}
                className="group absolute left-0 right-0 z-[15] flex items-center text-[12px] text-[hsl(0_0%_35%)] hover:bg-[hsl(210_60%_50%)]/5"
                style={{
                  top: top + padding / 3,
                  height: padding / 2,
                  paddingLeft: padLeft ?? 76,
                  paddingRight: padRight ?? 76,
                }}
              >
                <span
                  className={`flex w-full items-center gap-2 ${
                    alignClass[f.headerAlign]
                  }`}
                >
                  {header}
                  {showNumber && isTop && (
                    <span
                      className={
                        side === 'left'
                          ? 'mr-auto'
                          : side === 'right'
                            ? 'ml-auto'
                            : 'mx-auto'
                      }
                    >
                      {label}
                    </span>
                  )}
                </span>
              </button>
            )}

            {/* нижнее поле */}
            {(footer || (showNumber && !isTop)) && (
              <button
                type="button"
                title="Изменить нижний колонтитул"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onEdit('footer')}
                className="absolute left-0 right-0 z-[15] flex items-center text-[12px] text-[hsl(0_0%_35%)] hover:bg-[hsl(210_60%_50%)]/5"
                style={{
                  top: top + pageHeight - padding / 1.6,
                  height: padding / 2,
                  paddingLeft: padLeft ?? 76,
                  paddingRight: padRight ?? 76,
                }}
              >
                <span
                  className={`flex w-full items-center gap-2 ${
                    alignClass[f.footerAlign]
                  }`}
                >
                  {footer}
                  {showNumber && !isTop && (
                    <span
                      className={
                        side === 'left'
                          ? 'mr-auto'
                          : side === 'right'
                            ? 'ml-auto'
                            : 'mx-auto'
                      }
                    >
                      {label}
                    </span>
                  )}
                </span>
              </button>
            )}
          </div>
        );
      })}
    </>
  );
};

export default PageFurnitureLayer;
