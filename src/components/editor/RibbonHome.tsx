import Icon from '@/components/ui/icon';
import {
  RibbonGroup,
  SmallBtn,
  BigBtn,
  VStack,
  Row,
  Menu,
  SplitBtn,
} from './RibbonControls';
import { BULLETS, NUMBER_FORMATS } from '@/hooks/use-format';
import type { DocStyle } from '@/lib/doc-styles';
import { styleCss } from '@/lib/doc-styles';

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
  onFontDialog: () => void;
  onParaDialog: () => void;
  onChangeCase: (mode: 'sentence' | 'lower' | 'upper' | 'capitalize' | 'toggle') => void;
  onLineSpacing: (v: number) => void;
  onFormatMarks: () => void;
  onSortList: () => void;
  onMultilevel: () => void;
  onBullets: () => void;
  onNumbering: () => void;
  onBullet: (symbol: string) => void;
  onNumberFormat: (format: string) => void;
  onRestartNumbering: (start: number) => void;
  onBorders: () => void;
  onShading: (color: string) => void;
  formatMarks?: boolean;
  onFormatPainter: () => void;
  hasSample?: boolean;
  styles: DocStyle[];
  activeStyle: string;
  onStyleApply: (style: DocStyle) => void;
  onStylesPane: () => void;
  onStyleCreate: () => void;
  onStyleUpdate: () => void;
  onStyleClear: () => void;
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
          active={p.hasSample}
          onClick={p.onFormatPainter}
        />
      </VStack>
    </RibbonGroup>

    <RibbonGroup title="Шрифт" onDialog={p.onFontDialog}>
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
          <Menu
            icon="CaseSensitive"
            title="Регистр"
            items={[
              { label: 'Как в предложениях.', run: () => p.onChangeCase('sentence') },
              { label: 'все строчные', run: () => p.onChangeCase('lower') },
              { label: 'ВСЕ ПРОПИСНЫЕ', run: () => p.onChangeCase('upper') },
              { label: 'Начинать С Прописных', run: () => p.onChangeCase('capitalize') },
              { label: 'иЗМЕНИТЬ рЕГИСТР', run: () => p.onChangeCase('toggle') },
            ]}
          />
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

    <RibbonGroup title="Абзац" onDialog={p.onParaDialog}>
      <VStack>
        <Row>
          <SplitBtn icon="List" title="Маркированный список" onClick={p.onBullets}>
            {(close) => (
              <>
                <p className="mb-1.5 text-[10px] text-slate-500">
                  Библиотека маркеров
                </p>
                <div className="grid grid-cols-4 gap-1">
                  {BULLETS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        close();
                        p.onBullet(b);
                      }}
                      className="flex h-[34px] items-center justify-center rounded-[2px] border border-[hsl(var(--win-ribbon-border))] text-[15px] hover:border-[hsl(var(--win-title))]"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </>
            )}
          </SplitBtn>

          <SplitBtn
            icon="ListOrdered"
            title="Нумерованный список"
            onClick={p.onNumbering}
            width={200}
          >
            {(close) => (
              <>
                <p className="mb-1.5 text-[10px] text-slate-500">
                  Библиотека нумерации
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {NUMBER_FORMATS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        close();
                        p.onNumberFormat(f.value);
                      }}
                      className="flex h-[30px] items-center justify-center rounded-[2px] border border-[hsl(var(--win-ribbon-border))] text-[11px] hover:border-[hsl(var(--win-title))]"
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <div className="mt-2 border-t pt-1.5">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      close();
                      p.onRestartNumbering(1);
                    }}
                    className="w-full px-1 py-1 text-left text-[11px] hover:bg-[hsl(var(--win-hover))]"
                  >
                    Начать заново с 1
                  </button>
                </div>
              </>
            )}
          </SplitBtn>
          <SmallBtn icon="ListTree" title="Многоуровневый список" onClick={p.onMultilevel} />
          <SmallBtn icon="IndentDecrease" title="Уменьшить отступ" onClick={() => p.onCommand('outdent')} />
          <SmallBtn icon="IndentIncrease" title="Увеличить отступ" onClick={() => p.onCommand('indent')} />
          <SmallBtn icon="ArrowDownAZ" title="Сортировка" onClick={p.onSortList} />
          <SmallBtn
            icon="Pilcrow"
            title="Отображать все знаки"
            active={p.formatMarks}
            onClick={p.onFormatMarks}
          />
        </Row>
        <Row>
          <SmallBtn icon="AlignLeft" title="По левому краю" onClick={() => p.onCommand('justifyLeft')} />
          <SmallBtn icon="AlignCenter" title="По центру" onClick={() => p.onCommand('justifyCenter')} />
          <SmallBtn icon="AlignRight" title="По правому краю" onClick={() => p.onCommand('justifyRight')} />
          <SmallBtn icon="AlignJustify" title="По ширине" onClick={() => p.onCommand('justifyFull')} />
          <Menu
            icon="StretchVertical"
            title="Междустрочный интервал"
            items={[
              { label: '1,0', run: () => p.onLineSpacing(1) },
              { label: '1,15', run: () => p.onLineSpacing(1.15) },
              { label: '1,5', run: () => p.onLineSpacing(1.5) },
              { label: '2,0', run: () => p.onLineSpacing(2) },
              { label: '2,5', run: () => p.onLineSpacing(2.5) },
              { label: '3,0', run: () => p.onLineSpacing(3) },
              { label: 'Другие варианты…', run: p.onParaDialog },
            ]}
          />
          <label className="win-btn h-[22px] cursor-pointer px-1" title="Заливка">
            <Icon name="PaintBucket" size={15} />
            <input
              type="color"
              defaultValue="#dbe5f1"
              onChange={(e) => p.onShading(e.target.value)}
              className="h-0 w-0 opacity-0"
            />
          </label>
          <SmallBtn icon="Grid2x2" title="Границы" onClick={p.onBorders} />
        </Row>
      </VStack>
    </RibbonGroup>

    <RibbonGroup title="Стили" onDialog={p.onStylesPane}>
      <div className="flex items-center gap-[2px]">
        {p.styles.slice(0, 7).map((s) => (
          <button
            key={s.id}
            type="button"
            title={`${s.name} — стиль ${s.kind === 'character' ? 'знака' : 'абзаца'}`}
            data-active={p.activeStyle === s.id ? 'true' : 'false'}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => p.onStyleApply(s)}
            className={`flex h-[58px] w-[58px] flex-col items-center justify-between rounded-[2px] border bg-white px-1 py-1 transition-colors hover:border-[hsl(var(--win-title))] ${
              p.activeStyle === s.id
                ? 'border-[hsl(var(--win-title))] shadow-[inset_0_0_0_1px_hsl(var(--win-title))]'
                : 'border-[hsl(var(--win-ribbon-border))]'
            }`}
          >
            <span
              className="flex flex-1 items-center overflow-hidden"
              style={{ ...styleCss(s), fontSize: 13, lineHeight: 1.1 }}
            >
              АаБбВв
            </span>
            <span className="w-full truncate text-center text-[9px] text-[hsl(var(--win-group-label))]">
              {s.name}
            </span>
          </button>
        ))}

        <Menu
          icon="Ellipsis"
          title="Больше стилей"
          width={230}
          items={[
            { label: 'Область стилей…', run: p.onStylesPane },
            { label: 'Создать стиль…', run: p.onStyleCreate },
            { label: 'Обновить по образцу', run: p.onStyleUpdate },
            { label: 'Очистить форматирование', run: p.onStyleClear },
          ]}
        />
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
