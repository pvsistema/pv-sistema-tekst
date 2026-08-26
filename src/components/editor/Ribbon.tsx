import Icon from '@/components/ui/icon';
import RibbonHome, { RibbonHomeProps } from './RibbonHome';
import {
  RibbonInsert,
  RibbonDesign,
  RibbonLayout,
  RibbonLinks,
  RibbonMailings,
  RibbonReview,
  RibbonView,
  RibbonHelp,
  TabActions,
} from './RibbonTabs';

export const TABS = [
  'Главная',
  'Вставка',
  'Конструктор',
  'Макет',
  'Ссылки',
  'Рассылки',
  'Рецензирование',
  'Вид',
  'Справка',
] as const;

export type RibbonTab = (typeof TABS)[number];

interface Props extends RibbonHomeProps, TabActions {
  tab: RibbonTab;
  onTab: (t: RibbonTab) => void;
  onFileMenu: () => void;
}

const Ribbon = (p: Props) => {
  const actions: TabActions = {
    onCommand: p.onCommand,
    onInsertTable: p.onInsertTable,
    onInsertImage: p.onInsertImage,
    onPrint: p.onPrint,
    onNew: p.onNew,
    onZoom: p.onZoom,
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
        {p.tab === 'Конструктор' && <RibbonDesign {...actions} />}
        {p.tab === 'Макет' && <RibbonLayout {...actions} />}
        {p.tab === 'Ссылки' && <RibbonLinks {...actions} />}
        {p.tab === 'Рассылки' && <RibbonMailings {...actions} />}
        {p.tab === 'Рецензирование' && <RibbonReview {...actions} />}
        {p.tab === 'Вид' && <RibbonView {...actions} />}
        {p.tab === 'Справка' && <RibbonHelp {...actions} />}
      </div>
    </div>
  );
};

export default Ribbon;