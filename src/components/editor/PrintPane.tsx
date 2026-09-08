import { useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import type { DocTheme } from './RibbonDesign';
import type { PageSetup } from './RibbonLayout';
import { CM, PAGE_HEIGHT, PAGE_WIDTH } from './DocumentCanvas';
import type { PagesPerSheet, PrintRange, PrintSetup } from '@/lib/print';
import {
  PAPER_LABELS,
  pagesToPrint,
  rangeLabel,
  sheetGrid,
} from '@/lib/print';

interface Props {
  getHtml: () => string;
  theme: DocTheme;
  setup: PageSetup;
  onSetup: (patch: Partial<PageSetup>) => void;
  pages: number;
  /** Страница, на которой стоит курсор */
  currentPage?: number;
  print: PrintSetup;
  onPrintSetup: (patch: Partial<PrintSetup>) => void;
  onPrint: () => void;
  onOptions: () => void;
}

const PRINTERS = [
  { name: 'Сохранить как PDF', status: 'Готов' },
  { name: 'EPSON L355 Series', status: 'Не подключен' },
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
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-20 border border-[hsl(var(--win-ribbon-border))] bg-white shadow-md">
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
        </>
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

const RANGE_OPTIONS: { value: PrintRange; label: string }[] = [
  { value: 'all', label: 'Напечатать все страницы' },
  { value: 'current', label: 'Только текущая страница' },
  { value: 'custom', label: 'Настраиваемый диапазон' },
  { value: 'odd', label: 'Только нечётные страницы' },
  { value: 'even', label: 'Только чётные страницы' },
];

const PER_SHEET: PagesPerSheet[] = [1, 2, 4, 6, 9];

const PrintPane = (p: Props) => {
  const [printer, setPrinter] = useState(PRINTERS[0]);
  const [preview, setPreview] = useState(1);
  const [zoom, setZoom] = useState(81);

  const html = useMemo(() => p.getHtml(), [p]);

  const width = p.setup.landscape ? PAGE_HEIGHT : PAGE_WIDTH;
  const height = p.setup.landscape ? PAGE_WIDTH : PAGE_HEIGHT;
  const pad = p.setup.margin * CM;
  const scale = zoom / 100;
  const s = p.print;

  /* какие страницы реально уйдут на печать */
  const willPrint = useMemo(
    () => pagesToPrint(s, p.pages, p.currentPage ?? 1),
    [s, p.pages, p.currentPage],
  );

  const [cols, rows] = sheetGrid(s.pagesPerSheet);
  const sheets = Math.ceil(willPrint.length / (cols * rows));

  /* в предпросмотре листаем только те страницы, что печатаются */
  const shown = willPrint[Math.min(preview, willPrint.length) - 1] ?? 1;

  const marginLabel =
    MARGIN_PRESETS.find((m) => Math.abs(m.value - p.setup.margin) < 0.05)?.label ??
    'Настраиваемые поля';

  const set = (patch: Partial<PrintSetup>) => p.onPrintSetup(patch);

  return (
    <div className="flex h-full min-h-0">
      {/* колонка настроек */}
      <div className="w-[190px] shrink-0 overflow-y-auto pr-4">
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
                value={s.copies}
                onChange={(e) =>
                  set({
                    copies: Math.max(
                      1,
                      Number(e.target.value.replace(/\D/g, '')) || 1,
                    ),
                  })
                }
                className="h-full w-full px-1 text-[12px] outline-none"
              />
              <span className="flex h-full flex-col border-l border-[hsl(var(--win-ribbon-border))]">
                <button
                  type="button"
                  onClick={() => set({ copies: s.copies + 1 })}
                  className="flex h-1/2 w-[14px] items-center justify-center hover:bg-[hsl(var(--win-hover))]"
                >
                  <Icon name="ChevronUp" size={9} />
                </button>
                <button
                  type="button"
                  onClick={() => set({ copies: Math.max(1, s.copies - 1) })}
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
        <div className="mb-3">
          <OptionRow
            icon="Printer"
            title={printer.name}
            hint={printer.status}
            options={PRINTERS.map((x) => x.name)}
            onPick={(_, i) => setPrinter(PRINTERS[i])}
          />
        </div>

        <h3 className="mb-1 text-[15px] font-normal text-[hsl(var(--win-title))]">
          Параметры
        </h3>

        <div className="space-y-[3px]">
          <OptionRow
            icon="FileStack"
            title={
              RANGE_OPTIONS.find((r) => r.value === s.range)?.label ?? 'Все'
            }
            hint={rangeLabel(s, p.pages)}
            options={RANGE_OPTIONS.map((r) => r.label)}
            onPick={(_, i) => {
              setPreview(1);
              set({ range: RANGE_OPTIONS[i].value });
            }}
          />

          <div className="flex items-center gap-1">
            <span className="text-[11px] text-[hsl(0_0%_25%)]">Страницы:</span>
            <input
              value={s.pagesText}
              placeholder="1-3, 5, 8-"
              onChange={(e) => {
                setPreview(1);
                set({ pagesText: e.target.value, range: 'custom' });
              }}
              className="h-[20px] flex-1 border border-[hsl(var(--win-ribbon-border))] px-1 text-[11px] outline-none focus:border-[hsl(var(--win-title))]"
            />
          </div>

          <OptionRow
            icon="Copy"
            title={s.duplex ? 'Двусторонняя печать' : 'Односторонняя печать'}
            hint={
              s.duplex
                ? 'Переворачивать листы по длинному краю'
                : 'Печатать только на одной стороне'
            }
            options={['Односторонняя печать', 'Двусторонняя печать']}
            onPick={(_, i) => set({ duplex: i === 1 })}
          />

          <OptionRow
            icon="Layers"
            title={s.collate ? 'Разобрать по копиям' : 'Не разбирать по копиям'}
            hint={s.collate ? '1,2,3   1,2,3   1,2,3' : '1,1,1   2,2,2   3,3,3'}
            options={['Разобрать по копиям', 'Не разбирать по копиям']}
            onPick={(_, i) => set({ collate: i === 0 })}
          />

          <OptionRow
            icon={p.setup.landscape ? 'RectangleHorizontal' : 'RectangleVertical'}
            title={p.setup.landscape ? 'Альбомная ориентация' : 'Книжная ориентация'}
            options={['Книжная ориентация', 'Альбомная ориентация']}
            onPick={(_, i) => p.onSetup({ landscape: i === 1 })}
          />

          <OptionRow
            icon="FileText"
            title={
              PAPER_LABELS.find((x) => x.value === s.paper)?.label ?? 'A4'
            }
            options={PAPER_LABELS.map((x) => x.label)}
            onPick={(_, i) => set({ paper: PAPER_LABELS[i].value })}
          />

          <OptionRow
            icon="Columns2"
            title={marginLabel}
            hint={`Поля со всех сторон: ${String(p.setup.margin).replace(
              '.',
              ',',
            )} см`}
            options={MARGIN_PRESETS.map((m) => m.label)}
            onPick={(_, i) => p.onSetup({ margin: MARGIN_PRESETS[i].value })}
          />

          <OptionRow
            icon="LayoutGrid"
            title={
              s.pagesPerSheet === 1
                ? '1 страница на листе'
                : `${s.pagesPerSheet} страницы на листе`
            }
            hint={s.pagesPerSheet > 1 ? `Сетка ${cols}×${rows}` : undefined}
            options={PER_SHEET.map((n) =>
              n === 1 ? '1 страница на листе' : `${n} страницы на листе`,
            )}
            onPick={(_, i) => set({ pagesPerSheet: PER_SHEET[i] })}
          />

          <OptionRow
            icon="Scaling"
            title={`Масштаб: ${s.scale} %`}
            hint={s.scale === 100 ? 'Исходный размер' : 'Содержимое изменено'}
            options={['50 %', '75 %', '100 %', '125 %', '150 %']}
            onPick={(v) => set({ scale: Number(v.replace(/\D/g, '')) })}
          />
        </div>

        <div className="mt-3 space-y-1 border-t border-[hsl(var(--win-ribbon-border))] pt-2">
          <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-[hsl(0_0%_25%)]">
            <input
              type="checkbox"
              checked={s.background}
              onChange={(e) => set({ background: e.target.checked })}
              className="h-3 w-3 accent-[hsl(var(--win-title))]"
            />
            Печатать фон и заливку
          </label>
          <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-[hsl(0_0%_25%)]">
            <input
              type="checkbox"
              checked={s.drawings}
              onChange={(e) => set({ drawings: e.target.checked })}
              className="h-3 w-3 accent-[hsl(var(--win-title))]"
            />
            Печатать рисунки
          </label>
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
              style={{ width, height, transform: `scale(${scale})` }}
            >
              {s.pagesPerSheet > 1 ? (
                /* несколько страниц на листе — показываем сетку */
                <div
                  className="grid h-full w-full gap-[6mm] p-[6mm]"
                  style={{
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                  }}
                >
                  {willPrint
                    .slice(
                      (preview - 1) * cols * rows,
                      preview * cols * rows,
                    )
                    .map((page) => (
                      <div
                        key={page}
                        className="relative overflow-hidden border border-[hsl(0_0%_88%)] bg-white"
                      >
                        <div
                          className="pv-page absolute left-0 right-0 top-0 origin-top-left"
                          style={
                            {
                              width,
                              padding: pad,
                              transform: `scale(${1 / Math.max(cols, rows)})`,
                              marginTop: -(page - 1) * (height - pad * 2),
                              fontFamily: p.theme.bodyFont,
                              color: p.theme.bodyColor,
                              fontSize: 15,
                              lineHeight: 1.5,
                            } as React.CSSProperties
                          }
                          dangerouslySetInnerHTML={{ __html: html }}
                        />
                      </div>
                    ))}
                </div>
              ) : (
                <div
                  className="pv-page"
                  style={
                    {
                      padding: pad,
                      fontFamily: p.theme.bodyFont,
                      color: p.theme.bodyColor,
                      fontSize: 15,
                      lineHeight: 1.5,
                      marginTop: -(shown - 1) * (height - pad * 2),
                      '--pv-h-font': p.theme.headingFont,
                      '--pv-h-color': p.theme.headingColor,
                      '--pv-h-transform': p.theme.headingUpper
                        ? 'uppercase'
                        : 'none',
                    } as React.CSSProperties
                  }
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              )}
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
                  Math.max(1, sheets),
                  Math.max(1, Number(e.target.value.replace(/\D/g, '')) || 1),
                ),
              )
            }
            className="h-[20px] w-[34px] border border-[hsl(var(--win-ribbon-border))] text-center text-[12px] outline-none"
          />
          <span className="mx-2 text-[12px] text-[hsl(0_0%_30%)]">
            из {sheets}
            {s.pagesPerSheet > 1 || willPrint.length !== p.pages
              ? ` (страниц: ${willPrint.length})`
              : ''}
          </span>
          <button
            type="button"
            onClick={() => setPreview((v) => Math.min(sheets, v + 1))}
            className="px-1 text-[hsl(0_0%_40%)] hover:text-[hsl(0_0%_10%)]"
          >
            <Icon name="ChevronRight" size={14} />
          </button>

          {s.copies > 1 && (
            <span className="ml-3 text-[11px] text-[hsl(0_0%_45%)]">
              Копий: {s.copies}
              {s.collate ? ', с разбором' : ', без разбора'}
            </span>
          )}

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