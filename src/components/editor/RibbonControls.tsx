import Icon from '@/components/ui/icon';

export const RibbonGroup = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="win-group">
    <div className="flex flex-1 items-center gap-1">{children}</div>
    <div className="win-group-title">{title}</div>
  </div>
);

export const SmallBtn = ({
  icon,
  title,
  onClick,
  active,
  label,
}: {
  icon: string;
  title: string;
  onClick?: () => void;
  active?: boolean;
  label?: string;
}) => (
  <button
    type="button"
    title={title}
    data-active={active ? 'true' : 'false'}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className="win-btn h-[22px] gap-1 px-1"
  >
    <Icon name={icon} size={15} />
    {label && <span className="text-[11px] leading-none">{label}</span>}
  </button>
);

export const BigBtn = ({
  icon,
  label,
  title,
  onClick,
}: {
  icon: string;
  label: string;
  title?: string;
  onClick?: () => void;
}) => (
  <button
    type="button"
    title={title ?? label}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className="win-btn h-[58px] w-[54px] flex-col gap-1 px-1"
  >
    <Icon name={icon} size={26} />
    <span className="text-center text-[10px] leading-[1.1]">{label}</span>
  </button>
);

export const VStack = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col gap-[2px]">{children}</div>
);

export const Row = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-[2px]">{children}</div>
);
