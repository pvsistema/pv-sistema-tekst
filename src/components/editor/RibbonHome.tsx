import Icon from '@/components/ui/icon';
import { RibbonGroup, SmallBtn, BigBtn, VStack, Row } from './RibbonControls';

const FONTS = [
  'Calibri (Основной)',
  'Times New Roman',
  'Arial',
  'Georgia',
  'Courier New',
  'Verdana',
];

const FONT_VALUE: Record<string, string> = {
  'Calibri (Основной)': 'Calibri, sans-serif',
  'Times New Roman': "'Times New Roman', serif",
  Arial: 'Arial, sans-serif',
  Georgia: 'Georgia, serif',
  'Courier New': "'Courier New', monospace",
  Verdana: 'Verdana, sans-serif',
};

const SIZES = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '36', '48'];

const STYLES = [
  { name: '⁋ Обычный', label: 'АаБбВвГг', cmd: 'p', css: 'text-[13px]' },
  { name: '⁋ Без инт…', label: 'АаБбВвГг', cmd: 'p', css: 'text-[13px]' },
  { name: 'Заголово…', label: 'АаБбВг', cmd: 'h2', css: 'text-[15px] text-[#2e74b5]' },
  { name: 'Заголово…', label: 'АаБбВг', cmd: 'h3', css: 'text-[14px] text-[#2e74b5]' },
  { name: 'Заголовок', label: 'Aab', cmd: 'h1', css: 'text-[20px]' },
  { name: 'Подзагол…', label: 'АаБбВвГг', cmd: 'h4', css: 'text-[13px] text-[#5a5a5a]' },
];

export interface RibbonHomeProps {
  onCommand: (command: string, value?: string) => void;
  fontFamily: string;
  fontSize: string;
  onFontFamily: (v: string) => void;
  onFontSize: (v: string) => void;
  onFind: () => void;
  onReplace: () => void;
  onPaste: () => void;
  onCopy: () => void;
  onCut: () => void;
}

const Combo = ({
  value,
  onChange,
  options,
  width,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  width: number;
}) => (
  <select
    value={value}
    onMouseDown={(e) => e.stopPropagation()}
    onChange={(e) => onChange(e.target.value)}
    style={{ width }}
    className="h-[22px] rounded-[2px] border border-[hsl(var(--win-ribbon-border))] bg-white px-1 text-[11px] text-[hsl(0_0%_15%)] outline-none focus:border-[hsl(var(--win-title))]"
  >
    {options.map((o) => (
      <option key={o} value={o}>
        {o}
      </option>
    ))}
  </select>
);

const RibbonHome = (p: RibbonHomeProps) => (
  <>
    <RibbonGroup title="Буфер обмена">
      <BigBtn icon="ClipboardPaste" label="Вставить" onClick={p.onPaste} />
      <VStack>
        <SmallBtn icon="Scissors" title="Вырезать" label="Вырезать" onClick={p.onCut} />
        <SmallBtn icon="Copy" title="Копировать" label="Копировать" onClick={p.onCopy} />
        <SmallBtn
          icon="Paintbrush"
          title="Формат по образцу"
          label="Формат по образцу"
          onClick={() => p.onCommand('removeFormat')}
        />
      </VStack>
    </RibbonGroup>

    <RibbonGroup title="Шрифт">
      <VStack>
        <Row>
          <Combo
            value={p.fontFamily}
            onChange={p.onFontFamily}
            options={FONTS}
            width={118}
          />
          <Combo value={p.fontSize} onChange={p.onFontSize} options={SIZES} width={46} />
          <SmallBtn
            icon="AArrowUp"
            title="Увеличить размер"
            onClick={() => p.onFontSize(String(Math.min(72, Number(p.fontSize) + 2)))}
          />
          <SmallBtn
            icon="AArrowDown"
            title="Уменьшить размер"
            onClick={() => p.onFontSize(String(Math.max(8, Number(p.fontSize) - 2)))}
          />
          <SmallBtn icon="CaseSensitive" title="Регистр" onClick={() => p.onCommand('removeFormat')} />
          <SmallBtn icon="Eraser" title="Очистить формат" onClick={() => p.onCommand('removeFormat')} />
        </Row>
        <Row>
          <SmallBtn icon="Bold" title="Полужирный" onClick={() => p.onCommand('bold')} />
          <SmallBtn icon="Italic" title="Курсив" onClick={() => p.onCommand('italic')} />
          <SmallBtn icon="Underline" title="Подчёркнутый" onClick={() => p.onCommand('underline')} />
          <SmallBtn icon="Strikethrough" title="Зачёркнутый" onClick={() => p.onCommand('strikeThrough')} />
          <SmallBtn icon="Subscript" title="Подстрочный" onClick={() => p.onCommand('subscript')} />
          <SmallBtn icon="Superscript" title="Надстрочный" onClick={() => p.onCommand('superscript')} />
          <label className="win-btn h-[22px] cursor-pointer px-1" title="Цвет выделения">
            <Icon name="Highlighter" size={15} />
            <input
              type="color"
              defaultValue="#ffff00"
              onChange={(e) => p.onCommand('hiliteColor', e.target.value)}
              className="h-0 w-0 opacity-0"
            />
          </label>
          <label className="win-btn h-[22px] cursor-pointer px-1" title="Цвет текста">
            <Icon name="Baseline" size={15} />
            <input
              type="color"
              defaultValue="#c00000"
              onChange={(e) => p.onCommand('foreColor', e.target.value)}
              className="h-0 w-0 opacity-0"
            />
          </label>
        </Row>
      </VStack>
    </RibbonGroup>

    <RibbonGroup title="Абзац">
      <VStack>
        <Row>
          <SmallBtn icon="List" title="Маркированный список" onClick={() => p.onCommand('insertUnorderedList')} />
          <SmallBtn icon="ListOrdered" title="Нумерованный список" onClick={() => p.onCommand('insertOrderedList')} />
          <SmallBtn icon="ListTree" title="Многоуровневый список" onClick={() => p.onCommand('insertOrderedList')} />
          <SmallBtn icon="IndentDecrease" title="Уменьшить отступ" onClick={() => p.onCommand('outdent')} />
          <SmallBtn icon="IndentIncrease" title="Увеличить отступ" onClick={() => p.onCommand('indent')} />
          <SmallBtn icon="ArrowDownAZ" title="Сортировка" onClick={() => p.onCommand('justifyLeft')} />
          <SmallBtn icon="Pilcrow" title="Знаки абзацев" onClick={() => p.onCommand('justifyLeft')} />
        </Row>
        <Row>
          <SmallBtn icon="AlignLeft" title="По левому краю" onClick={() => p.onCommand('justifyLeft')} />
          <SmallBtn icon="AlignCenter" title="По центру" onClick={() => p.onCommand('justifyCenter')} />
          <SmallBtn icon="AlignRight" title="По правому краю" onClick={() => p.onCommand('justifyRight')} />
          <SmallBtn icon="AlignJustify" title="По ширине" onClick={() => p.onCommand('justifyFull')} />
          <SmallBtn icon="StretchVertical" title="Интервал" onClick={() => p.onCommand('justifyLeft')} />
          <SmallBtn icon="PaintBucket" title="Заливка" onClick={() => p.onCommand('hiliteColor', '#dbe5f1')} />
          <SmallBtn icon="Grid2x2" title="Границы" onClick={() => p.onCommand('justifyLeft')} />
        </Row>
      </VStack>
    </RibbonGroup>

    <RibbonGroup title="Стили">
      <div className="flex items-center gap-[2px]">
        {STYLES.map((s, i) => (
          <button
            key={i}
            type="button"
            title={s.name}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => p.onCommand('formatBlock', s.cmd)}
            className="flex h-[58px] w-[58px] flex-col items-center justify-between rounded-[2px] border border-[hsl(var(--win-ribbon-border))] bg-white px-1 py-1 transition-colors hover:border-[hsl(var(--win-title))]"
          >
            <span className={`flex flex-1 items-center ${s.css}`}>{s.label}</span>
            <span className="w-full truncate text-center text-[9px] text-[hsl(var(--win-group-label))]">
              {s.name}
            </span>
          </button>
        ))}
      </div>
    </RibbonGroup>

    <RibbonGroup title="Редактирование">
      <VStack>
        <SmallBtn icon="Search" title="Найти" label="Найти" onClick={p.onFind} />
        <SmallBtn icon="Replace" title="Заменить" label="Заменить" onClick={p.onReplace} />
        <SmallBtn
          icon="TextSelect"
          title="Выделить"
          label="Выделить"
          onClick={() => p.onCommand('selectAll')}
        />
      </VStack>
    </RibbonGroup>
  </>
);

export { FONT_VALUE, FONTS, SIZES };
export default RibbonHome;
