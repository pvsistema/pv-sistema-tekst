import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';

export const RibbonGroup = ({
  title,
  children,
  onDialog,
}: {
  title: string;
  children: React.ReactNode;
  /** Уголок справа от названия группы открывает подробное окно настроек */
  onDialog?: () => void;
}) => (
  <div className="win-group">
    <div className="flex flex-1 items-center gap-1">{children}</div>
    <div className="win-group-title flex items-center justify-center gap-1">
      <span>{title}</span>
      {onDialog && (
        <button
          type="button"
          title={`${title}: окно настроек`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={onDialog}
          className="flex h-[13px] w-[13px] items-center justify-center rounded-[2px] hover:bg-[hsl(var(--win-hover))]"
        >
          <Icon name="CornerDownRight" size={9} />
        </button>
      )}
    </div>
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

/** Большая кнопка ленты: значок сверху, подпись в 1-2 строки, стрелка раскрытия */
export const BigCmd = ({
  icon,
  lines,
  caret,
  onClick,
  width = 56,
  glyph,
  disabled,
}: {
  icon?: string;
  lines: string[];
  caret?: boolean;
  onClick?: () => void;
  width?: number;
  glyph?: string;
  disabled?: boolean;
}) => (
  <button
    type="button"
    title={lines.join(' ')}
    disabled={disabled}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className={`win-btn h-[68px] shrink-0 flex-col justify-start gap-[3px] px-1 pt-1 ${
      disabled ? 'pointer-events-none opacity-40' : ''
    }`}
    style={{ width }}
  >
    {glyph ? (
      <span className="flex h-[26px] items-center text-[22px] leading-none">
        {glyph}
      </span>
    ) : (
      <Icon name={icon ?? 'Square'} size={24} className="text-[hsl(215_60%_38%)]" />
    )}
    <span className="flex flex-col items-center text-[10px] leading-[1.15]">
      {lines.map((l, i) => (
        <span key={i}>{l}</span>
      ))}
      {caret && <Icon name="ChevronDown" size={9} className="mt-[1px]" />}
    </span>
  </button>
);

/** Маленькая кнопка ленты со значком и подписью в строку */
export const SmallCmd = ({
  icon,
  label,
  caret,
  onClick,
  glyph,
  disabled,
}: {
  icon?: string;
  label: string;
  caret?: boolean;
  onClick?: () => void;
  glyph?: string;
  disabled?: boolean;
}) => (
  <button
    type="button"
    title={label}
    disabled={disabled}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className={`win-btn h-[20px] w-full shrink-0 justify-start gap-1.5 whitespace-nowrap px-1 ${
      disabled ? 'pointer-events-none opacity-40' : ''
    }`}
  >
    {glyph ? (
      <span className="w-[15px] shrink-0 text-center text-[12px] leading-none">
        {glyph}
      </span>
    ) : (
      <Icon
        name={icon ?? 'Square'}
        size={14}
        className="shrink-0 text-[hsl(215_60%_38%)]"
      />
    )}
    <span className="text-[11px] leading-none">{label}</span>
    {caret && <Icon name="ChevronDown" size={9} className="ml-auto shrink-0" />}
  </button>
);

/** Колонка маленьких кнопок фиксированной ширины */
export const Stack = ({
  children,
  width = 132,
}: {
  children: React.ReactNode;
  width?: number;
}) => (
  <div
    className="flex shrink-0 flex-col justify-center gap-[2px]"
    style={{ width }}
  >
    {children}
  </div>
);

/** Поле со счётчиком, как в группе «Абзац» вкладки «Макет» */
export const SpinBox = ({
  icon,
  label,
  value,
  onChange,
  step = 0.5,
  suffix,
}: {
  icon: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  suffix: string;
}) => (
  <div className="flex items-center gap-1">
    <Icon name={icon} size={13} className="shrink-0 text-[hsl(215_60%_38%)]" />
    <span className="w-[46px] shrink-0 text-[11px] leading-none">{label}</span>
    <div className="flex h-[20px] items-center rounded-[2px] border border-[hsl(var(--win-ribbon-border))] bg-white">
      <input
        value={`${value} ${suffix}`}
        readOnly
        className="h-full w-[52px] bg-transparent px-1 text-[11px] outline-none"
      />
      <div className="flex h-full flex-col border-l border-[hsl(var(--win-ribbon-border))]">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onChange(Number((value + step).toFixed(2)))}
          className="flex h-1/2 w-[14px] items-center justify-center hover:bg-[hsl(var(--win-hover))]"
        >
          <Icon name="ChevronUp" size={9} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onChange(Math.max(0, Number((value - step).toFixed(2))))}
          className="flex h-1/2 w-[14px] items-center justify-center hover:bg-[hsl(var(--win-hover))]"
        >
          <Icon name="ChevronDown" size={9} />
        </button>
      </div>
    </div>
  </div>
);

/** Кнопка ленты с выпадающим списком команд */
export const Menu = ({
  icon,
  title,
  items,
  active,
  label,
  width = 210,
}: {
  icon: string;
  title: string;
  /** Подпись рядом со значком — для кнопок в столбце */
  label?: string;
  items: {
    label: string;
    run: () => void;
    hint?: string;
    /** Заголовок группы перед пунктом — как в меню «Разрывы» */
    group?: string;
  }[];
  active?: boolean;
  width?: number;
}) => {
  const [open, setOpen] = useState(false);

  /* клик мимо меню закрывает его */
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
      <button
        type="button"
        title={title}
        data-active={active ? 'true' : 'false'}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        className={`win-btn h-[22px] gap-0.5 px-1 ${
          label ? 'w-full justify-start' : ''
        }`}
      >
        <Icon name={icon} size={15} />
        {label && (
          <span className="ml-1 flex-1 text-left text-[11px] leading-none">
            {label}
          </span>
        )}
        <Icon name="ChevronDown" size={9} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-[2px] rounded-[3px] border border-[hsl(var(--win-ribbon-border))] bg-white py-1 shadow-lg"
          style={{ width }}
        >
          {items.map((it) => (
            <div key={it.label}>
              {it.group && (
                <p className="mt-1 border-t border-[hsl(var(--win-ribbon-border))] px-3 pb-[2px] pt-1.5 text-[10px] font-semibold uppercase text-slate-500">
                  {it.group}
                </p>
              )}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setOpen(false);
                  it.run();
                }}
                className="flex w-full flex-col items-start px-3 py-[5px] text-left text-[12px] hover:bg-[hsl(var(--win-hover))]"
              >
                <span>{it.label}</span>
                {it.hint && (
                  <span className="text-[10px] leading-tight text-slate-500">
                    {it.hint}
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Кнопка с раздельными половинами: слева действие, справа стрелка
 * с дополнительными вариантами — так устроены списки в Word.
 */
export const SplitBtn = ({
  icon,
  title,
  onClick,
  active,
  children,
  width = 190,
}: {
  icon: string;
  title: string;
  onClick: () => void;
  active?: boolean;
  /** Содержимое выпадающей части */
  children: (close: () => void) => React.ReactNode;
  width?: number;
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="relative flex" onMouseDown={(e) => e.stopPropagation()}>
      <button
        type="button"
        title={title}
        data-active={active ? 'true' : 'false'}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        className="win-btn h-[22px] rounded-r-none px-1"
      >
        <Icon name={icon} size={15} />
      </button>
      <button
        type="button"
        title={`${title}: варианты`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        className="win-btn h-[22px] rounded-l-none px-0"
      >
        <Icon name="ChevronDown" size={9} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-[2px] rounded-[3px] border border-[hsl(var(--win-ribbon-border))] bg-white p-2 shadow-lg"
          style={{ width }}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
};

export const VStack = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col gap-[2px]">{children}</div>
);

export const Row = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-[2px]">{children}</div>
);