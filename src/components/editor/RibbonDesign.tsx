import Icon from '@/components/ui/icon';
import { RibbonGroup, BigCmd, SmallCmd, Stack } from './RibbonControls';
import type { TabActions } from './RibbonTabs';

export interface DocTheme {
  id: string;
  headingFont: string;
  headingColor: string;
  bodyFont: string;
  bodyColor: string;
  headingUpper?: boolean;
  headingFill?: string;
  headingSize: number;
}

export const THEMES: DocTheme[] = [
  { id: 't1', headingFont: 'Calibri Light, sans-serif', headingColor: '#2f5496', bodyFont: 'Calibri, sans-serif', bodyColor: '#000', headingSize: 15 },
  { id: 't2', headingFont: 'Georgia, serif', headingColor: '#000', bodyFont: 'Georgia, serif', bodyColor: '#333', headingSize: 15 },
  { id: 't3', headingFont: 'Arial, sans-serif', headingColor: '#404040', bodyFont: 'Arial, sans-serif', bodyColor: '#404040', headingSize: 14 },
  { id: 't4', headingFont: 'Cambria, serif', headingColor: '#1f3864', bodyFont: 'Cambria, serif', bodyColor: '#000', headingSize: 16 },
  { id: 't5', headingFont: 'Verdana, sans-serif', headingColor: '#c00000', bodyFont: 'Verdana, sans-serif', bodyColor: '#000', headingSize: 14 },
  { id: 't6', headingFont: 'Trebuchet MS, sans-serif', headingColor: '#000', bodyFont: 'Trebuchet MS, sans-serif', bodyColor: '#333', headingSize: 20 },
  { id: 't7', headingFont: 'Impact, sans-serif', headingColor: '#000', bodyFont: 'Arial, sans-serif', bodyColor: '#000', headingSize: 20, headingUpper: true },
  { id: 't8', headingFont: 'Tahoma, sans-serif', headingColor: '#7f7f7f', bodyFont: 'Tahoma, sans-serif', bodyColor: '#404040', headingSize: 15 },
  { id: 't9', headingFont: 'Palatino Linotype, serif', headingColor: '#833c00', bodyFont: 'Palatino Linotype, serif', bodyColor: '#000', headingSize: 16, headingUpper: true },
  { id: 't10', headingFont: 'Segoe UI, sans-serif', headingColor: '#2e74b5', bodyFont: 'Segoe UI, sans-serif', bodyColor: '#000', headingSize: 15 },
  { id: 't11', headingFont: 'Century Gothic, sans-serif', headingColor: '#000', bodyFont: 'Century Gothic, sans-serif', bodyColor: '#000', headingSize: 22 },
  { id: 't12', headingFont: 'Book Antiqua, serif', headingColor: '#375623', bodyFont: 'Book Antiqua, serif', bodyColor: '#000', headingSize: 18 },
  { id: 't13', headingFont: 'Franklin Gothic, sans-serif', headingColor: '#ffffff', headingFill: '#2e74b5', bodyFont: 'Arial, sans-serif', bodyColor: '#000', headingSize: 15, headingUpper: true },
  { id: 't14', headingFont: 'Rockwell, serif', headingColor: '#000', bodyFont: 'Rockwell, serif', bodyColor: '#333', headingSize: 15 },
  { id: 't15', headingFont: 'Garamond, serif', headingColor: '#7f6000', bodyFont: 'Garamond, serif', bodyColor: '#000', headingSize: 16, headingUpper: true },
  { id: 't16', headingFont: 'Lucida Sans, sans-serif', headingColor: '#000', bodyFont: 'Lucida Sans, sans-serif', bodyColor: '#404040', headingSize: 15 },
];

export const COLOR_SETS: { id: string; colors: string[] }[] = [
  { id: 'c1', colors: ['#4472c4', '#ed7d31', '#a5a5a5', '#ffc000'] },
  { id: 'c2', colors: ['#1f3864', '#2e74b5', '#9dc3e6', '#deebf7'] },
  { id: 'c3', colors: ['#375623', '#70ad47', '#a9d18e', '#e2f0d9'] },
  { id: 'c4', colors: ['#833c00', '#c55a11', '#f4b183', '#fbe5d6'] },
  { id: 'c5', colors: ['#7b0000', '#c00000', '#ff5050', '#ffcccc'] },
  { id: 'c6', colors: ['#3b3838', '#7f7f7f', '#bfbfbf', '#f2f2f2'] },
];

export const FONT_SETS: { id: string; heading: string; body: string; label: string }[] = [
  { id: 'f1', heading: 'Calibri Light, sans-serif', body: 'Calibri, sans-serif', label: 'Calibri' },
  { id: 'f2', heading: 'Georgia, serif', body: 'Georgia, serif', label: 'Georgia' },
  { id: 'f3', heading: 'Cambria, serif', body: 'Cambria, serif', label: 'Cambria' },
  { id: 'f4', heading: 'Arial, sans-serif', body: 'Arial, sans-serif', label: 'Arial' },
  { id: 'f5', heading: 'Times New Roman, serif', body: 'Times New Roman, serif', label: 'Times New Roman' },
  { id: 'f6', heading: 'Verdana, sans-serif', body: 'Verdana, sans-serif', label: 'Verdana' },
];

export interface DesignProps extends TabActions {
  theme: DocTheme;
  onTheme: (t: DocTheme) => void;
  paraSpacing: number;
  onParaSpacing: (v: number) => void;
  watermark: string;
  onWatermark: (v: string) => void;
  pageColor: string;
  onPageColor: (v: string) => void;
  pageBorder: boolean;
  onPageBorder: (v: boolean) => void;
}

/** Миниатюра темы: строка заголовка и три строки «текста» */
const ThemeCard = ({
  theme,
  active,
  onClick,
}: {
  theme: DocTheme;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    title="Применить тему"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className={`flex h-[68px] w-[76px] shrink-0 flex-col gap-[3px] border bg-white px-[5px] py-[4px] text-left transition-colors ${
      active
        ? 'border-[hsl(var(--win-title))] ring-1 ring-[hsl(var(--win-title))]'
        : 'border-[hsl(var(--win-ribbon-border))] hover:border-[hsl(var(--win-title))]'
    }`}
  >
    <span
      className="block truncate leading-none"
      style={{
        fontFamily: theme.headingFont,
        color: theme.headingColor,
        background: theme.headingFill ?? 'transparent',
        fontSize: Math.min(11, theme.headingSize / 1.6),
        padding: theme.headingFill ? '2px 3px' : 0,
        textTransform: theme.headingUpper ? 'uppercase' : 'none',
      }}
    >
      Заголовок
    </span>
    <span
      className="block truncate leading-none"
      style={{
        fontFamily: theme.bodyFont,
        color: theme.headingColor,
        fontSize: 6,
      }}
    >
      Заголовок 1
    </span>
    <span className="flex flex-1 flex-col gap-[2px] pt-[1px]">
      {[100, 92, 70].map((w, i) => (
        <span
          key={i}
          className="block h-[2px] rounded-full"
          style={{ width: `${w}%`, background: theme.bodyColor, opacity: 0.35 }}
        />
      ))}
    </span>
  </button>
);

const RibbonDesign = (p: DesignProps) => (
  <>
    <RibbonGroup title="Форматирование документа">
      <BigCmd
        icon="Palette"
        lines={['Темы']}
        caret
        width={48}
        onClick={() => p.onTheme(THEMES[0])}
      />

      <div className="flex h-[72px] w-[660px] shrink-0 items-start gap-[3px] overflow-x-auto overflow-y-hidden border border-[hsl(var(--win-ribbon-border))] p-[2px]">
        {THEMES.map((t) => (
          <ThemeCard
            key={t.id}
            theme={t}
            active={p.theme.id === t.id}
            onClick={() => p.onTheme(t)}
          />
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          title="Цвета"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() =>
            p.onTheme({
              ...p.theme,
              headingColor:
                COLOR_SETS[Math.floor(Math.random() * COLOR_SETS.length)].colors[0],
            })
          }
          className="win-btn h-[68px] w-[46px] flex-col gap-1"
        >
          <span className="grid h-[22px] w-[22px] grid-cols-2 gap-[1px]">
            {COLOR_SETS[0].colors.map((c) => (
              <span key={c} style={{ background: c }} />
            ))}
          </span>
          <span className="text-[10px] leading-none">Цвета</span>
          <Icon name="ChevronDown" size={9} />
        </button>

        <button
          type="button"
          title="Шрифты"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const f = FONT_SETS[Math.floor(Math.random() * FONT_SETS.length)];
            p.onTheme({ ...p.theme, headingFont: f.heading, bodyFont: f.body });
          }}
          className="win-btn h-[68px] w-[46px] flex-col gap-1"
        >
          <span className="text-[22px] leading-none">A</span>
          <span className="text-[10px] leading-none">Шрифты</span>
          <Icon name="ChevronDown" size={9} />
        </button>
      </div>

      <Stack width={168}>
        <SmallCmd
          icon="StretchVertical"
          label="Интервал между абзацами"
          caret
          onClick={() => p.onParaSpacing(p.paraSpacing >= 16 ? 4 : p.paraSpacing + 4)}
        />
        <SmallCmd
          icon="Sparkles"
          label="Эффекты"
          caret
          onClick={() =>
            p.onTheme({ ...p.theme, headingUpper: !p.theme.headingUpper })
          }
        />
        <SmallCmd
          icon="CircleCheck"
          label="По умолчанию"
          onClick={() => {
            p.onTheme(THEMES[0]);
            p.onParaSpacing(8);
          }}
        />
      </Stack>
    </RibbonGroup>

    <RibbonGroup title="Фон страницы">
      <BigCmd
        icon="Droplets"
        lines={['Подложка']}
        caret
        width={60}
        onClick={() =>
          p.onWatermark(
            p.watermark ? '' : window.prompt('Текст подложки', 'ЧЕРНОВИК') ?? '',
          )
        }
      />
      <label
        className="win-btn h-[68px] w-[60px] cursor-pointer flex-col justify-start gap-[3px] px-1 pt-1"
        title="Цвет страницы"
      >
        <Icon name="PaintBucket" size={24} className="text-[hsl(215_60%_38%)]" />
        <span className="flex flex-col items-center text-[10px] leading-[1.15]">
          <span>Цвет</span>
          <span>страницы</span>
          <Icon name="ChevronDown" size={9} />
        </span>
        <input
          type="color"
          value={p.pageColor}
          onChange={(e) => p.onPageColor(e.target.value)}
          className="h-0 w-0 opacity-0"
        />
      </label>
      <BigCmd
        icon="Square"
        lines={['Границы', 'страниц']}
        width={60}
        onClick={() => p.onPageBorder(!p.pageBorder)}
      />
    </RibbonGroup>
  </>
);

export default RibbonDesign;