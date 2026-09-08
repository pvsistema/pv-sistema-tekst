import { RibbonGroup, BigCmd, SmallCmd, Stack, SpinBox, Menu } from './RibbonControls';
import type { BreakKind } from '@/lib/breaks';
import { BREAK_OPTIONS } from '@/lib/breaks';
import type { WrapMode } from '@/lib/shapes';
import { WRAP_LABELS } from '@/lib/shapes';

/** Пояснения к режимам обтекания */
const WRAP_HINTS: Record<WrapMode, string> = {
  inline: 'Объект стоит в строке как буква',
  square: 'Текст обходит объект по прямоугольнику',
  tight: 'Текст прижимается к очертаниям',
  'top-bottom': 'Текст идёт выше и ниже объекта',
  behind: 'Объект лежит под текстом',
  front: 'Объект закрывает текст',
};
import type { TabActions } from './RibbonTabs';

export interface PageSetup {
  /** Общее поле — оставлено для старых документов */
  margin: number;
  landscape: boolean;
  columns: number;
  indentLeft: number;
  indentRight: number;
  spaceBefore: number;
  spaceAfter: number;
  lineNumbers: boolean;
  hyphenation: boolean;
  /** Размер бумаги в сантиметрах */
  paperWidth: number;
  paperHeight: number;
  /** Поля по сторонам, в сантиметрах */
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  /** Переплёт — запас под подшивку */
  gutter: number;
  /** Расстояние между колонками, в сантиметрах */
  columnGap: number;
  /** Разделитель между колонками */
  columnRule: boolean;
}

export const DEFAULT_SETUP: PageSetup = {
  margin: 2,
  landscape: false,
  columns: 1,
  indentLeft: 0,
  indentRight: 0,
  spaceBefore: 0,
  spaceAfter: 8,
  lineNumbers: false,
  hyphenation: false,
  paperWidth: 21,
  paperHeight: 29.7,
  marginTop: 2,
  marginBottom: 2,
  marginLeft: 2,
  marginRight: 2,
  gutter: 0,
  columnGap: 1.25,
  columnRule: false,
};

export interface LayoutProps extends TabActions {
  setup: PageSetup;
  onSetup: (patch: Partial<PageSetup>) => void;
  /** Разрывы страниц, колонок и разделов */
  onBreak?: (kind: BreakKind) => void;
  onRemoveBreak?: () => void;
  onRemoveAllBreaks?: () => void;
  /** Обтекание и порядок наложения объектов */
  onWrap?: (wrap: WrapMode) => void;
  onOrder?: (dir: 'front' | 'back') => void;
  /** Окно «Параметры страницы» на нужной вкладке */
  onPageSetup?: (tab?: 'margins' | 'paper' | 'layout') => void;
}

const MARGIN_CYCLE = [2, 1, 2.54, 3];
const COLUMN_CYCLE = [1, 2, 3];

const RibbonLayout = (p: LayoutProps) => {
  const s = p.setup;

  const nextMargin = () => {
    const i = MARGIN_CYCLE.indexOf(s.margin);
    p.onSetup({ margin: MARGIN_CYCLE[(i + 1) % MARGIN_CYCLE.length] });
  };

  const nextColumns = () => {
    const i = COLUMN_CYCLE.indexOf(s.columns);
    p.onSetup({ columns: COLUMN_CYCLE[(i + 1) % COLUMN_CYCLE.length] });
  };

  return (
    <>
      <RibbonGroup title="Параметры страницы">
        <BigCmd
          icon="Scan"
          lines={['Поля']}
          caret
          width={44}
          onClick={() => p.onPageSetup?.('margins') ?? nextMargin()}
        />
        <BigCmd
          icon={s.landscape ? 'RectangleHorizontal' : 'RectangleVertical'}
          lines={['Ориентация']}
          caret
          width={66}
          onClick={() => p.onSetup({ landscape: !s.landscape })}
        />
        <BigCmd
          icon="FileText"
          lines={['Размер']}
          caret
          width={50}
          onClick={() => p.onPageSetup?.('paper')}
        />
        <BigCmd
          icon="Columns3"
          lines={['Колонки']}
          caret
          width={54}
          onClick={nextColumns}
        />
        <Stack width={146}>
          <div className="flex h-[20px] items-center">
            <Menu
              icon="SeparatorHorizontal"
              title="Разрывы страниц и разделов"
              label="Разрывы"
              width={250}
              items={[
                ...BREAK_OPTIONS.map((o, i) => ({
                  label: o.label,
                  hint: o.hint,
                  group:
                    i === 0
                      ? 'Разрывы страниц'
                      : o.section && !BREAK_OPTIONS[i - 1].section
                        ? 'Разрывы разделов'
                        : undefined,
                  run: () => p.onBreak?.(o.kind),
                })),
                {
                  label: 'Удалить разрыв',
                  hint: 'Тот, что стоит перед курсором',
                  group: 'Правка',
                  run: () => p.onRemoveBreak?.(),
                },
                {
                  label: 'Удалить все разрывы',
                  run: () => p.onRemoveAllBreaks?.(),
                },
              ]}
            />
          </div>
          <SmallCmd
            icon="ListOrdered"
            label="Номера строк"
            caret
            onClick={() => p.onSetup({ lineNumbers: !s.lineNumbers })}
          />
          <SmallCmd
            icon="Minus"
            label="Расстановка переносов"
            caret
            onClick={() => p.onSetup({ hyphenation: !s.hyphenation })}
          />
        </Stack>
      </RibbonGroup>

      <RibbonGroup title="Абзац">
        <div className="flex h-full items-start gap-4 px-1 pt-[2px]">
          <div className="flex flex-col gap-[3px]">
            <span className="text-[10px] leading-none text-[hsl(var(--win-group-label))]">
              Отступ
            </span>
            <SpinBox
              icon="IndentIncrease"
              label="Слева:"
              value={s.indentLeft}
              suffix="см"
              onChange={(v) => p.onSetup({ indentLeft: v })}
            />
            <SpinBox
              icon="IndentDecrease"
              label="Справа:"
              value={s.indentRight}
              suffix="см"
              onChange={(v) => p.onSetup({ indentRight: v })}
            />
          </div>

          <div className="flex flex-col gap-[3px]">
            <span className="text-[10px] leading-none text-[hsl(var(--win-group-label))]">
              Интервал
            </span>
            <SpinBox
              icon="ChevronsUp"
              label="До:"
              value={s.spaceBefore}
              step={2}
              suffix="пт"
              onChange={(v) => p.onSetup({ spaceBefore: v })}
            />
            <SpinBox
              icon="ChevronsDown"
              label="После:"
              value={s.spaceAfter}
              step={2}
              suffix="пт"
              onChange={(v) => p.onSetup({ spaceAfter: v })}
            />
          </div>
        </div>
      </RibbonGroup>

      <RibbonGroup title="Упорядочение">
        <div className="flex flex-col items-center justify-start pt-1">
          <Menu
            icon="WrapText"
            title="Обтекание текстом"
            width={230}
            items={WRAP_LABELS.map((w, i) => ({
              label: w.label,
              hint: WRAP_HINTS[w.value],
              group: i === 0 ? 'Обтекание текстом' : undefined,
              run: () => p.onWrap?.(w.value),
            }))}
          />
          <span className="mt-[2px] text-center text-[11px] leading-[1.15]">
            Обтекание
            <br />
            текстом
          </span>
        </div>
        <BigCmd
          icon="BringToFront"
          lines={['Переместить', 'вперед']}
          width={68}
          onClick={() => p.onOrder?.('front')}
        />
        <BigCmd
          icon="SendToBack"
          lines={['Переместить', 'назад']}
          width={68}
          onClick={() => p.onOrder?.('back')}
        />
        <BigCmd
          icon="MousePointerClick"
          lines={['Область', 'выделения']}
          width={62}
          onClick={() => p.onCommand('selectAll')}
        />
        <Stack width={122}>
          <SmallCmd
            icon="AlignHorizontalJustifyCenter"
            label="Выровнять"
            caret
            onClick={() => p.onCommand('justifyCenter')}
          />
          <SmallCmd icon="Group" label="Группировать" caret disabled />
          <SmallCmd icon="RotateCw" label="Повернуть" caret disabled />
        </Stack>
      </RibbonGroup>
    </>
  );
};

export default RibbonLayout;