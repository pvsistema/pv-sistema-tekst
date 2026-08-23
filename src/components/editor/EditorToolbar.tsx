import Icon from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const FONTS = [
  { label: 'IBM Plex Sans', value: "'IBM Plex Sans', sans-serif" },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Times New Roman', value: "'Times New Roman', serif" },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier New', value: "'Courier New', monospace" },
];

const SIZES = ['10', '12', '14', '16', '18', '24', '32'];

export interface ToolbarProps {
  onCommand: (command: string, value?: string) => void;
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onExportHtml: () => void;
  onExportDoc: () => void;
  onPrint: () => void;
  onInsertTable: () => void;
  onInsertImage: () => void;
  onFind: () => void;
  fontFamily: string;
  fontSize: string;
  onFontFamily: (v: string) => void;
  onFontSize: (v: string) => void;
}

const TButton = ({
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
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className="rounded-sm p-1.5 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
  >
    <Icon name={icon} size={16} />
  </button>
);

const EditorToolbar = (props: ToolbarProps) => {
  const {
    onCommand,
    onNew,
    onOpen,
    onSave,
    onExportHtml,
    onExportDoc,
    onPrint,
    onInsertTable,
    onInsertImage,
    onFind,
    fontFamily,
    fontSize,
    onFontFamily,
    onFontSize,
  } = props;

  return (
    <div className="border-b border-border bg-card">
      {/* строка меню */}
      <div className="flex items-center gap-1 border-b border-border px-3 py-1">
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-sm px-2.5 py-1 text-[0.82rem] transition-colors hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent">
            Файл
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={onNew}>
              <Icon name="FilePlus" size={15} className="mr-2" /> Создать
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpen}>
              <Icon name="FolderOpen" size={15} className="mr-2" /> Открыть…
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSave}>
              <Icon name="Save" size={15} className="mr-2" /> Сохранить
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExportHtml}>
              <Icon name="Download" size={15} className="mr-2" /> Экспорт в HTML
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportDoc}>
              <Icon name="Download" size={15} className="mr-2" /> Экспорт в DOC
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPrint}>
              <Icon name="Printer" size={15} className="mr-2" /> Печать / PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-sm px-2.5 py-1 text-[0.82rem] transition-colors hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent">
            Правка
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => onCommand('undo')}>
              <Icon name="Undo2" size={15} className="mr-2" /> Отменить
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCommand('redo')}>
              <Icon name="Redo2" size={15} className="mr-2" /> Повторить
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onFind}>
              <Icon name="Search" size={15} className="mr-2" /> Поиск и замена
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCommand('selectAll')}>
              <Icon name="TextSelect" size={15} className="mr-2" /> Выделить всё
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-sm px-2.5 py-1 text-[0.82rem] transition-colors hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent">
            Вставка
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={onInsertTable}>
              <Icon name="Table" size={15} className="mr-2" /> Таблица
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onInsertImage}>
              <Icon name="Image" size={15} className="mr-2" /> Изображение
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCommand('insertHorizontalRule')}>
              <Icon name="Minus" size={15} className="mr-2" /> Разделитель
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* панель форматирования */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2">
        <Select value={fontFamily} onValueChange={onFontFamily}>
          <SelectTrigger className="h-8 w-[168px] text-[0.82rem]">
            <SelectValue placeholder="Шрифт" />
          </SelectTrigger>
          <SelectContent>
            {FONTS.map((f) => (
              <SelectItem
                key={f.value}
                value={f.value}
                style={{ fontFamily: f.value }}
              >
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={fontSize} onValueChange={onFontSize}>
          <SelectTrigger className="h-8 w-[76px] text-[0.82rem]">
            <SelectValue placeholder="Кегль" />
          </SelectTrigger>
          <SelectContent>
            {SIZES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <TButton icon="Bold" title="Жирный" onClick={() => onCommand('bold')} />
        <TButton
          icon="Italic"
          title="Курсив"
          onClick={() => onCommand('italic')}
        />
        <TButton
          icon="Underline"
          title="Подчёркнутый"
          onClick={() => onCommand('underline')}
        />
        <TButton
          icon="Strikethrough"
          title="Зачёркнутый"
          onClick={() => onCommand('strikeThrough')}
        />

        <Separator orientation="vertical" className="mx-1 h-6" />

        <TButton
          icon="AlignLeft"
          title="По левому краю"
          onClick={() => onCommand('justifyLeft')}
        />
        <TButton
          icon="AlignCenter"
          title="По центру"
          onClick={() => onCommand('justifyCenter')}
        />
        <TButton
          icon="AlignRight"
          title="По правому краю"
          onClick={() => onCommand('justifyRight')}
        />
        <TButton
          icon="AlignJustify"
          title="По ширине"
          onClick={() => onCommand('justifyFull')}
        />

        <Separator orientation="vertical" className="mx-1 h-6" />

        <TButton
          icon="List"
          title="Маркированный список"
          onClick={() => onCommand('insertUnorderedList')}
        />
        <TButton
          icon="ListOrdered"
          title="Нумерованный список"
          onClick={() => onCommand('insertOrderedList')}
        />
        <TButton
          icon="IndentIncrease"
          title="Увеличить отступ"
          onClick={() => onCommand('indent')}
        />
        <TButton
          icon="IndentDecrease"
          title="Уменьшить отступ"
          onClick={() => onCommand('outdent')}
        />

        <Separator orientation="vertical" className="mx-1 h-6" />

        <TButton icon="Table" title="Таблица" onClick={onInsertTable} />
        <TButton icon="Image" title="Изображение" onClick={onInsertImage} />
        <TButton icon="Search" title="Поиск и замена" onClick={onFind} />

        <Separator orientation="vertical" className="mx-1 h-6" />

        <TButton
          icon="Undo2"
          title="Отменить"
          onClick={() => onCommand('undo')}
        />
        <TButton
          icon="Redo2"
          title="Повторить"
          onClick={() => onCommand('redo')}
        />
        <TButton
          icon="Eraser"
          title="Очистить форматирование"
          onClick={() => onCommand('removeFormat')}
        />
      </div>
    </div>
  );
};

export default EditorToolbar;
