import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/ui/icon';

/** Цвета темы — верхний ряд палитры, как в Word */
const THEME_COLORS = [
  '#ffffff',
  '#000000',
  '#e7e6e6',
  '#44546a',
  '#4472c4',
  '#ed7d31',
  '#a5a5a5',
  '#ffc000',
  '#5b9bd5',
  '#70ad47',
];

/** Оттенки каждого цвета темы: светлее сверху, темнее снизу */
const THEME_SHADES = [
  ['#f2f2f2', '#d9d9d9', '#bfbfbf', '#a6a6a6', '#808080'],
  ['#808080', '#595959', '#404040', '#262626', '#0d0d0d'],
  ['#d0cece', '#aeaaaa', '#767171', '#3b3838', '#161616'],
  ['#d6dce5', '#acb9ca', '#8496b0', '#333f50', '#222a35'],
  ['#d9e2f3', '#b4c7e7', '#8faadc', '#2f5597', '#1f3864'],
  ['#fbe5d6', '#f8cbad', '#f4b183', '#c55a11', '#833c0c'],
  ['#ededed', '#dbdbdb', '#c9c9c9', '#7b7b7b', '#525252'],
  ['#fff2cc', '#ffe599', '#ffd966', '#bf9000', '#7f6000'],
  ['#ddebf7', '#bdd7ee', '#9dc3e6', '#2e75b6', '#1f4e79'],
  ['#e2efda', '#c6e0b4', '#a9d18e', '#548235', '#375623'],
];

/** Стандартные цвета — отдельный ряд под цветами темы */
const STANDARD_COLORS = [
  '#c00000',
  '#ff0000',
  '#ffc000',
  '#ffff00',
  '#92d050',
  '#00b050',
  '#00b0f0',
  '#0070c0',
  '#002060',
  '#7030a0',
];

interface Props {
  /** Значок кнопки */
  icon: string;
  title: string;
  /** Цвет полоски под значком — показывает текущий выбор */
  value: string;
  onChange: (color: string) => void;
  /** Подпись пункта сброса: «Нет цвета» для заливки, «Авто» для текста */
  resetLabel?: string;
  resetValue?: string;
}

const Swatch = ({
  color,
  onPick,
}: {
  color: string;
  onPick: (c: string) => void;
}) => (
  <button
    type="button"
    title={color.toUpperCase()}
    onMouseDown={(e) => e.preventDefault()}
    onClick={() => onPick(color)}
    className="h-[14px] w-[14px] border border-[hsl(0_0%_72%)] hover:outline hover:outline-1 hover:outline-[hsl(var(--win-title))]"
    style={{ background: color }}
  />
);

/**
 * Выбор цвета сеткой цветов темы и стандартных цветов — как в Word,
 * вместо системного окна браузера.
 */
const ColorPicker = ({
  icon,
  title,
  value,
  onChange,
  resetLabel = 'Нет цвета',
  resetValue = 'transparent',
}: Props) => {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  /* палитру рисуем поверх страницы — лента обрезает выпадающие списки */
  const anchor = btn.current?.getBoundingClientRect();

  useEffect(() => {
    if (!open) return;

    const close = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };

    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [open]);

  const pick = (color: string) => {
    setOpen(false);
    onChange(color);
  };

  return (
    <div ref={box} className="relative flex">
      {/* левая половина применяет текущий цвет, правая открывает палитру */}
      <button
        type="button"
        title={title}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onChange(value)}
        className="win-btn h-[22px] flex-col gap-0 rounded-r-none px-1"
      >
        <Icon name={icon} size={13} />
        <span
          className="h-[3px] w-[13px] border border-[hsl(0_0%_72%)]"
          style={{ background: value }}
        />
      </button>

      <button
        ref={btn}
        type="button"
        title={`${title}: выбрать цвет`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        className="win-btn h-[22px] rounded-l-none px-0"
      >
        <Icon name="ChevronDown" size={9} />
      </button>

      {open &&
        anchor &&
        createPortal(
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="fixed z-[122] w-[186px] rounded-[3px] border border-[hsl(var(--win-ribbon-border))] bg-white p-2 shadow-xl"
            style={{
              top: anchor.bottom + 2,
              left: Math.min(anchor.left, window.innerWidth - 196),
            }}
          >
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => pick(resetValue)}
            className="mb-1.5 flex w-full items-center gap-1.5 rounded-[2px] px-1 py-[2px] text-[11px] hover:bg-[hsl(var(--win-hover))]"
          >
            <span className="relative h-[13px] w-[13px] border border-[hsl(0_0%_72%)] bg-white">
              <span className="absolute left-1/2 top-1/2 h-[15px] w-[1px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[hsl(0_70%_50%)]" />
            </span>
            {resetLabel}
          </button>

          <p className="mb-1 text-[10px] text-slate-500">Цвета темы</p>
          <div className="flex gap-[2px]">
            {THEME_COLORS.map((c, i) => (
              <div key={c} className="flex flex-col gap-[2px]">
                <Swatch color={c} onPick={pick} />
                {THEME_SHADES[i].map((sh) => (
                  <Swatch key={sh} color={sh} onPick={pick} />
                ))}
              </div>
            ))}
          </div>

          <p className="mb-1 mt-2 text-[10px] text-slate-500">
            Стандартные цвета
          </p>
          <div className="flex gap-[2px]">
            {STANDARD_COLORS.map((c) => (
              <Swatch key={c} color={c} onPick={pick} />
            ))}
          </div>

          {/* свой цвет — на случай, если нужного в палитре нет */}
          <label className="mt-2 flex cursor-pointer items-center gap-1.5 rounded-[2px] px-1 py-[2px] text-[11px] hover:bg-[hsl(var(--win-hover))]">
            <Icon name="Pipette" size={12} />
            Другие цвета…
            <input
              type="color"
              value={value === 'transparent' ? '#000000' : value}
              onChange={(e) => pick(e.target.value)}
              className="h-0 w-0 opacity-0"
            />
          </label>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default ColorPicker;
