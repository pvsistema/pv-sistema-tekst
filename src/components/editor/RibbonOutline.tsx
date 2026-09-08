import Icon from '@/components/ui/icon';
import { RibbonGroup, BigCmd, SmallCmd, Stack } from './RibbonControls';
import type { OutlineLevel, ShowLevel } from '@/lib/outline';
import { SHOW_OPTIONS, levelLabel } from '@/lib/outline';

export interface RibbonOutlineProps {
  /** Уровень абзаца под курсором */
  outlineLevel?: OutlineLevel;
  outlineShow?: ShowLevel;
  onOutlineLevel?: (level: OutlineLevel) => void;
  onOutlinePromote?: () => void;
  onOutlineDemote?: () => void;
  onOutlineToBody?: () => void;
  onOutlineMove?: (dir: 'up' | 'down') => void;
  onOutlineCollapse?: () => void;
  onOutlineShow?: (show: ShowLevel) => void;
  /** Закрыть режим структуры */
  onOutlineClose?: () => void;
}

const LEVELS: OutlineLevel[] = [0, 1, 2, 3, 4, 5, 6];

/** Вкладка «Структура»: уровни заголовков и порядок глав */
const RibbonOutline = (p: RibbonOutlineProps) => {
  const level = p.outlineLevel ?? 0;

  const Arrow = ({
    icon,
    title,
    onClick,
  }: {
    icon: string;
    title: string;
    onClick?: () => void;
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-[24px] w-[26px] items-center justify-center rounded-[2px] border border-transparent hover:border-[hsl(var(--win-ribbon-border))] hover:bg-[hsl(var(--win-hover))]"
    >
      <Icon name={icon} size={15} />
    </button>
  );

  return (
    <>
      <RibbonGroup title="Работа со структурой">
        <div className="flex items-center gap-1 px-1">
          <Arrow
            icon="ChevronsLeft"
            title="Повысить до уровня 1"
            onClick={() => p.onOutlineLevel?.(1)}
          />
          <Arrow
            icon="ChevronLeft"
            title="Повысить уровень"
            onClick={p.onOutlinePromote}
          />

          <select
            value={level}
            onChange={(e) =>
              p.onOutlineLevel?.(Number(e.target.value) as OutlineLevel)
            }
            className="h-[24px] w-[122px] rounded-[2px] border border-[hsl(var(--win-ribbon-border))] bg-white px-1 text-[12px] outline-none"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {levelLabel(l)}
              </option>
            ))}
          </select>

          <Arrow
            icon="ChevronRight"
            title="Понизить уровень"
            onClick={p.onOutlineDemote}
          />
          <Arrow
            icon="ChevronsRight"
            title="Понизить до обычного текста"
            onClick={p.onOutlineToBody}
          />

          <span className="mx-1 h-[22px] w-px bg-[hsl(var(--win-ribbon-border))]" />

          <Arrow
            icon="ChevronUp"
            title="Переместить вверх"
            onClick={() => p.onOutlineMove?.('up')}
          />
          <Arrow
            icon="ChevronDown"
            title="Переместить вниз"
            onClick={() => p.onOutlineMove?.('down')}
          />
          <Arrow
            icon="SquareMinus"
            title="Свернуть или развернуть ветку"
            onClick={p.onOutlineCollapse}
          />
        </div>
      </RibbonGroup>

      <RibbonGroup title="Показ">
        <Stack width={168}>
          <div className="flex items-center gap-1.5 px-1 py-[2px]">
            <span className="text-[11px] text-slate-600">Уровни:</span>
            <select
              value={String(p.outlineShow ?? 'all')}
              onChange={(e) => {
                const v = e.target.value;
                p.onOutlineShow?.(
                  v === 'all' ? 'all' : (Number(v) as OutlineLevel),
                );
              }}
              className="h-[22px] flex-1 rounded-[2px] border border-[hsl(var(--win-ribbon-border))] bg-white px-1 text-[11px] outline-none"
            >
              {SHOW_OPTIONS.map((o) => (
                <option key={String(o.value)} value={String(o.value)}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <SmallCmd
            icon="ListTree"
            label="Показать все уровни"
            onClick={() => p.onOutlineShow?.('all')}
          />
        </Stack>
      </RibbonGroup>

      <RibbonGroup title="Закрыть">
        <BigCmd
          icon="X"
          lines={['Закрыть', 'структуру']}
          width={62}
          onClick={p.onOutlineClose}
        />
      </RibbonGroup>
    </>
  );
};

export default RibbonOutline;
