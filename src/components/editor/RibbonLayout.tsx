import { RibbonGroup, BigCmd, SmallCmd, Stack, SpinBox, Menu } from './RibbonControls';
import type { BreakKind } from '@/lib/breaks';
import { BREAK_OPTIONS } from '@/lib/breaks';
import type { TabActions } from './RibbonTabs';

export interface PageSetup {
  margin: number;
  landscape: boolean;
  columns: number;
  indentLeft: number;
  indentRight: number;
  spaceBefore: number;
  spaceAfter: number;
  lineNumbers: boolean;
  hyphenation: boolean;
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
};

export interface LayoutProps extends TabActions {
  setup: PageSetup;
  onSetup: (patch: Partial<PageSetup>) => void;
  /** Разрывы страниц, колонок и разделов */
  onBreak?: (kind: BreakKind) => void;
  onRemoveBreak?: () => void;
  onRemoveAllBreaks?: () => void;
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
          onClick={nextMargin}
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
          onClick={() => p.onSetup({ margin: 2 })}
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
        <BigCmd icon="Move" lines={['Положение']} caret width={60} disabled />
        <BigCmd icon="WrapText" lines={['Обтекание', 'текстом']} caret width={62} disabled />
        <BigCmd icon="BringToFront" lines={['Переместить', 'вперед']} caret width={68} disabled />
        <BigCmd icon="SendToBack" lines={['Переместить', 'назад']} caret width={68} disabled />
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
