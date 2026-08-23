import { forwardRef } from 'react';

interface Props {
  zoom: number;
  pages: number;
  title: string;
  onInput: () => void;
}

/** Высота полезной области страницы A4 при полях 2 см, px (96 dpi) */
export const PAGE_HEIGHT = 1122;
export const PAGE_PADDING = 76;
export const PAGE_CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_PADDING * 2;

const DocumentCanvas = forwardRef<HTMLDivElement, Props>(
  ({ zoom, pages, title, onInput }, ref) => (
    <div className="editor-surface flex-1 overflow-auto bg-background px-4 py-8">
      <div
        className="mx-auto origin-top transition-transform duration-200"
        style={{ transform: `scale(${zoom / 100})`, width: 794 }}
      >
        <div className="paper-shadow relative rounded-sm border border-[hsl(var(--hero-paper-edge))] bg-card">
          {/* направляющие разбивки на страницы */}
          {Array.from({ length: Math.max(0, pages - 1) }, (_, i) => (
            <div
              key={i}
              className="pointer-events-none absolute left-0 right-0 z-10 flex items-center"
              style={{ top: (i + 1) * PAGE_CONTENT_HEIGHT + PAGE_PADDING }}
            >
              <span className="h-px flex-1 border-t border-dashed border-[hsl(var(--hero-rule))]" />
              <span className="bg-card px-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Страница {i + 2}
              </span>
              <span className="h-px flex-1 border-t border-dashed border-[hsl(var(--hero-rule))]" />
            </div>
          ))}

          {/* колонтитул */}
          <div className="absolute left-[76px] right-[76px] top-6 flex justify-between text-[10px] uppercase tracking-[0.13em] text-muted-foreground">
            <span className="truncate">{title || 'Без названия'}</span>
            <span>Поля 2 см · A4</span>
          </div>

          <div
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            onInput={onInput}
            spellCheck
            className="pv-page prose-none outline-none"
            style={{
              minHeight: PAGE_HEIGHT,
              padding: PAGE_PADDING,
              fontSize: 16,
              lineHeight: 1.7,
            }}
          />
        </div>
        <div className="h-10" />
      </div>
    </div>
  ),
);

DocumentCanvas.displayName = 'DocumentCanvas';

export default DocumentCanvas;
