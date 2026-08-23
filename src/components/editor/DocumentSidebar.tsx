import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import type { PvDocument } from '@/hooks/use-documents';

interface Props {
  documents: PvDocument[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRemove: (id: string) => void;
}

const formatTime = (ts: number) => {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'только что';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} мин назад`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)} ч назад`;
  return new Date(ts).toLocaleDateString('ru-RU');
};

const DocumentSidebar = ({
  documents,
  activeId,
  onSelect,
  onCreate,
  onRemove,
}: Props) => (
  <aside className="flex h-full w-full flex-col border-r border-border bg-sidebar">
    <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
        Документы
      </span>
      <button
        onClick={onCreate}
        title="Создать документ"
        className="rounded-sm p-1 text-primary transition-colors hover:bg-accent"
      >
        <Icon name="Plus" size={16} />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto">
      {documents.map((doc) => (
        <div
          key={doc.id}
          onClick={() => onSelect(doc.id)}
          className={cn(
            'group flex cursor-pointer items-start gap-2 border-b border-sidebar-border px-4 py-3 transition-colors',
            doc.id === activeId
              ? 'bg-card border-l-2 border-l-primary'
              : 'hover:bg-secondary',
          )}
        >
          <Icon
            name="FileText"
            size={15}
            className={cn(
              'mt-0.5 shrink-0',
              doc.id === activeId ? 'text-primary' : 'text-muted-foreground',
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[0.86rem] font-medium text-sidebar-foreground">
              {doc.title || 'Без названия'}
            </div>
            <div className="mt-0.5 text-[0.7rem] text-muted-foreground">
              {formatTime(doc.updatedAt)}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(doc.id);
            }}
            title="Удалить"
            className="opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
          >
            <Icon name="Trash2" size={14} />
          </button>
        </div>
      ))}
    </div>

    <div className="border-t border-sidebar-border px-4 py-3 text-[0.7rem] text-muted-foreground">
      Черновики хранятся в браузере
    </div>
  </aside>
);

export default DocumentSidebar;
