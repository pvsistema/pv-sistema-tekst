import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import type { PasteMode } from '@/lib/clipboard';
import { PASTE_MODES } from '@/lib/clipboard';

export interface ContextTarget {
  x: number;
  y: number;
  /** Есть ли выделенный текст */
  hasSelection: boolean;
  /** Курсор внутри таблицы */
  inTable: boolean;
  /** Слово под курсором — для подсказки правописания */
  word?: string;
}

interface Props {
  target: ContextTarget | null;
  onClose: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: (mode: PasteMode) => void;
  onFontDialog: () => void;
  onParaDialog: () => void;
  onInsertRow?: () => void;
  onInsertColumn?: () => void;
  onDeleteRow?: () => void;
  onDeleteColumn?: () => void;
  onLink?: () => void;
  onComment?: () => void;
  onSelectAll: () => void;
}

interface Item {
  id: string;
  label: string;
  icon?: string;
  hint?: string;
  disabled?: boolean;
  run?: () => void;
  /** Вложенное меню */
  children?: Item[];
  separator?: boolean;
}

/** Меню по правой кнопке мыши в документе */
const DocumentContextMenu = (p: Props) => {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [openSub, setOpenSub] = useState<string | null>(null);

  const t = p.target;

  /* держим меню в пределах окна */
  useLayoutEffect(() => {
    if (!t || !box.current) return;

    const rect = box.current.getBoundingClientRect();

    setPos({
      x: Math.min(t.x, window.innerWidth - rect.width - 8),
      y: Math.min(t.y, window.innerHeight - rect.height - 8),
    });
  }, [t]);

  useEffect(() => {
    if (!t) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') p.onClose();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [t, p]);

  if (!t) return null;

  const items: Item[] = [
    {
      id: 'cut',
      label: 'Вырезать',
      icon: 'Scissors',
      hint: 'Ctrl+X',
      disabled: !t.hasSelection,
      run: p.onCut,
    },
    {
      id: 'copy',
      label: 'Копировать',
      icon: 'Copy',
      hint: 'Ctrl+C',
      disabled: !t.hasSelection,
      run: p.onCopy,
    },
    {
      id: 'paste',
      label: 'Параметры вставки',
      icon: 'ClipboardPaste',
      children: PASTE_MODES.map((m) => ({
        id: `paste-${m.value}`,
        label: m.label,
        icon: m.icon,
        hint: m.hint,
        run: () => p.onPaste(m.value as PasteMode),
      })),
    },
    { id: 's1', label: '', separator: true },
    {
      id: 'font',
      label: 'Шрифт…',
      icon: 'Type',
      run: p.onFontDialog,
    },
    {
      id: 'para',
      label: 'Абзац…',
      icon: 'AlignLeft',
      run: p.onParaDialog,
    },
  ];

  if (t.inTable) {
    items.push(
      { id: 's2', label: '', separator: true },
      {
        id: 'table',
        label: 'Таблица',
        icon: 'Table',
        children: [
          {
            id: 'row',
            label: 'Вставить строку',
            icon: 'Rows3',
            run: p.onInsertRow,
          },
          {
            id: 'col',
            label: 'Вставить столбец',
            icon: 'Columns3',
            run: p.onInsertColumn,
          },
          {
            id: 'delrow',
            label: 'Удалить строку',
            icon: 'Trash2',
            run: p.onDeleteRow,
          },
          {
            id: 'delcol',
            label: 'Удалить столбец',
            icon: 'Trash2',
            run: p.onDeleteColumn,
          },
        ],
      },
    );
  }

  items.push(
    { id: 's3', label: '', separator: true },
    {
      id: 'link',
      label: 'Гиперссылка…',
      icon: 'Link',
      run: p.onLink,
    },
    {
      id: 'comment',
      label: 'Создать примечание',
      icon: 'MessageSquare',
      run: p.onComment,
    },
    { id: 's4', label: '', separator: true },
    {
      id: 'all',
      label: 'Выделить всё',
      icon: 'TextSelect',
      hint: 'Ctrl+A',
      run: p.onSelectAll,
    },
  );

  const Row = ({ item }: { item: Item }) => {
    if (item.separator)
      return <div className="my-1 h-px bg-[hsl(0_0%_88%)]" />;

    const hasKids = !!item.children?.length;

    return (
      <div
        className="relative"
        onMouseEnter={() => setOpenSub(hasKids ? item.id : null)}
      >
        <button
          type="button"
          disabled={item.disabled}
          onClick={() => {
            if (hasKids) return;
            item.run?.();
            p.onClose();
          }}
          className="flex w-full items-center gap-2.5 rounded-[2px] px-2 py-[5px] text-left text-[12px] text-[hsl(0_0%_20%)] hover:bg-[hsl(var(--win-hover))] disabled:text-[hsl(0_0%_70%)] disabled:hover:bg-transparent"
        >
          {item.icon ? (
            <Icon name={item.icon} size={14} className="shrink-0" />
          ) : (
            <span className="w-[14px]" />
          )}
          <span className="flex-1 truncate">{item.label}</span>
          {item.hint && !hasKids && (
            <span className="text-[10px] text-[hsl(0_0%_60%)]">
              {item.hint}
            </span>
          )}
          {hasKids && <Icon name="ChevronRight" size={12} />}
        </button>

        {hasKids && openSub === item.id && (
          <div className="absolute left-full top-0 z-10 ml-[1px] w-[248px] rounded-[3px] border border-[hsl(var(--win-ribbon-border))] bg-white p-1 shadow-xl">
            {item.children?.map((kid) => (
              <button
                key={kid.id}
                type="button"
                onClick={() => {
                  kid.run?.();
                  p.onClose();
                }}
                className="flex w-full items-start gap-2.5 rounded-[2px] px-2 py-[5px] text-left hover:bg-[hsl(var(--win-hover))]"
              >
                {kid.icon && (
                  <Icon
                    name={kid.icon}
                    size={14}
                    className="mt-[2px] shrink-0"
                  />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] text-[hsl(0_0%_20%)]">
                    {kid.label}
                  </span>
                  {kid.hint && (
                    <span className="block text-[10px] leading-tight text-[hsl(0_0%_55%)]">
                      {kid.hint}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[130]"
        onMouseDown={p.onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          p.onClose();
        }}
      />
      <div
        ref={box}
        className="fixed z-[131] w-[228px] rounded-[3px] border border-[hsl(var(--win-ribbon-border))] bg-white p-1 shadow-xl"
        style={{ left: pos.x, top: pos.y }}
        onMouseLeave={() => setOpenSub(null)}
      >
        {items.map((item) => (
          <Row key={item.id} item={item} />
        ))}
      </div>
    </>
  );
};

export default DocumentContextMenu;
