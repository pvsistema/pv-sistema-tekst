import Icon from '@/components/ui/icon';

interface Props {
  title: string;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

const QuickBtn = ({
  icon,
  title,
  onClick,
}: {
  icon: string;
  title: string;
  onClick?: () => void;
}) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className="flex h-6 w-6 items-center justify-center rounded-[2px] opacity-90 transition-colors hover:bg-black/10"
  >
    <Icon name={icon} size={14} />
  </button>
);

const WindowTitleBar = ({ title, onSave, onUndo, onRedo }: Props) => (
  <div
    className="flex h-8 shrink-0 items-center px-1.5"
    style={{
      background: 'hsl(var(--win-title))',
      color: 'hsl(var(--win-title-text))',
    }}
  >
    <div className="flex items-center gap-0.5">
      <QuickBtn icon="Save" title="Сохранить" onClick={onSave} />
      <QuickBtn icon="Undo2" title="Отменить" onClick={onUndo} />
      <QuickBtn icon="Redo2" title="Повторить" onClick={onRedo} />
      <QuickBtn icon="Menu" title="Настройка панели быстрого доступа" />
      <QuickBtn icon="ChevronDown" title="Ещё" />
    </div>

    <div className="flex-1 truncate px-3 text-center text-[12px]">
      {title || 'Документ1'} — ПВ-Система Текст
    </div>

    <div className="flex items-center gap-0.5">
      <button
        type="button"
        className="mr-1 rounded-[2px] border border-white/60 px-2 py-[1px] text-[11px] transition-colors hover:bg-white/20"
      >
        Вход
      </button>
      <QuickBtn icon="LayoutTemplate" title="Параметры отображения ленты" />
      <QuickBtn icon="Minus" title="Свернуть" />
      <QuickBtn icon="Square" title="Развернуть" />
      <QuickBtn icon="X" title="Закрыть" />
    </div>
  </div>
);

export default WindowTitleBar;