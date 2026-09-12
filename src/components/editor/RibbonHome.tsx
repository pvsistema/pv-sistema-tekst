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
import type { PasteMode } from '@/lib/clipboard';
import { PASTE_MODES } from '@/lib/clipboard';
import { PARA_SPACING_SETS } from '@/lib/doc-styles';
import type { DocStyle } from '@/lib/doc-styles';
import { styleCss } from '@/lib/doc-styles';
import type { FormatState } from '@/hooks/use-format-state';

const FONTS = [
  'Times New Roman',
  'Calibri',
  'Arial',
  'Georgia',
  'Courier New',
  'Verdana',
];

const FONT_VALUE: Record<string, string> = {
  'Times New Roman': "'Times New Roman', serif",
  Calibri: 'Calibri, sans-serif',
  Arial: 'Arial, sans-serif',
  Georgia: 'Georgia, serif',
  'Courier New': "'Courier New', monospace",
  Verdana: 'Verdana, sans-serif',
};

const SIZES = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '36', '48'];

/** Виды линии подчёркивания — как в списке у кнопки Ч в Word */
const UNDERLINE_KINDS: {
  value: 'none' | 'single' | 'double' | 'dotted' | 'dashed' | 'wavy';
  label: string;
}[] = [
  { value: 'single', label: 'Одинарное' },
  { value: 'double', label: 'Двойное' },
  { value: 'dotted', label: 'Пунктирное' },
  { value: 'dashed', label: 'Штриховое' },
  { value: 'wavy', label: 'Волнистое' },
  { value: 'none', label: 'Без линии' },
];

export interface RibbonHomeProps {
  onCommand: (command: string, value?: string) => void;
  fontFamily: string;
  /* что включено там, где стоит курсор */
  format?: FormatState;
  /** Выбор вида линии подчёркивания */
  onUnderline?: (
    kind: 'none' | 'single' | 'double' | 'dotted' | 'dashed' | 'wavy',
  ) => void;
  fontSize: string;
  onFontFamily: (v: string) => void;
  onFontSize: (v: string) => void;
  onFind: () => void;
  onReplace: () => void;
  onPaste: () => void;
  /** Вставка выбранным способом */
  onPasteMode?: (mode: PasteMode) => void;
  /** Набор интервалов между абзацами */
  onParaSpacingSet?: (value: number) => void;
  onParaSpacingDefault?: () => void;
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
  /** Быстрая установка одной стороны границы */
  onBorderSide?: (side: 'top' | 'right' | 'bottom' | 'left' | 'all' | 'none') => void;
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
}) => {
  /*
   * В документе бывают шрифты и размеры вне готового списка — например
   * 13 пунктов. Добавляем текущее значение, иначе поле будет пустым.
   * Пустая строка — это разное оформление в выделении, как в Word.
   */
  const list = value && !options.includes(value) ? [value, ...options] : options;

  return (
    <select
      value={value}
      onMouseDown={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value)}
      style={{ width }}
      className="h-[22px] rounded-[2px] border border-[hsl(var(--win-ribbon-border))] bg-white px-1 text-[11px] text-[hsl(0_0%_15%)] outline-none focus:border-[hsl(var(--win-title))]"
    >
      {!value && <option value="" />}
      {list.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
};

const RibbonHome = (p: RibbonHomeProps) => {
  /*
   * В полях показываем оформление текста под курсором, а если его
   * определить не удалось — последний выбор пользователя.
   */
  const shownFont = p.format?.fontName ?? p.fontFamily;
  const shownSize = p.format?.fontSize ?? p.fontSize;

  return (
  <>
    <RibbonGroup title="Буфер обмена">
      <BigBtn icon="ClipboardPaste" label="Вставить" onClick={p.onPaste} />
      <VStack>
        <Menu
          icon="ClipboardList"
          title="Параметры вставки"
          label="Параметры вставки"
          width={250}
          items={PASTE_MODES.map((m) => ({
            label: m.label,
            hint: m.hint,
            run: () => p.onPasteMode?.(m.value),
          }))}
        />
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
            value={shownFont}
            onChange={p.onFontFamily}
            options={FONTS}
            width={132}
          />
          <Combo
            value={shownSize}
            onChange={p.onFontSize}
            options={SIZES}
            width={46}
          />
          <SmallBtn
            icon="AArrowUp"
            title="Увеличить размер"
            onClick={() =>
              p.onFontSize(String(Math.min(72, Number(shownSize || 12) + 2)))
            }
          />
          <SmallBtn
            icon="AArrowDown"
            title="Уменьшить размер"
            onClick={() =>
              p.onFontSize(String(Math.max(8, Number(shownSize || 12) - 2)))
            }
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
          <SmallBtn
            letter="Ж"
            letterStyle="bold"
            title="Полужирный (Ctrl+B)"
            active={p.format?.bold}
            onClick={() => p.onCommand('bold')}
          />
          <SmallBtn
            letter="К"
            letterStyle="italic"
            title="Курсив (Ctrl+I)"
            active={p.format?.italic}
            onClick={() => p.onCommand('italic')}
          />
          <SplitBtn
            letter="Ч"
            letterStyle="underline"
            title="Подчёркнутый (Ctrl+U)"
            active={p.format?.underline}
            onClick={() => p.onCommand('underline')}
            width={170}
          >
            {(close) => (
              <>
                <p className="mb-1.5 text-[10px] text-slate-500">Вид линии</p>
                <div className="flex flex-col">
                  {UNDERLINE_KINDS.map((u) => (
                    <button
                      key={u.value}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        close();
                        p.onUnderline?.(u.value);
                      }}
                      className="flex items-center justify-between gap-2 rounded-[2px] px-1.5 py-[3px] text-left text-[11px] hover:bg-[hsl(var(--win-hover))]"
                    >
                      <span>{u.label}</span>
                      <span
                        className="w-[42px] text-center leading-none"
                        style={
                          u.value === 'none'
                            ? undefined
                            : {
                                textDecorationLine: 'underline',
                                textDecorationStyle:
                                  u.value === 'single' ? 'solid' : u.value,
                                textUnderlineOffset: 2,
                              }
                        }
                      >
                        {u.value === 'none' ? '—' : 'Абв'}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </SplitBtn>
          <SmallBtn
            letter="abc"
            letterStyle="strike"
            title="Зачёркнутый"
            active={p.format?.strike}
            onClick={() => p.onCommand('strikeThrough')}
          />
          <SmallBtn
            icon="Subscript"
            title="Подстрочный"
            active={p.format?.sub}
            onClick={() => p.onCommand('subscript')}
          />
          <SmallBtn
            icon="Superscript"
            title="Надстрочный"
            active={p.format?.sup}
            onClick={() => p.onCommand('superscript')}
          />
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
          <SplitBtn
            icon="List"
            title="Маркированный список"
            active={p.format?.bullet}
            onClick={p.onBullets}
          >
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
            active={p.format?.numbered}
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
          <SmallBtn
            icon="AlignLeft"
            title="По левому краю (Ctrl+L)"
            active={p.format?.align === 'left'}
            onClick={() => p.onCommand('justifyLeft')}
          />
          <SmallBtn
            icon="AlignCenter"
            title="По центру (Ctrl+E)"
            active={p.format?.align === 'center'}
            onClick={() => p.onCommand('justifyCenter')}
          />
          <SmallBtn
            icon="AlignRight"
            title="По правому краю (Ctrl+R)"
            active={p.format?.align === 'right'}
            onClick={() => p.onCommand('justifyRight')}
          />
          <SmallBtn
            icon="AlignJustify"
            title="По ширине (Ctrl+J)"
            active={p.format?.align === 'justify'}
            onClick={() => p.onCommand('justifyFull')}
          />
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
          <Menu
            icon="Grid2x2"
            title="Границы абзаца"
            width={220}
            items={[
              { label: 'Все границы', run: () => p.onBorderSide?.('all') },
              { label: 'Нет границы', run: () => p.onBorderSide?.('none') },
              {
                label: 'Верхняя граница',
                group: 'Отдельные стороны',
                run: () => p.onBorderSide?.('top'),
              },
              { label: 'Нижняя граница', run: () => p.onBorderSide?.('bottom') },
              { label: 'Левая граница', run: () => p.onBorderSide?.('left') },
              { label: 'Правая граница', run: () => p.onBorderSide?.('right') },
              {
                label: 'Границы и заливка…',
                group: 'Настройка',
                hint: 'Тип линии, цвет, рамка страницы',
                run: p.onBorders,
              },
            ]}
          />
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

        <Menu
          icon="Palette"
          title="Изменить стили"
          width={250}
          items={[
            ...PARA_SPACING_SETS.map((set) => ({
              group: set.first ? 'Интервал между абзацами' : undefined,
              label: set.label,
              hint: set.hint,
              run: () => p.onParaSpacingSet?.(set.value),
            })),
            {
              group: 'Применение',
              label: 'По умолчанию для новых документов',
              hint: 'Запомнить выбранный интервал',
              run: () => p.onParaSpacingDefault?.(),
            },
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
};

export { FONT_VALUE, FONTS, SIZES };
export default RibbonHome;