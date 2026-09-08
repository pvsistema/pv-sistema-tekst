import { useState } from 'react';
import Icon from '@/components/ui/icon';
import type { ShapeKind } from '@/lib/shapes';
import {
  SHAPE_GROUPS,
  WORDART_STYLES as WORDART_LIST,
  shapeClip,
} from '@/lib/shapes';

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (kind: ShapeKind) => void;
}

/** Маленький значок фигуры для галереи */
const Thumb = ({ kind }: { kind: ShapeKind }) => {
  const clip = shapeClip(kind);

  if (kind === 'line') {
    return <span className="block h-[2px] w-[18px] bg-[hsl(var(--win-title))]" />;
  }

  return (
    <span
      className="block h-[18px] w-[18px] bg-[hsl(var(--win-title))]"
      style={{
        clipPath: clip || undefined,
        borderRadius: kind === 'ellipse' ? '50%' : kind === 'round' ? 4 : 0,
      }}
    />
  );
};

/** Галерея фигур — раскрывается под кнопкой «Фигуры» */
const ShapesGallery = ({ open, onClose, onPick }: Props) => {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[110]" onMouseDown={onClose} />
      <div
        className="fixed left-1/2 top-[150px] z-[111] w-[300px] -translate-x-1/2 rounded-[3px] border border-[hsl(var(--win-ribbon-border))] bg-white p-2 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {SHAPE_GROUPS.map((group) => (
          <div key={group.title} className="mb-2 last:mb-0">
            <p className="mb-1 px-1 text-[11px] font-semibold text-slate-500">
              {group.title}
            </p>
            <div className="flex flex-wrap gap-[2px]">
              {group.items.map((item) => (
                <button
                  key={item.kind}
                  type="button"
                  title={item.label}
                  onClick={() => {
                    onPick(item.kind);
                    onClose();
                  }}
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-[2px] border border-transparent hover:border-[hsl(var(--win-title))] hover:bg-[hsl(var(--win-hover))]"
                >
                  <Thumb kind={item.kind} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

interface ArtProps {
  open: boolean;
  onClose: () => void;
  onPick: (text: string, css: string, size: number) => void;
}

/** Выбор начертания фигурного текста */
export const WordArtGallery = ({ open, onClose, onPick }: ArtProps) => {
  const [text, setText] = useState('Заголовок');
  const [size, setSize] = useState(34);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[112] flex items-center justify-center bg-slate-900/30"
      onMouseDown={onClose}
    >
      <div
        className="w-[440px] rounded-md bg-[hsl(var(--win-ribbon))] shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          className="flex h-8 items-center justify-between px-3 text-[12px]"
          style={{
            background: 'hsl(var(--win-title))',
            color: 'hsl(var(--win-title-text))',
          }}
        >
          <span>Фигурный текст</span>
          <button type="button" onClick={onClose} className="px-1">
            ✕
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <p className="mb-1 text-[11px] text-slate-600">Текст</p>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="h-[26px] w-full rounded-[2px] border border-slate-300 bg-white px-1.5 text-[12px] outline-none focus:border-primary"
              />
            </div>
            <div className="w-[80px]">
              <p className="mb-1 text-[11px] text-slate-600">Размер</p>
              <input
                type="number"
                min={12}
                max={96}
                value={size}
                onChange={(e) => setSize(Number(e.target.value) || 34)}
                className="h-[26px] w-full rounded-[2px] border border-slate-300 bg-white px-1.5 text-[12px] outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <p className="mb-1 text-[11px] text-slate-600">Начертание</p>
            <div className="grid grid-cols-3 gap-1">
              {WORDART_LIST.map((w) => (
                <button
                  key={w.label}
                  type="button"
                  title={w.label}
                  onClick={() => {
                    onPick(text.trim() || 'Заголовок', w.css, size);
                    onClose();
                  }}
                  className="flex h-[54px] items-center justify-center rounded-[2px] border border-slate-300 bg-white hover:border-[hsl(var(--win-title))]"
                >
                  <span
                    className="text-[20px] font-bold"
                    style={{ fontFamily: 'Georgia, serif' }}
                    dangerouslySetInnerHTML={{
                      __html: `<span style="${w.css}">Аа</span>`,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          <p className="flex items-center gap-1 text-[10px] text-slate-500">
            <Icon name="Info" size={11} />
            После вставки объект можно перетащить и задать обтекание текстом
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShapesGallery;
