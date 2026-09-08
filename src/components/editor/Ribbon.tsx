import Icon from '@/components/ui/icon';
import RibbonHome, { RibbonHomeProps } from './RibbonHome';
import RibbonInsert from './RibbonInsert';
import RibbonDesign, { DesignProps } from './RibbonDesign';
import RibbonLayout, { LayoutProps } from './RibbonLayout';
import RibbonLinks, { LinksProps } from './RibbonLinks';
import RibbonReview, { ReviewProps } from './RibbonReview';
import RibbonView, { ViewProps } from './RibbonView';
import RibbonTable, { RibbonTableProps } from './RibbonTable';
import RibbonEquation, { RibbonEquationProps } from './RibbonEquation';
import {
  RibbonHelp,
  TabActions,
} from './RibbonTabs';

export const TABS = [
  'Главная',
  'Вставка',
  'Конструктор',
  'Макет',
  'Ссылки',
  'Рецензирование',
  'Вид',
  'Справка',
] as const;

/** Контекстные вкладки появляются по месту курсора и в общий ряд не входят */
export type RibbonTab = (typeof TABS)[number] | 'Таблица' | 'Формула';

interface Props
  extends RibbonHomeProps,
    TabActions,
    DesignProps,
    LayoutProps,
    LinksProps,
    ReviewProps,
    ViewProps,
    RibbonTableProps,
    RibbonEquationProps {
  tab: RibbonTab;
  onTab: (t: RibbonTab) => void;
  onFileMenu: () => void;
  /** Курсор внутри таблицы — показываем вкладку «Работа с таблицами» */
  inTable?: boolean;
  /** Курсор внутри формулы — показываем «Работа с формулами» */
  inEquation?: boolean;
}

const Ribbon = (p: Props) => {
  const actions: TabActions = {
    onCommand: p.onCommand,
    onInsertTable: p.onInsertTable,
    onInsertImage: p.onInsertImage,
    onPrint: p.onPrint,
    onNew: p.onNew,
    onZoom: p.onZoom,
    onHeaderFooter: p.onHeaderFooter,
    onBreak: p.onBreak,
    onShapes: p.onShapes,
    onTextBox: p.onTextBox,
    onWordArt: p.onWordArt,
    onWrap: p.onWrap,
    onOrder: p.onOrder,
    onSymbol: p.onSymbol,
    onDateTime: p.onDateTime,
    onQuickParts: p.onQuickParts,
    onEquationNew: p.onEquationNew,
    zoom: p.zoom,
  };

  return (
    <div
      className="shrink-0 border-b border-[hsl(var(--win-ribbon-border))]"
      style={{ background: 'hsl(var(--win-ribbon))' }}
    >
      {/* строка вкладок */}
      <div
        className="flex items-end gap-0.5 px-1"
        style={{ background: 'hsl(var(--win-title))' }}
      >
        <button
          type="button"
          onClick={p.onFileMenu}
          className="h-[26px] px-3 text-[12px] text-white transition-colors hover:bg-[hsl(215_78%_27%)]"
        >
          Файл
        </button>

        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => p.onTab(t)}
            className={`h-[26px] rounded-t-[2px] px-3 text-[12px] transition-colors ${
              p.tab === t
                ? 'bg-white text-[hsl(0_0%_15%)]'
                : 'text-white hover:bg-white/20'
            }`}
          >
            {t}
          </button>
        ))}

        {p.inTable && (
          <button
            type="button"
            onClick={() => p.onTab('Таблица')}
            className={`h-[26px] rounded-t-[2px] px-3 text-[12px] transition-colors ${
              p.tab === 'Таблица'
                ? 'bg-white text-[hsl(0_0%_15%)]'
                : 'bg-[hsl(280_45%_45%)] text-white hover:bg-[hsl(280_45%_52%)]'
            }`}
          >
            Работа с таблицами
          </button>
        )}

        {p.inEquation && (
          <button
            type="button"
            onClick={() => p.onTab('Формула')}
            className={`h-[26px] rounded-t-[2px] px-3 text-[12px] transition-colors ${
              p.tab === 'Формула'
                ? 'bg-white text-[hsl(0_0%_15%)]'
                : 'bg-[hsl(200_55%_40%)] text-white hover:bg-[hsl(200_55%_48%)]'
            }`}
          >
            Работа с формулами
          </button>
        )}

        <div className="ml-2 hidden items-center gap-1.5 pb-1 text-[11px] text-white/85 lg:flex">
          <Icon name="Lightbulb" size={13} />
          <span>Что вы хотите сделать?</span>
        </div>

        <button
          type="button"
          className="mb-1 ml-auto hidden items-center gap-1.5 px-2 text-[11px] text-white/90 hover:text-white sm:flex"
        >
          <Icon name="Share2" size={13} />
          Поделиться
        </button>
      </div>

      {/* содержимое ленты */}
      <div className="flex items-stretch overflow-x-auto px-1">
        {p.tab === 'Главная' && <RibbonHome {...p} />}
        {p.tab === 'Вставка' && <RibbonInsert {...actions} />}
        {p.tab === 'Конструктор' && <RibbonDesign {...p} />}
        {p.tab === 'Макет' && <RibbonLayout {...p} />}
        {p.tab === 'Ссылки' && <RibbonLinks {...p} />}
        {p.tab === 'Рецензирование' && <RibbonReview {...p} />}
        {p.tab === 'Вид' && <RibbonView {...p} />}
        {p.tab === 'Таблица' && <RibbonTable {...p} />}
        {p.tab === 'Формула' && <RibbonEquation {...p} />}
        {p.tab === 'Справка' && <RibbonHelp {...actions} />}
      </div>
    </div>
  );
};

export default Ribbon;