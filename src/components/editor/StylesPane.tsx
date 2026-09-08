import Icon from '@/components/ui/icon';
import type { DocStyle } from '@/lib/doc-styles';
import { styleCss } from '@/lib/doc-styles';

interface Props {
  open: boolean;
  styles: DocStyle[];
  activeId: string;
  onClose: () => void;
  onApply: (style: DocStyle) => void;
  onEdit: (style: DocStyle) => void;
  onCreate: () => void;
  onClear: () => void;
}

/** Боковая область «Стили» — полный список с образцами */
const StylesPane = ({
  open,
  styles,
  activeId,
  onClose,
  onApply,
  onEdit,
  onCreate,
  onClear,
}: Props) => {
  if (!open) return null;

  return (
    <aside className="flex w-[250px] shrink-0 flex-col border-l border-[hsl(var(--win-ribbon-border))] bg-white">
      <div className="flex h-9 items-center justify-between border-b border-[hsl(var(--win-ribbon-border))] px-3">
        <span className="text-[12px] font-semibold text-slate-700">Стили</span>
        <button
          type="button"
          title="Закрыть"
          onClick={onClose}
          className="flex h-5 w-5 items-center justify-center rounded-[2px] hover:bg-[hsl(var(--win-hover))]"
        >
          <Icon name="X" size={13} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {styles.map((s) => {
          const active = s.id === activeId;

          return (
            <div
              key={s.id}
              className={`group mb-[3px] flex items-center gap-1 rounded-[2px] border px-2 py-1.5 ${
                active
                  ? 'border-[hsl(var(--win-title))] bg-[hsl(var(--win-hover))]'
                  : 'border-transparent hover:border-[hsl(var(--win-ribbon-border))] hover:bg-[hsl(var(--win-hover))]'
              }`}
            >
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onApply(s)}
                className="min-w-0 flex-1 text-left"
              >
                <span
                  className="block truncate"
                  style={{ ...styleCss(s), fontSize: 13, textAlign: 'left' }}
                >
                  {s.name}
                </span>
                <span className="text-[10px] text-slate-500">
                  {s.kind === 'character' ? 'знака' : 'абзаца'}
                  {s.level > 0 && ` · уровень ${s.level}`}
                  {!s.builtin && ' · свой'}
                </span>
              </button>

              <button
                type="button"
                title="Изменить стиль"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onEdit(s)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] opacity-0 hover:bg-white group-hover:opacity-100"
              >
                <Icon name="Pencil" size={12} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex gap-1 border-t border-[hsl(var(--win-ribbon-border))] p-2">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onCreate}
          className="win-btn h-[24px] flex-1 gap-1 border-[hsl(var(--win-ribbon-border))] px-1 text-[11px]"
        >
          <Icon name="Plus" size={12} />
          Создать
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClear}
          className="win-btn h-[24px] flex-1 gap-1 border-[hsl(var(--win-ribbon-border))] px-1 text-[11px]"
        >
          <Icon name="Eraser" size={12} />
          Очистить
        </button>
      </div>
    </aside>
  );
};

export default StylesPane;
