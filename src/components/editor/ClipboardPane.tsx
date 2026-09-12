import Icon from '@/components/ui/icon';
import type { ClipItem } from '@/hooks/use-clipboard-pane';

interface Props {
  open: boolean;
  items: ClipItem[];
  onClose: () => void;
  onPaste: (html: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

/** Область буфера обмена слева от документа — как в Word */
const ClipboardPane = ({
  open,
  items,
  onClose,
  onPaste,
  onRemove,
  onClear,
}: Props) => {
  if (!open) return null;

  return (
    <aside className="flex w-[230px] shrink-0 flex-col border-r border-[hsl(var(--win-ribbon-border))] bg-[hsl(0_0%_98%)]">
      <div className="flex items-center justify-between border-b border-[hsl(var(--win-ribbon-border))] px-2 py-1.5">
        <span className="text-[12px] font-semibold">Буфер обмена</span>
        <button
          type="button"
          title="Закрыть"
          onClick={onClose}
          className="flex h-[18px] w-[18px] items-center justify-center rounded-[2px] hover:bg-[hsl(0_70%_60%)] hover:text-white"
        >
          <Icon name="X" size={12} />
        </button>
      </div>

      <div className="flex items-center justify-between border-b border-[hsl(var(--win-ribbon-border))] px-2 py-1">
        <span className="text-[10px] text-slate-500">
          Фрагментов: {items.length}
        </span>
        <button
          type="button"
          disabled={!items.length}
          onClick={onClear}
          className="rounded-[2px] px-1.5 py-[2px] text-[10px] hover:bg-[hsl(var(--win-hover))] disabled:opacity-40"
        >
          Очистить всё
        </button>
      </div>

      <div className="flex-1 overflow-auto p-1.5">
        {!items.length && (
          <p className="px-1 py-3 text-center text-[11px] leading-snug text-slate-500">
            Скопируйте фрагменты документа — они появятся здесь, и любой
            можно будет вставить повторно
          </p>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className="group relative mb-1.5 rounded-[2px] border border-[hsl(var(--win-ribbon-border))] bg-white"
          >
            <button
              type="button"
              title="Щёлкните, чтобы вставить этот фрагмент"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onPaste(item.html)}
              className="block w-full px-2 py-1.5 text-left text-[11px] leading-snug hover:bg-[hsl(var(--win-hover))]"
            >
              <span className="line-clamp-3 block">{item.text}</span>
            </button>

            <button
              type="button"
              title="Убрать из буфера"
              onClick={() => onRemove(item.id)}
              className="absolute right-1 top-1 hidden h-[16px] w-[16px] items-center justify-center rounded-[2px] bg-white/90 hover:bg-[hsl(0_70%_60%)] hover:text-white group-hover:flex"
            >
              <Icon name="X" size={10} />
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default ClipboardPane;
