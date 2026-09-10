import { forwardRef } from 'react';
import type { DocTheme } from './RibbonDesign';
import type { PageSetup } from './RibbonLayout';
import type { PageFurniture } from '@/lib/page-numbers';
import { pagePixels } from '@/lib/page-setup';
import type { PageBorderSetup } from '@/lib/borders';
import PageFurnitureLayer from './PageFurnitureLayer';

interface Props {
  zoom: number;
  pages: number;
  onInput: () => void;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  theme: DocTheme;
  setup: PageSetup;
  paraSpacing: number;
  watermark: string;
  pageColor: string;
  pageBorder: boolean;
  viewMode?: 'read' | 'print' | 'web' | 'outline' | 'draft';
  showGrid?: boolean;
  pageFlow?: 'vertical' | 'horizontal';
  splitView?: boolean;
  /** Колонтитулы и номера страниц */
  furniture?: PageFurniture;
  docTitle?: string;
  onEditFurniture?: (part: 'header' | 'footer') => void;
  /** Настраиваемое обрамление страницы */
  pageBorderSetup?: PageBorderSetup;
}

/** Лист A4 при 96 dpi */
export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = 1123;
export const CM = 37.8;
export const PAGE_PADDING = 76;
export const PAGE_CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_PADDING * 2;

const DocumentCanvas = forwardRef<HTMLDivElement, Props>(
  (
    {
      zoom,
      pages,
      onInput,
      onScroll,
      theme,
      setup,
      paraSpacing,
      watermark,
      pageColor,
      pageBorder,
      viewMode = 'print',
      showGrid = false,
      pageFlow = 'vertical',
      splitView = false,
      furniture,
      docTitle = '',
      onEditFurniture,
      pageBorderSetup,
    },
    ref,
  ) => {
    const scale = zoom / 100;
    const flat = viewMode === 'web' || viewMode === 'draft' || viewMode === 'outline';
    /* размер листа берём из параметров страницы */
    const paper = pagePixels(
      { width: setup.paperWidth, height: setup.paperHeight },
      setup.landscape,
    );

    const width = paper.width;
    const height = paper.height;

    /* поля по сторонам; переплёт добавляется слева */
    const padTop = flat ? 24 : setup.marginTop * CM;
    const padBottom = flat ? 24 : setup.marginBottom * CM;
    const padLeft = flat ? 24 : (setup.marginLeft + setup.gutter) * CM;
    const padRight = flat ? 24 : setup.marginRight * CM;

    const pad = padTop;
    const contentHeight = height - padTop - padBottom;

    /* веб-документ, черновик и структура — единая лента без листа */
    if (flat)
      return (
        <div
          onScroll={onScroll}
          className={`flex-1 overflow-auto ${splitView ? 'border-b-4 border-[hsl(0_0%_65%)]' : ''}`}
          style={{
            background:
              viewMode === 'web'
                ? pageColor
                : viewMode === 'outline' || viewMode === 'draft'
                  ? '#fff'
                  : 'hsl(var(--win-canvas))',
          }}
        >
          <div
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            onInput={onInput}
            spellCheck
            className={`pv-page min-h-full outline-none ${
              viewMode === 'outline' ? 'pv-outline' : 'mx-auto'
            } ${viewMode === 'draft' ? 'bg-white' : ''}`}
            style={
              {
                maxWidth: viewMode === 'web' ? 1100 : 900,
                padding: pad,
                paddingLeft: viewMode === 'outline' ? 28 : pad,
                fontFamily:
                  viewMode === 'draft' ? 'Courier New, monospace' : theme.bodyFont,
                color: theme.bodyColor,
                /* 12 пунктов — размер основного текста по умолчанию */
                fontSize: '12pt',
                lineHeight: 1.5,
                zoom: scale,
                '--pv-h-font': theme.headingFont,
                '--pv-h-color': theme.headingColor,
                '--pv-h-transform': theme.headingUpper ? 'uppercase' : 'none',
                '--pv-p-after': `${Math.max(setup.spaceAfter, paraSpacing)}px`,
              } as React.CSSProperties
            }
          />
        </div>
      );

    return (
      <div
        onScroll={onScroll}
        className={`flex-1 ${
          pageFlow === 'horizontal' ? 'overflow-x-auto overflow-y-hidden' : 'overflow-auto'
        } ${splitView ? 'border-b-4 border-[hsl(0_0%_65%)]' : ''}`}
        style={{ background: 'hsl(var(--win-canvas))' }}
      >
        <div
          className="mx-auto"
          style={{
            width: width * scale,
            paddingTop: 16 * scale,
            paddingBottom: 24 * scale,
          }}
        >
          <div
            className="origin-top"
            style={{ transform: `scale(${scale})`, width }}
          >
            <div
              className="relative shadow-[0_1px_5px_rgba(0,0,0,0.35)]"
              style={{
                background: pageColor,
                backgroundImage: showGrid
                  ? 'linear-gradient(hsl(210 40% 88%) 1px, transparent 1px), linear-gradient(90deg, hsl(210 40% 88%) 1px, transparent 1px)'
                  : undefined,
                backgroundSize: showGrid ? '18.9px 18.9px' : undefined,
              }}
            >
              {watermark && (
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden">
                  <span
                    className="select-none whitespace-nowrap text-[86px] font-bold uppercase"
                    style={{
                      color: 'rgba(0,0,0,0.09)',
                      transform: 'rotate(-35deg)',
                    }}
                  >
                    {watermark}
                  </span>
                </div>
              )}

              {pageBorderSetup?.enabled && pageBorderSetup.art && (
                <div
                  className="pointer-events-none absolute z-[16] overflow-hidden text-[13px] leading-none"
                  style={{
                    inset: pageBorderSetup.margin,
                    color: pageBorderSetup.color,
                  }}
                >
                  {/* рамка из повторяющегося рисунка по четырём сторонам */}
                  <div className="absolute inset-x-0 top-0 flex justify-between">
                    {Array.from({ length: 34 }, (_, i) => (
                      <span key={i}>{pageBorderSetup.art}</span>
                    ))}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex justify-between">
                    {Array.from({ length: 34 }, (_, i) => (
                      <span key={i}>{pageBorderSetup.art}</span>
                    ))}
                  </div>
                  <div className="absolute inset-y-0 left-0 flex flex-col justify-between">
                    {Array.from({ length: 46 }, (_, i) => (
                      <span key={i}>{pageBorderSetup.art}</span>
                    ))}
                  </div>
                  <div className="absolute inset-y-0 right-0 flex flex-col justify-between">
                    {Array.from({ length: 46 }, (_, i) => (
                      <span key={i}>{pageBorderSetup.art}</span>
                    ))}
                  </div>
                </div>
              )}

              {furniture && onEditFurniture && (
                <PageFurnitureLayer
                  furniture={furniture}
                  pages={pages}
                  pageHeight={height}
                  padding={pad}
                  padLeft={padLeft}
                  padRight={padRight}
                  contentHeight={contentHeight}
                  docTitle={docTitle}
                  onEdit={onEditFurniture}
                />
              )}

              {Array.from({ length: Math.max(0, pages - 1) }, (_, i) => (
                <div
                  key={i}
                  className="pointer-events-none absolute left-0 right-0 z-10 border-t border-dashed border-[hsl(0_0%_72%)]"
                  style={{ top: (i + 1) * contentHeight + pad }}
                />
              ))}

              <div
                ref={ref}
                contentEditable
                suppressContentEditableWarning
                onInput={onInput}
                spellCheck
                className="pv-page relative z-10 outline-none"
                style={
                  {
                    minHeight: height,
                    paddingTop: padTop,
                    paddingBottom: padBottom,
                    paddingLeft: padLeft + setup.indentLeft * CM,
                    paddingRight: padRight + setup.indentRight * CM,
                    fontFamily: theme.bodyFont,
                    color: theme.bodyColor,
                    fontSize: '12pt',
                    lineHeight: 1.5,
                    columnCount: setup.columns,
                    columnGap: setup.columnGap * CM,
                    columnRule: setup.columnRule
                      ? '1px solid #b4b4b4'
                      : undefined,
                    border:
                      pageBorderSetup?.enabled && !pageBorderSetup.art
                        ? `${pageBorderSetup.width}px ${pageBorderSetup.style} ${pageBorderSetup.color}`
                        : pageBorder
                          ? '2px solid #2f5496'
                          : undefined,
                    hyphens: setup.hyphenation ? 'auto' : 'manual',
                    '--pv-h-font': theme.headingFont,
                    '--pv-h-color': theme.headingColor,
                    '--pv-h-transform': theme.headingUpper ? 'uppercase' : 'none',
                    '--pv-h-fill': theme.headingFill ?? 'transparent',
                    '--pv-p-before': `${setup.spaceBefore}px`,
                    '--pv-p-after': `${Math.max(setup.spaceAfter, paraSpacing)}px`,
                  } as React.CSSProperties
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);

DocumentCanvas.displayName = 'DocumentCanvas';

export default DocumentCanvas;