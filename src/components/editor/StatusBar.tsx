import Icon from '@/components/ui/icon';

interface Props {
  words: number;
  chars: number;
  paragraphs: number;
  pages: number;
  savedAt: number | null;
  zoom: number;
  onZoom: (v: number) => void;
}

const StatusBar = ({
  words,
  chars,
  paragraphs,
  pages,
  savedAt,
  zoom,
  onZoom,
}: Props) => (
  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card px-4 py-2 text-[0.7rem] uppercase tracking-[0.08em] text-muted-foreground">
    <div className="flex flex-wrap items-center gap-5">
      <span>
        Слов: <b className="font-semibold text-foreground">{words}</b>
      </span>
      <span>
        Символов: <b className="font-semibold text-foreground">{chars}</b>
      </span>
      <span className="hidden sm:inline">
        Абзацев: <b className="font-semibold text-foreground">{paragraphs}</b>
      </span>
      <span>
        Страниц: <b className="font-semibold text-foreground">{pages}</b>
      </span>
    </div>

    <div className="flex items-center gap-4">
      <span className="hidden items-center gap-1.5 sm:flex">
        <Icon name="Check" size={13} className="text-primary" />
        {savedAt
          ? `Сохранено ${new Date(savedAt).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })}`
          : 'Черновик'}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onZoom(Math.max(60, zoom - 10))}
          className="rounded-sm p-1 transition-colors hover:bg-accent hover:text-accent-foreground"
          title="Уменьшить"
        >
          <Icon name="Minus" size={13} />
        </button>
        <span className="w-10 text-center font-semibold text-foreground">
          {zoom}%
        </span>
        <button
          onClick={() => onZoom(Math.min(150, zoom + 10))}
          className="rounded-sm p-1 transition-colors hover:bg-accent hover:text-accent-foreground"
          title="Увеличить"
        >
          <Icon name="Plus" size={13} />
        </button>
      </div>
    </div>
  </div>
);

export default StatusBar;
