import Icon from '@/components/ui/icon';
import { RibbonGroup, SmallCmd, Stack, Menu, BigCmd } from './RibbonControls';
import { TABLE_STYLES } from '@/lib/table-tools';

export interface RibbonTableProps {
  onInsertRow: (where: 'above' | 'below') => void;
  onInsertColumn: (where: 'left' | 'right') => void;
  onDeleteRow: () => void;
  onDeleteColumn: () => void;
  onDeleteTable: () => void;
  onMerge: () => void;
  onSplitCell: () => void;
  onTableBorders: (side: 'all' | 'outside' | 'inside' | 'none') => void;
  onBorderColor: (color: string) => void;
  onCellShading: (color: string) => void;
  onAlign: (
    h: 'left' | 'center' | 'right',
    v: 'top' | 'middle' | 'bottom',
  ) => void;
  onStyle: (id: string) => void;
  onSort: (desc: boolean) => void;
  onSum: () => void;
}

/** Девять кнопок выравнивания в ячейке — как в Word */
const ALIGNS: {
  h: 'left' | 'center' | 'right';
  v: 'top' | 'middle' | 'bottom';
  icon: string;
}[] = [
  { h: 'left', v: 'top', icon: 'AlignLeft' },
  { h: 'center', v: 'top', icon: 'AlignCenter' },
  { h: 'right', v: 'top', icon: 'AlignRight' },
  { h: 'left', v: 'middle', icon: 'AlignLeft' },
  { h: 'center', v: 'middle', icon: 'AlignCenter' },
  { h: 'right', v: 'middle', icon: 'AlignRight' },
  { h: 'left', v: 'bottom', icon: 'AlignLeft' },
  { h: 'center', v: 'bottom', icon: 'AlignCenter' },
  { h: 'right', v: 'bottom', icon: 'AlignRight' },
];

const V_LABEL = { top: 'сверху', middle: 'по центру', bottom: 'снизу' };

/** Контекстная вкладка: появляется, когда курсор внутри таблицы */
const RibbonTable = (p: RibbonTableProps) => (
  <>
    <RibbonGroup title="Строки и столбцы">
      <Stack width={150}>
        <SmallCmd
          icon="ArrowUpToLine"
          label="Вставить сверху"
          onClick={() => p.onInsertRow('above')}
        />
        <SmallCmd
          icon="ArrowDownToLine"
          label="Вставить снизу"
          onClick={() => p.onInsertRow('below')}
        />
        <SmallCmd
          icon="Trash2"
          label="Удалить строку"
          onClick={p.onDeleteRow}
        />
      </Stack>
      <Stack width={150}>
        <SmallCmd
          icon="ArrowLeftToLine"
          label="Вставить слева"
          onClick={() => p.onInsertColumn('left')}
        />
        <SmallCmd
          icon="ArrowRightToLine"
          label="Вставить справа"
          onClick={() => p.onInsertColumn('right')}
        />
        <SmallCmd
          icon="Trash2"
          label="Удалить столбец"
          onClick={p.onDeleteColumn}
        />
      </Stack>
    </RibbonGroup>

    <RibbonGroup title="Объединение">
      <Stack width={160}>
        <SmallCmd
          icon="TableCellsMerge"
          label="Объединить ячейки"
          onClick={p.onMerge}
        />
        <SmallCmd
          icon="TableCellsSplit"
          label="Разделить ячейку"
          onClick={p.onSplitCell}
        />
        <SmallCmd
          icon="Trash"
          label="Удалить таблицу"
          onClick={p.onDeleteTable}
        />
      </Stack>
    </RibbonGroup>

    <RibbonGroup title="Выравнивание">
      <div className="grid grid-cols-3 gap-[2px]">
        {ALIGNS.map((a) => (
          <button
            key={`${a.h}-${a.v}`}
            type="button"
            title={`По ${a.h === 'left' ? 'левому краю' : a.h === 'center' ? 'центру' : 'правому краю'}, ${V_LABEL[a.v]}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => p.onAlign(a.h, a.v)}
            className="win-btn h-[22px] w-[24px] px-0"
          >
            <Icon name={a.icon} size={12} />
          </button>
        ))}
      </div>
    </RibbonGroup>

    <RibbonGroup title="Стили таблиц">
      <div className="flex items-center gap-[3px]">
        {TABLE_STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            title={s.label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => p.onStyle(s.id)}
            className="flex h-[58px] w-[62px] flex-col items-center justify-between rounded-[2px] border border-[hsl(var(--win-ribbon-border))] bg-white p-1 hover:border-[hsl(var(--win-title))]"
          >
            <span className="flex w-full flex-1 flex-col gap-[1px]">
              <span
                className="h-[9px] w-full"
                style={{ background: s.head, border: `1px solid ${s.line}` }}
              />
              <span
                className="h-[7px] w-full"
                style={{ border: `1px solid ${s.line}` }}
              />
              <span
                className="h-[7px] w-full"
                style={{
                  background: s.stripe || '#fff',
                  border: `1px solid ${s.line}`,
                }}
              />
            </span>
            <span className="text-[9px] text-[hsl(var(--win-group-label))]">
              {s.label}
            </span>
          </button>
        ))}
      </div>
    </RibbonGroup>

    <RibbonGroup title="Оформление">
      <Stack width={140}>
        <Menu
          icon="Grid2x2"
          title="Границы таблицы"
          width={190}
          items={[
            { label: 'Все границы', run: () => p.onTableBorders('all') },
            { label: 'Внешние границы', run: () => p.onTableBorders('outside') },
            { label: 'Внутренние границы', run: () => p.onTableBorders('inside') },
            { label: 'Нет границ', run: () => p.onTableBorders('none') },
          ]}
        />
        <label
          className="win-btn h-[20px] w-full cursor-pointer justify-start gap-1.5 px-1"
          title="Цвет границ"
        >
          <Icon name="PenLine" size={14} className="text-[hsl(215_60%_38%)]" />
          <span className="text-[11px] leading-none">Цвет границ</span>
          <input
            type="color"
            defaultValue="#4472c4"
            onChange={(e) => p.onBorderColor(e.target.value)}
            className="h-0 w-0 opacity-0"
          />
        </label>
        <label
          className="win-btn h-[20px] w-full cursor-pointer justify-start gap-1.5 px-1"
          title="Заливка ячеек"
        >
          <Icon
            name="PaintBucket"
            size={14}
            className="text-[hsl(215_60%_38%)]"
          />
          <span className="text-[11px] leading-none">Заливка</span>
          <input
            type="color"
            defaultValue="#dbe5f1"
            onChange={(e) => p.onCellShading(e.target.value)}
            className="h-0 w-0 opacity-0"
          />
        </label>
      </Stack>
    </RibbonGroup>

    <RibbonGroup title="Данные">
      <BigCmd
        icon="ArrowDownAZ"
        lines={['Сортировка']}
        onClick={() => p.onSort(false)}
      />
      <BigCmd
        icon="ArrowUpAZ"
        lines={['По', 'убыванию']}
        onClick={() => p.onSort(true)}
      />
      <BigCmd icon="Sigma" lines={['Сумма']} onClick={p.onSum} />
    </RibbonGroup>
  </>
);

export default RibbonTable;
