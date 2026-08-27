import { useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import type { DocTheme } from './RibbonDesign';
import type { PageSetup } from './RibbonLayout';
import { CM, PAGE_HEIGHT, PAGE_WIDTH } from './DocumentCanvas';

interface Props {
  getHtml: () => string;
  theme: DocTheme;
  setup: PageSetup;
  onSetup: (patch: Partial<PageSetup>) => void;
  pages: number;
  onPrint: () => void;
  onOptions: () => void;
}

const PRINTERS = [
  { name: 'EPSON L355 Series', status: 'Не подключен' },
  { name: 'Microsoft Print to PDF', status: 'Готов' },
  { name: 'Отправить в OneNote', status: 'Готов' },
];

/** Раскрывающийся параметр печати с двумя строками текста */
const OptionRow = ({
  icon,
  title,
  hint,
  options,
  onPick,
}: {
  icon: string;
  title: string;
  hint?: string;
  options: string[];
  onPick: (v: string, index: number) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 border border-[hsl(var(--win-ribbon-border))] bg-white px-2 py-[5px] text-left hover:bg-[hsl(var(--win-hover))]"
      >
        <Icon name={icon} size={20} className="shrink-0 text-[hsl(215_45%_45%)]" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] leading-[1.3] text-[hsl(0_0%_15%)]">
            {title}
          </span>
          {hint && (
            <span className="block truncate text-[11px] leading-[1.3] text-[hsl(0_0%_45%)]">
              {hint}
            </span>
          )}
        </span>
        <Icon name="ChevronDown" size={13} className="shrink-0 text-[hsl(0_0%_40%)]" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-10 border border-[hsl(var(--win-ribbon-border))] bg-white shadow-md">
          {options.map((o, i) => (
            <button
              key={o}
              type="button"
              onClick={() => {
                onPick(o, i);
                setOpen(false);
              }}
              className="block w-full px-3 py-[6px] text-left text-[12px] hover:bg-[hsl(var(--win-hover))]"
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const MARGIN_PRESETS = [
  { label: 'Обычные поля', value: 2 },
  { label: 'Узкие поля', value: 1.27 },
  { label: 'Средние поля', value: 1.91 },
  { label: 'Широкие поля', value: 5.08 },
];

const PrintPane = (p: Props) => {
  const [copies, setCopies] = useState(1);
  const [printer, setPrinter] = useState(PRINTERS[0]);
  const [range, setRange] = useState('Все сразу');
  const [pagesText, setPagesText] = useState('');
  const [sides, setSides] = useState('Односторонняя печать');
  const [collate, setCollate] = useState('Разобрать по копиям');
  const [perSheet, setPerSheet] = useState('1 страница на листе');
  const [preview, setPreview] = useState(1);
  const [zoom, setZoom] = useState(81);

  const html = useMemo(() => p.getHtml(), [p]);

  const width = p.setup.landscape ? PAGE_HEIGHT : PAGE_WIDTH;
  const height = p.setup.landscape ? PAGE_WIDTH : PAGE_HEIGHT;
  const pad = p.setup.margin * CM;
  const scale = zoom / 100;

  const marginLabel =
    MARGIN_PRESETS.find((m) => Math.abs(m.value - p.setup.margin) < 0.05)?.label ??
    'Настраиваемые поля';

  return (
    <div className="flex h-full min-h-0">
      {/* колонка настроек */}
      <div className="w-[190px] shrink-0 pr-4">
        <div className="mb-4 flex items-start gap-4">
          <button
            type="button"
            onClick={p.onPrint}
            className="flex h-[62px] w-[62px] flex-col items-center justify-center gap-1 border border-[hsl(var(--win-ribbon-border))] bg-white hover:bg-[hsl(var(--win-hover))]"
          >
            <Icon name="Printer" size={24} className="text-[hsl(0_0%_25%)]" />
            <span className="text-[12px] leading-none">Печать</span>
          </button>

          <div className="pt-1">
            <span className="mb-1 block text-[12px] text-[hsl(0_0%_25%)]">
              Копии:
            </span>
            <div className="flex h-[22px] w-[54px] items-center border border-[hsl(var(--win-ribbon-border))] bg-white">
              <input
                value={copies}
                onChange={(e) =>
                  setCopies(Math.max(1, Number(e.target.value.replace(/\D/g, '')) || 1))
                }
                className="h-full w-full px-1 text-[12px] outline-none"
              />
              <span className="flex h-full flex-col border-l border-[hsl(var(--win-ribbon-border))]">
                <button
                  type="button"
                  onClick={() => setCopies((c) => c + 1)}
                  className="flex h-1/2 w-[14px] items-center justify-center hover:bg-[hsl(var(--win-hover))]"
                >
                  <Icon name="ChevronUp" size={9} />
                </button>
                <button
                  type="button"
                  onClick={() => setCopies((c) => Math.max(1, c - 1))}
                  className="flex h-1/2 w-[14px] items-center justify-center hover:bg-[hsl(var(--win-hover))]"
                >
                  <Icon name="ChevronDown" size={9} />
                </button>
              </span>
            </div>
          </div>
        </div>

        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-[15px] font-normal text-[hsl(var(--win-title))]">
            Принтер
          </h3>
          <Icon name="Info" size={13} className="text-[hsl(0_0%_55%)]" />
        </div>
        <div className="mb-1">
          <OptionRow
            icon="Printer"
            title={printer.name}
            hint={printer.status}
            options={PRINTERS.map((x) => x.name)}
            onPick={(_, i) => setPrinter(PRINTERS[i])}
          />
        </div>
        <button
          type="button"
          onClick={p.onPrint}
          className="mb-3 block w-full text-right text-[11px] text-[hsl(var(--win-title))] hover:underline"
        >
          Свойства принтера
        </button>

        <h3 className="mb-1 text-[15px] font-normal text-[hsl(var(--win-title))]">
          Параметры
        </h3>

        <div className="space-y-[3px]">
          <OptionRow
            icon="FileStack"
            title={
              range === 'Все сразу' ? 'Напечатать все страницы' : 'Диапазон страниц'
            }
            hint={range}
            options={['Все сразу', 'Текущая страница', 'Настраиваемый диапазон']}
            onPick={(v) => setRange(v)}
          />

          <div className="flex items-center gap-1">
            <span className="text-[11px] text-[hsl(0_0%_25%)]">Страницы:</span>
            <input
              value={pagesText}
              onChange={(e) => setPagesText(e.target.value)}
              className="h-[20px] flex-1 border border-[hsl(var(--win-ribbon-border))] px-1 text-[11px] outline-none focus:border-[hsl(var(--win-title))]"
            />
            <Icon name="Info" size={12} className="text-[hsl(0_0%_55%)]" />
          </div>

          <OptionRow
            icon="Copy"
            title={sides}
            hint={
              sides === 'Односторонняя печать'
                ? 'Печатать только на одной…'
                : 'Переворачивать страницы'
            }
            options={['Односторонняя печать', 'Двусторонняя печать']}
            onPick={(v) => setSides(v)}
          />

          <OptionRow
            icon="Layers"
            title={collate}
            hint={collate.startsWith('Разобрать') ? '1,2,3   1,2,3   1,2,3' : '1,1,1   2,2,2   3,3,3'}
            options={['Разобрать по копиям', 'Не разбирать по копиям']}
            onPick={(v) => setCollate(v)}
          />

          <OptionRow
            icon={p.setup.landscape ? 'RectangleHorizontal' : 'RectangleVertical'}
            title={p.setup.landscape ? 'Альбомная ориентация' : 'Книжная ориентация'}
            options={['Книжная ориентация', 'Альбомная ориентация']}
            onPick={(_, i) => p.onSetup({ landscape: i === 1 })}
          />

          <OptionRow
            icon="FileText"
            title="A4 (210 x 297 мм)"
            hint="21 см x 29,7 см"
            options={['A4 (210 x 297 мм)', 'A5 (148 x 210 мм)', 'Letter (216 x 279 мм)']}
            onPick={() => undefined}
          />

          <OptionRow
            icon="Columns2"
            title={marginLabel}
            hint={`Верх: ${p.setup.margin} см снизу: ${p.setup.margin} см влев…`}
            options={MARGIN_PRESETS.map((m) => m.label)}
            onPick={(_, i) => p.onSetup({ margin: MARGIN_PRESETS[i].value })}
          />

          <OptionRow
            icon="LayoutGrid"
            title={perSheet}
            options={['1 страница на листе', '2 страницы на листе', '4 страницы на листе']}
            onPick={(v) => setPerSheet(v)}
          />
        </div>

        <button
          type="button"
          onClick={p.onOptions}
          className="mt-3 block w-full text-right text-[11px] text-[hsl(var(--win-title))] hover:underline"
        >
          Параметры страницы
        </button>
      </div>

      {/* предпросмотр */}
      <div className="flex min-h-0 flex-1 flex-col border-l border-[hsl(var(--win-ribbon-border))] bg-[hsl(0_0%_93%)]">
        <div className="flex-1 overflow-auto p-6">
          <div
            className="mx-auto"
            style={{ width: width * scale, height: height * scale }}
          >
            <div
              className="origin-top-left overflow-hidden bg-white shadow-[0_1px_4px_rgba(0,0,0,0.25)]"
              style={{
                width,
                height,
                transform: `scale(${scale})`,
              }}
            >
              <div
                className="pv-page"
                style={
                  {
                    padding: pad,
                    fontFamily: p.theme.bodyFont,
                    color: p.theme.bodyColor,
                    fontSize: 15,
                    lineHeight: 1.5,
                    marginTop: -(preview - 1) * (height - pad * 2),
                    '--pv-h-font': p.theme.headingFont,
                    '--pv-h-color': p.theme.headingColor,
                    '--pv-h-transform': p.theme.headingUpper ? 'uppercase' : 'none',
                  } as React.CSSProperties
                }
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center border-t border-[hsl(var(--win-ribbon-border))] bg-white px-3 py-1">
          <button
            type="button"
            onClick={() => setPreview((v) => Math.max(1, v - 1))}
            className="px-1 text-[hsl(0_0%_40%)] hover:text-[hsl(0_0%_10%)]"
          >
            <Icon name="ChevronLeft" size={14} />
          </button>
          <input
            value={preview}
            onChange={(e) =>
              setPreview(
                Math.min(
                  p.pages,
                  Math.max(1, Number(e.target.value.replace(/\D/g, '')) || 1),
                ),
              )
            }
            className="h-[20px] w-[34px] border border-[hsl(var(--win-ribbon-border))] text-center text-[12px] outline-none"
          />
          <span className="mx-2 text-[12px] text-[hsl(0_0%_30%)]">из {p.pages}</span>
          <button
            type="button"
            onClick={() => setPreview((v) => Math.min(p.pages, v + 1))}
            className="px-1 text-[hsl(0_0%_40%)] hover:text-[hsl(0_0%_10%)]"
          >
            <Icon name="ChevronRight" size={14} />
          </button>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[12px] text-[hsl(0_0%_30%)]">{zoom} %</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(20, z - 10))}
              className="text-[hsl(0_0%_40%)] hover:text-[hsl(0_0%_10%)]"
            >
              <Icon name="Minus" size={14} />
            </button>
            <input
              type="range"
              min={20}
              max={200}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-[3px] w-[110px] cursor-pointer appearance-none rounded bg-[hsl(0_0%_75%)] accent-[hsl(var(--win-title))]"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              className="text-[hsl(0_0%_40%)] hover:text-[hsl(0_0%_10%)]"
            >
              <Icon name="Plus" size={14} />
            </button>
            <button
              type="button"
              title="По размеру страницы"
              onClick={() => setZoom(81)}
              className="text-[hsl(0_0%_40%)] hover:text-[hsl(0_0%_10%)]"
            >
              <Icon name="Maximize2" size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintPane;
