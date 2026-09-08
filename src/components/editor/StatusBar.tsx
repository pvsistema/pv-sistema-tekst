import Icon from '@/components/ui/icon';

interface Props {
  words: number;
  chars: number;
  pages: number;
  currentPage: number;
  zoom: number;
  onZoom: (v: number) => void;
  savedAt: number | null;
  /** Раздел, в котором стоит курсор */
  section?: number;
  sections?: number;
}

const StatusBar = ({
  words,
  chars,
  pages,
  currentPage,
  zoom,
  onZoom,
  savedAt,
  section = 1,
  sections = 1,
}: Props) => (
  <div
    className="flex h-[22px] shrink-0 items-center gap-4 px-3 text-[11px] text-white"
    style={{ background: 'hsl(var(--win-status))' }}
  >
    <span>
      Страница {currentPage} из {pages}
    </span>
    {sections > 1 && (
      <span className="hidden sm:inline">
        Раздел {section} из {sections}
      </span>
    )}
    <span>Число слов: {words}</span>
    <span className="hidden sm:inline">Символов: {chars}</span>
    <span className="hidden md:inline">русский</span>
    {savedAt && (
      <span className="hidden text-white/80 lg:inline">
        Сохранено в{' '}
        {new Date(savedAt).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    )}

    <div className="ml-auto flex items-center gap-2">
      <Icon name="FileText" size={13} />
      <Icon name="BookOpen" size={13} />
      <Icon name="Monitor" size={13} />
      <button
        type="button"
        onClick={() => onZoom(Math.max(50, zoom - 10))}
        className="px-1 hover:bg-white/20"
        aria-label="Уменьшить масштаб"
      >
        <Icon name="Minus" size={12} />
      </button>
      <input
        type="range"
        min={50}
        max={200}
        step={10}
        value={zoom}
        onChange={(e) => onZoom(Number(e.target.value))}
        className="h-1 w-24 cursor-pointer accent-white"
      />
      <button
        type="button"
        onClick={() => onZoom(Math.min(200, zoom + 10))}
        className="px-1 hover:bg-white/20"
        aria-label="Увеличить масштаб"
      >
        <Icon name="Plus" size={12} />
      </button>
      <span className="w-10 text-right">{zoom} %</span>
    </div>
  </div>
);

export default StatusBar;
