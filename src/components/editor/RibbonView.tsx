import Icon from '@/components/ui/icon';
import { RibbonGroup, BigCmd, SmallCmd, Stack } from './RibbonControls';
import type { TabActions } from './RibbonTabs';

export type ViewMode = 'read' | 'print' | 'web' | 'outline' | 'draft';

export interface ViewProps extends TabActions {
  viewMode: ViewMode;
  onViewMode: (m: ViewMode) => void;
  showRuler: boolean;
  onShowRuler: (v: boolean) => void;
  showGrid: boolean;
  onShowGrid: (v: boolean) => void;
  showNav: boolean;
  onShowNav: (v: boolean) => void;
  pageFlow: 'vertical' | 'horizontal';
  onPageFlow: (v: 'vertical' | 'horizontal') => void;
  onZoomDialog: () => void;
  onFitWidth: () => void;
  onOnePage: () => void;
  onManyPages: () => void;
  onNewWindow: () => void;
  onArrangeAll: () => void;
  onSplit: () => void;
  splitView: boolean;
  onMacros: () => void;
  onProperties: () => void;
}

/** Флажок ленты как в группе «Отображение» */
const Check = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={() => onChange(!checked)}
    className="flex h-[20px] w-full items-center gap-[6px] px-1 text-left hover:bg-[hsl(var(--win-hover))]"
  >
    <span
      className={`flex h-[13px] w-[13px] shrink-0 items-center justify-center rounded-[2px] border ${
        checked
          ? 'border-[hsl(var(--win-title))] bg-[hsl(var(--win-title))]'
          : 'border-[hsl(0_0%_55%)] bg-white'
      }`}
    >
      {checked && <Icon name="Check" size={10} className="text-white" />}
    </span>
    <span className="text-[11px] leading-none">{label}</span>
  </button>
);

const RibbonView = (p: ViewProps) => (
  <>
    <RibbonGroup title="Режимы">
      <BigCmd
        icon="BookOpen"
        lines={['Режим', 'чтения']}
        width={54}
        onClick={() => p.onViewMode('read')}
      />
      <button
        type="button"
        title="Разметка страницы"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => p.onViewMode('print')}
        data-active={p.viewMode === 'print' ? 'true' : 'false'}
        className="win-btn h-[68px] w-[62px] shrink-0 flex-col justify-start gap-[3px] px-1 pt-1"
      >
        <Icon name="FileText" size={24} className="text-[hsl(215_60%_38%)]" />
        <span className="flex flex-col items-center text-[10px] leading-[1.15]">
          <span>Разметка</span>
          <span>страницы</span>
        </span>
      </button>
      <BigCmd
        icon="Globe"
        lines={['Веб-', 'документ']}
        width={58}
        onClick={() => p.onViewMode('web')}
      />
      <Stack width={92}>
        <SmallCmd
          icon="ListTree"
          label="Структура"
          onClick={() => p.onViewMode('outline')}
        />
        <SmallCmd
          icon="FileType"
          label="Черновик"
          onClick={() => p.onViewMode('draft')}
        />
      </Stack>
    </RibbonGroup>

    <RibbonGroup title="Иммерсивный режим">
      <BigCmd
        icon="Headphones"
        lines={['Иммерсивное', 'средство чтения']}
        width={92}
        onClick={() => p.onViewMode('read')}
      />
    </RibbonGroup>

    <RibbonGroup title="Перемещение между страницами">
      <button
        type="button"
        title="По вертикали"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => p.onPageFlow('vertical')}
        data-active={p.pageFlow === 'vertical' ? 'true' : 'false'}
        className="win-btn h-[68px] w-[54px] shrink-0 flex-col justify-start gap-[3px] px-1 pt-1"
      >
        <Icon name="MoveVertical" size={24} className="text-[hsl(215_60%_38%)]" />
        <span className="flex flex-col items-center text-[10px] leading-[1.15]">
          <span>По</span>
          <span>вертикали</span>
        </span>
      </button>
      <button
        type="button"
        title="По горизонтали"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => p.onPageFlow('horizontal')}
        data-active={p.pageFlow === 'horizontal' ? 'true' : 'false'}
        className="win-btn h-[68px] w-[62px] shrink-0 flex-col justify-start gap-[3px] px-1 pt-1"
      >
        <Icon name="MoveHorizontal" size={24} className="text-[hsl(215_60%_38%)]" />
        <span className="flex flex-col items-center text-[10px] leading-[1.15]">
          <span>По</span>
          <span>горизонтали</span>
        </span>
      </button>
    </RibbonGroup>

    <RibbonGroup title="Отображение">
      <Stack width={132}>
        <Check label="Линейка" checked={p.showRuler} onChange={p.onShowRuler} />
        <Check label="Сетка" checked={p.showGrid} onChange={p.onShowGrid} />
        <Check
          label="Область навигации"
          checked={p.showNav}
          onChange={p.onShowNav}
        />
      </Stack>
    </RibbonGroup>

    <RibbonGroup title="Масштаб">
      <BigCmd
        icon="Search"
        lines={['Масштаб']}
        width={54}
        onClick={p.onZoomDialog}
      />
      <button
        type="button"
        title="100%"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => p.onZoom(100)}
        className="win-btn h-[68px] w-[46px] shrink-0 flex-col justify-start gap-[3px] px-1 pt-1"
      >
        <span className="flex h-[26px] items-center">
          <Icon name="FileDigit" size={24} className="text-[hsl(215_60%_38%)]" />
        </span>
        <span className="text-[10px] leading-none">100%</span>
      </button>
      <Stack width={146}>
        <SmallCmd icon="File" label="Одна страница" onClick={p.onOnePage} />
        <SmallCmd icon="Files" label="Несколько страниц" onClick={p.onManyPages} />
        <SmallCmd
          icon="MoveHorizontal"
          label="По ширине страницы"
          onClick={p.onFitWidth}
        />
      </Stack>
    </RibbonGroup>

    <RibbonGroup title="Окно">
      <BigCmd
        icon="Copy"
        lines={['Новое', 'окно']}
        width={52}
        onClick={p.onNewWindow}
      />
      <BigCmd
        icon="Rows3"
        lines={['Упорядочить', 'все']}
        width={68}
        onClick={p.onArrangeAll}
      />
      <button
        type="button"
        title="Разделить"
        onMouseDown={(e) => e.preventDefault()}
        onClick={p.onSplit}
        data-active={p.splitView ? 'true' : 'false'}
        className="win-btn h-[68px] w-[58px] shrink-0 flex-col justify-start gap-[3px] px-1 pt-1"
      >
        <Icon name="SplitSquareVertical" size={24} className="text-[hsl(215_60%_38%)]" />
        <span className="text-[10px] leading-none">Разделить</span>
      </button>
      <Stack width={196}>
        <SmallCmd icon="Columns2" label="Рядом" disabled />
        <SmallCmd icon="ArrowDownUp" label="Синхронная прокрутка" disabled />
        <SmallCmd icon="LayoutGrid" label="Восстановить расположение окна" disabled />
      </Stack>
      <BigCmd
        icon="ExternalLink"
        lines={['Перейти в', 'другое окно']}
        caret
        width={70}
        onClick={p.onNewWindow}
      />
    </RibbonGroup>

    <RibbonGroup title="Макросы">
      <BigCmd
        icon="Code2"
        lines={['Макросы']}
        caret
        width={58}
        onClick={p.onMacros}
      />
    </RibbonGroup>

    <RibbonGroup title="Свойства">
      <BigCmd
        icon="Info"
        lines={['Свойства']}
        width={58}
        onClick={p.onProperties}
      />
    </RibbonGroup>
  </>
);

export default RibbonView;