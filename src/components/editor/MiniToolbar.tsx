import { useLayoutEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/icon';

export interface MiniPosition {
  x: number;
  y: number;
}

interface Props {
  at: MiniPosition | null;
  fontFamily: string;
  fontSize: string;
  onCommand: (command: string, value?: string) => void;
  onFontFamily: (v: string) => void;
  onFontSize: (v: string) => void;
  onHighlight: () => void;
  onStyle: () => void;
}

const FONTS = [
  'Times New Roman',
  'Calibri',
  'Arial',
  'Georgia',
  'Courier New',
  'Verdana',
];

const SIZES = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28'];

/** Панель, всплывающая рядом с выделенным текстом */
const MiniToolbar = (p: Props) => {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (!p.at || !box.current) return;

    const rect = box.current.getBoundingClientRect();

    setPos({
      x: Math.max(8, Math.min(p.at.x - rect.width / 2, window.innerWidth - rect.width - 8)),
      y: Math.max(8, p.at.y - rect.height - 8),
    });
  }, [p.at]);

  if (!p.at) return null;

  const Btn = ({
    icon,
    title,
    onClick,
  }: {
    icon: string;
    title: string;
    onClick: () => void;
  }) => (
    <button
      type="button"
      title={title}
      /* не даём выделению пропасть при нажатии */
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex h-[24px] w-[24px] items-center justify-center rounded-[2px] hover:bg-[hsl(var(--win-hover))]"
    >
      <Icon name={icon} size={14} />
    </button>
  );

  const select =
    'h-[22px] rounded-[2px] border border-[hsl(var(--win-ribbon-border))] bg-white px-1 text-[11px] outline-none';

  return (
    <div
      ref={box}
      className="fixed z-[125] flex items-center gap-[1px] rounded-[3px] border border-[hsl(var(--win-ribbon-border))] bg-white px-1 py-[3px] shadow-lg"
      style={{ left: pos.x, top: pos.y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <select
        value={p.fontFamily}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => p.onFontFamily(e.target.value)}
        className={`${select} w-[96px]`}
      >
        {FONTS.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      <select
        value={p.fontSize}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => p.onFontSize(e.target.value)}
        className={`${select} w-[42px]`}
      >
        {SIZES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <span className="mx-[2px] h-[18px] w-px bg-[hsl(var(--win-ribbon-border))]" />

      <Btn icon="Bold" title="Полужирный" onClick={() => p.onCommand('bold')} />
      <Btn icon="Italic" title="Курсив" onClick={() => p.onCommand('italic')} />
      <Btn
        icon="Underline"
        title="Подчёркнутый"
        onClick={() => p.onCommand('underline')}
      />
      <Btn icon="Highlighter" title="Цвет выделения" onClick={p.onHighlight} />

      <span className="mx-[2px] h-[18px] w-px bg-[hsl(var(--win-ribbon-border))]" />

      <Btn
        icon="AlignLeft"
        title="По левому краю"
        onClick={() => p.onCommand('justifyLeft')}
      />
      <Btn
        icon="AlignCenter"
        title="По центру"
        onClick={() => p.onCommand('justifyCenter')}
      />
      <Btn
        icon="AlignRight"
        title="По правому краю"
        onClick={() => p.onCommand('justifyRight')}
      />

      <span className="mx-[2px] h-[18px] w-px bg-[hsl(var(--win-ribbon-border))]" />

      <Btn
        icon="List"
        title="Маркированный список"
        onClick={() => p.onCommand('insertUnorderedList')}
      />
      <Btn
        icon="ListOrdered"
        title="Нумерованный список"
        onClick={() => p.onCommand('insertOrderedList')}
      />
      <Btn icon="Paintbrush" title="Стили" onClick={p.onStyle} />
    </div>
  );
};

export default MiniToolbar;
