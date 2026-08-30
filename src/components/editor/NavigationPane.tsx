import { useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';

interface Props {
  getHeadings: () => { id: string; text: string; level: number }[];
  onGo: (id: string) => void;
  onClose: () => void;
  refreshKey: number;
}

/** Левая панель «Область навигации» со списком заголовков документа */
const NavigationPane = ({ getHeadings, onGo, onClose, refreshKey }: Props) => {
  const [query, setQuery] = useState('');
  const heads = useMemo(() => getHeadings(), [getHeadings, refreshKey]);

  const shown = query
    ? heads.filter((h) => h.text.toLowerCase().includes(query.toLowerCase()))
    : heads;

  return (
    <div className="flex w-[230px] shrink-0 flex-col border-r border-[hsl(var(--win-ribbon-border))] bg-white">
      <div className="flex items-center justify-between px-2 py-[6px]">
        <span className="text-[13px] font-semibold text-[hsl(0_0%_25%)]">
          Навигация
        </span>
        <button
          type="button"
          onClick={onClose}
          title="Закрыть"
          className="text-[hsl(0_0%_45%)] hover:text-[hsl(0_0%_10%)]"
        >
          <Icon name="X" size={14} />
        </button>
      </div>

      <div className="px-2 pb-2">
        <div className="flex h-[24px] items-center rounded-[2px] border border-[hsl(var(--win-ribbon-border))] px-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск в документе"
            className="h-full flex-1 bg-transparent text-[12px] outline-none"
          />
          <Icon name="Search" size={13} className="text-[hsl(0_0%_50%)]" />
        </div>
      </div>

      <div className="flex gap-3 border-b border-[hsl(var(--win-ribbon-border))] px-2 text-[12px]">
        <span className="border-b-2 border-[hsl(var(--win-title))] pb-1 font-semibold text-[hsl(0_0%_20%)]">
          Заголовки
        </span>
      </div>

      <div className="flex-1 overflow-auto py-1">
        {shown.map((h) => (
          <button
            key={h.id}
            type="button"
            onClick={() => onGo(h.id)}
            className="block w-full truncate px-2 py-[4px] text-left text-[12px] hover:bg-[hsl(var(--win-hover))]"
            style={{ paddingLeft: 8 + (h.level - 1) * 12 }}
          >
            {h.text}
          </button>
        ))}
        {!shown.length && (
          <div className="px-2 py-3 text-[12px] leading-snug text-[hsl(0_0%_45%)]">
            {query
              ? 'Ничего не найдено'
              : 'Заголовков нет. Примените стиль «Заголовок» к тексту.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationPane;
