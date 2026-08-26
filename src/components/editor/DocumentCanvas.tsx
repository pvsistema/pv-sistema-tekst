import { forwardRef } from 'react';

interface Props {
  zoom: number;
  pages: number;
  onInput: () => void;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

/** Лист A4 при 96 dpi, поля 2 см */
export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = 1123;
export const PAGE_PADDING = 76;
export const PAGE_CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_PADDING * 2;

const DocumentCanvas = forwardRef<HTMLDivElement, Props>(
  ({ zoom, pages, onInput, onScroll }, ref) => {
    const scale = zoom / 100;

    return (
      <div
        onScroll={onScroll}
        className="flex-1 overflow-auto"
        style={{ background: 'hsl(var(--win-canvas))' }}
      >
        <div
          className="mx-auto"
          style={{
            width: PAGE_WIDTH * scale,
            paddingTop: 16 * scale,
            paddingBottom: 24 * scale,
          }}
        >
          <div
            className="origin-top"
            style={{ transform: `scale(${scale})`, width: PAGE_WIDTH }}
          >
            <div className="relative bg-white shadow-[0_1px_5px_rgba(0,0,0,0.35)]">
              {Array.from({ length: Math.max(0, pages - 1) }, (_, i) => (
                <div
                  key={i}
                  className="pointer-events-none absolute left-0 right-0 z-10 border-t border-dashed border-[hsl(0_0%_72%)]"
                  style={{ top: (i + 1) * PAGE_CONTENT_HEIGHT + PAGE_PADDING }}
                />
              ))}

              <div
                ref={ref}
                contentEditable
                suppressContentEditableWarning
                onInput={onInput}
                spellCheck
                className="pv-page outline-none"
                style={{
                  minHeight: PAGE_HEIGHT,
                  padding: PAGE_PADDING,
                  fontFamily: 'Calibri, "Segoe UI", sans-serif',
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: '#000',
                }}
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
