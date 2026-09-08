import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useDocuments } from '@/hooks/use-documents';
import WindowTitleBar from '@/components/editor/WindowTitleBar';
import Ribbon, { RibbonTab } from '@/components/editor/Ribbon';
import DocRuler from '@/components/editor/DocRuler';
import DocumentCanvas, {
  CM,
  PAGE_HEIGHT,
  PAGE_WIDTH,
} from '@/components/editor/DocumentCanvas';
import { THEMES, DocTheme } from '@/components/editor/RibbonDesign';
import { DEFAULT_SETUP, PageSetup } from '@/components/editor/RibbonLayout';
import FindReplaceDialog from '@/components/editor/FindReplaceDialog';
import StatusBar from '@/components/editor/StatusBar';
import FileMenu from '@/components/editor/FileMenu';
import DropOverlay from '@/components/editor/DropOverlay';
import UnsavedDialog from '@/components/editor/UnsavedDialog';
import FontDialog from '@/components/editor/FontDialog';
import ParagraphDialog from '@/components/editor/ParagraphDialog';
import { useFormat } from '@/hooks/use-format';
import { useTables } from '@/hooks/use-tables';
import { useTabs } from '@/hooks/use-tabs';
import { useBreaks } from '@/hooks/use-breaks';
import { useBorders } from '@/hooks/use-borders';
import { useAutoCorrect } from '@/hooks/use-autocorrect';
import type { PrintSetup } from '@/lib/print';
import {
  DEFAULT_PRINT,
  PAPER_SIZES,
  buildPrintHtml,
  pagesToPrint,
  printOrder,
} from '@/lib/print';
import AutoCorrectDialog from '@/components/editor/AutoCorrectDialog';
import { useShapes } from '@/hooks/use-shapes';
import { useInserts } from '@/hooks/use-inserts';
import { useEquation } from '@/hooks/use-equation';
import { useCharts } from '@/hooks/use-charts';
import ChartDialog from '@/components/editor/ChartDialog';
import SymbolDialog from '@/components/editor/SymbolDialog';
import {
  DateTimeDialog,
  QuickPartsDialog,
} from '@/components/editor/QuickPartsDialog';
import ShapesGallery, {
  WordArtGallery,
} from '@/components/editor/ShapesGallery';
import BordersDialog from '@/components/editor/BordersDialog';
import TabsDialog from '@/components/editor/TabsDialog';
import TableDialog from '@/components/editor/TableDialog';
import StyleDialog from '@/components/editor/StyleDialog';
import StylesPane from '@/components/editor/StylesPane';
import HeaderFooterDialog from '@/components/editor/HeaderFooterDialog';
import { DEFAULT_FURNITURE, type PageFurniture } from '@/lib/page-numbers';
import { useStyles } from '@/hooks/use-styles';
import { useUnsavedGuard } from '@/hooks/use-unsaved-guard';
import type { DocTemplate } from '@/components/editor/fileTemplates';
import { htmlToDocx } from '@/lib/docx-writer';
import { useReferences } from '@/hooks/use-references';
import { useReview } from '@/hooks/use-review';
import type { ViewMode } from '@/components/editor/RibbonView';
import NavigationPane from '@/components/editor/NavigationPane';
import OptionsDialog from '@/components/editor/OptionsDialog';
import { useAppOptions } from '@/hooks/use-app-options';
import { useFileOpen, titleFromFileName } from '@/hooks/use-file-open';
import { FONT_VALUE } from '@/components/editor/RibbonHome';

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const Editor = () => {
  const {
    documents,
    active,
    activeId,
    setActiveId,
    createDocument,
    updateDocument,
    removeDocument,
    importDocument,
  } = useDocuments();

  const editorRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const [zoom, setZoom] = useState(100);
  const [tab, setTab] = useState<RibbonTab>('Главная');
  const [fileMenu, setFileMenu] = useState(false);
  const [pinned, setPinned] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('pv-tekst-pinned') ?? '[]');
    } catch {
      return [];
    }
  });
  const [findOpen, setFindOpen] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [fontFamily, setFontFamily] = useState('Calibri (Основной)');
  const [fontSize, setFontSize] = useState('11');
  const [stats, setStats] = useState({ words: 0, chars: 0, pages: 1 });
  /* параметры печати */
  const [print, setPrint] = useState<PrintSetup>(DEFAULT_PRINT);
  /* ссылка на пересчёт табуляции — хук создаётся ниже */
  const tabsRef = useRef<(() => void) | null>(null);
  const breaksRef = useRef<(() => void) | null>(null);
  /* колонтитулы и номера страниц */
  const [furniture, setFurniture] = useState<PageFurniture>(DEFAULT_FURNITURE);
  const [furnitureOpen, setFurnitureOpen] = useState(false);
  const [furniturePart, setFurniturePart] = useState<'header' | 'footer'>('header');

  /* работа с таблицами */
  const [showMarks, setShowMarks] = useState(false);

  /* конструктор */
  const [theme, setTheme] = useState<DocTheme>(THEMES[0]);
  const [paraSpacing, setParaSpacing] = useState(8);
  const [watermark, setWatermark] = useState('');
  const [pageColor, setPageColor] = useState('#ffffff');
  const [pageBorder, setPageBorder] = useState(false);

  /* открытие файлов: Проводник, кнопка «Открыть» и перетаскивание */
  const { pickFile, dragging } = useFileOpen(
    useCallback(
      (file) => {
        importDocument(titleFromFileName(file.name), file.html);
        toast({ title: 'Документ открыт', description: file.name });
      },
      [importDocument],
    ),
    useCallback(
      (message: string) =>
        toast({ title: 'Не удалось открыть файл', description: message }),
      [],
    ),
  );

  /* параметры приложения */
  const { options, setOptions, reset: resetOptions } = useAppOptions();
  const [optionsOpen, setOptionsOpen] = useState(false);

  /* вид */
  const [viewMode, setViewMode] = useState<ViewMode>('print');
  const [showRuler, setShowRuler] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [pageFlow, setPageFlow] = useState<'vertical' | 'horizontal'>('vertical');
  const [splitView, setSplitView] = useState(false);

  /* макет */
  const [setup, setSetup] = useState<PageSetup>(DEFAULT_SETUP);
  const patchSetup = useCallback(
    (patch: Partial<PageSetup>) => setSetup((s) => ({ ...s, ...patch })),
    [],
  );

  const pageHeight = setup.landscape ? PAGE_WIDTH : PAGE_HEIGHT;
  const contentHeight = pageHeight - setup.margin * CM * 2;

  const recount = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const text = el.innerText.replace(/\u00a0/g, ' ');
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.replace(/\n/g, '').length;
    /* высоту берём по последнему абзацу: сам лист всегда растянут на страницу */
    const last = el.lastElementChild as HTMLElement | null;
    const filled = last
      ? last.offsetTop - el.offsetTop + last.offsetHeight
      : el.scrollHeight;

    const pages = Math.max(1, Math.ceil((filled - 2) / contentHeight));
    setStats({ words, chars, pages });
  }, [contentHeight]);

  useEffect(() => {
    if (editorRef.current && active) {
      editorRef.current.innerHTML = active.html;
      setFurniture(
        (active.furniture as PageFurniture | undefined) ?? DEFAULT_FURNITURE,
      );
      recount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const persist = useCallback(() => {
    if (!editorRef.current || !active) return;
    updateDocument(active.id, {
      html: editorRef.current.innerHTML,
      furniture,
    });
    setSavedAt(Date.now());
  }, [active, updateDocument, furniture]);

  /* защита от потери несохранённых правок */
  const guardApi = useUnsavedGuard({
    getHtml: useCallback(() => editorRef.current?.innerHTML ?? '', []),
    docId: active?.id ?? null,
  });

  const { check: checkDirty, markSaved } = guardApi;

  const handleInput = useCallback(() => {
    /* сперва растягиваем разрывы — от них зависит число страниц */
    breaksRef.current?.();
    tabsRef.current?.();
    recount();
    checkDirty();
  }, [recount, checkDirty]);

  useEffect(() => {
    if (!options.autoSave) return;
    const id = window.setInterval(() => {
      if (editorRef.current && active) {
        updateDocument(active.id, { html: editorRef.current.innerHTML });
        setSavedAt(Date.now());
        markSaved();
      }
    }, Math.max(1, options.autoSaveMinutes) * 60_000);
    return () => window.clearInterval(id);
  }, [
    active,
    updateDocument,
    markSaved,
    options.autoSave,
    options.autoSaveMinutes,
  ]);

  /* знаки форматирования и подсветка ошибок из параметров */
  useEffect(() => {
    const root = editorRef.current;
    if (!root) return;
    root.classList.toggle('pv-marks', options.showFormatMarks || showMarks);
    root.spellcheck = options.checkSpelling && !options.hideSpellErrors;
  }, [
    options.showFormatMarks,
    showMarks,
    options.checkSpelling,
    options.hideSpellErrors,
    viewMode,
  ]);

  const exec = useCallback(
    (command: string, value?: string) => {
      editorRef.current?.focus();
      document.execCommand(command, false, value);
      recount();
    },
    [recount],
  );

  const refs = useReferences({
    editorRef,
    exec,
    recount,
    notify: (title, description) => toast({ title, description }),
    pageCount: () => stats.pages,
  });

  const review = useReview({
    editorRef,
    exec,
    recount,
    notify: (title, description) => toast({ title, description }),
    words: stats.words,
    chars: stats.chars,
    pages: stats.pages,
  });

  /* форматирование символов, абзацев и списков */
  const fmt = useFormat({
    editorRef,
    exec,
    recount,
    notify: (title, description) => toast({ title, description }),
  });

  const openFurniture = useCallback((part: 'header' | 'footer') => {
    setFurniturePart(part);
    setFurnitureOpen(true);
  }, []);

  const docStyles = useStyles({
    editorRef,
    recount,
    notify: (title, description) => toast({ title, description }),
  });

  const charts = useCharts({
    editorRef,
    exec,
    recount,
    notify: (title, description) => toast({ title, description }),
  });

  const [inEquation, setInEquation] = useState(false);

  const equation = useEquation({
    editorRef,
    exec,
    recount,
    notify: (title, description) => toast({ title, description }),
    onActive: setInEquation,
  });

  const inserts = useInserts({
    editorRef,
    exec,
    recount,
    notify: (title, description) => toast({ title, description }),
  });

  /* поля даты показывают сегодняшнее число при открытии документа */
  useEffect(() => {
    inserts.refreshFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const shapes = useShapes({
    editorRef,
    exec,
    recount,
    notify: (title, description) => toast({ title, description }),
  });

  const autocorrect = useAutoCorrect({
    editorRef,
    exec,
    notify: (title, description) => toast({ title, description }),
  });

  const borders = useBorders({
    editorRef,
    recount,
    notify: (title, description) => toast({ title, description }),
  });

  const breaks = useBreaks({
    editorRef,
    exec,
    recount,
    notify: (title, description) => toast({ title, description }),
    contentHeight:
      (setup.landscape ? PAGE_WIDTH : PAGE_HEIGHT) - setup.margin * CM * 2,
  });

  const tabs = useTabs({
    editorRef,
    exec,
    recount,
    notify: (title, description) => toast({ title, description }),
  });

  tabsRef.current = tabs.realign;
  breaksRef.current = breaks.relayout;

  const tables = useTables({
    editorRef,
    exec,
    recount,
    notify: (title, description) => toast({ title, description }),
  });

  /* вышли из таблицы — контекстная вкладка закрывается */
  useEffect(() => {
    if (!tables.inTable && tab === 'Таблица') setTab('Главная');
  }, [tables.inTable, tab]);

  /* ── вкладка «Вид» ── */
  const applyViewMode = (m: ViewMode) => {
    setViewMode(m);
    const names: Record<ViewMode, string> = {
      read: 'Режим чтения',
      print: 'Разметка страницы',
      web: 'Веб-документ',
      outline: 'Структура',
      draft: 'Черновик',
    };
    if (m === 'read') setZoom(120);
    if (m === 'print') setZoom(100);
    toast({ title: names[m] });
  };

  const getHeadings = useCallback(() => {
    const root = editorRef.current;
    if (!root) return [];
    /* заголовки узнаём и по тегу, и по уровню применённого стиля */
    return Array.from(
      root.querySelectorAll('h1, h2, h3, [data-level]'),
    )
      .filter((h) => h.textContent?.trim())
      .map((h, i) => {
        if (!h.id) h.id = `pv-nav-${i}`;
        const attr = Number(h.getAttribute('data-level'));
        return {
          id: h.id,
          text: h.textContent ?? '',
          level: attr || Number(h.tagName[1]) || 1,
        };
      });
  }, []);

  const goToHeading = (id: string) =>
    editorRef.current
      ?.querySelector(`#${id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const zoomDialog = () => {
    const v = window.prompt('Масштаб, %', String(zoom));
    const n = Number(v);
    if (n >= 10 && n <= 500) setZoom(n);
  };

  const fitWidth = () => {
    const box = editorRef.current?.closest('.flex-1');
    const avail = (box?.clientWidth ?? 900) - 60;
    const w = setup.landscape ? PAGE_HEIGHT : PAGE_WIDTH;
    setZoom(Math.max(20, Math.round((avail / w) * 100)));
  };

  const fitOnePage = () => {
    const box = editorRef.current?.closest('.flex-1');
    const avail = (box?.clientHeight ?? 700) - 60;
    const h = setup.landscape ? PAGE_WIDTH : PAGE_HEIGHT;
    setZoom(Math.max(20, Math.round((avail / h) * 100)));
  };

  const applyFontFamily = (v: string) => {
    setFontFamily(v);
    exec('fontName', (FONT_VALUE[v] ?? v).replace(/'/g, '').split(',')[0]);
  };

  const applyFontSize = (v: string) => {
    setFontSize(v);
    editorRef.current?.focus();
    const px = Math.round(Number(v) * 1.34);
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) {
      document.execCommand('fontSize', false, '7');
      editorRef.current?.querySelectorAll('font[size="7"]').forEach((node) => {
        const el = node as HTMLElement;
        el.removeAttribute('size');
        el.style.fontSize = `${px}px`;
      });
    } else if (editorRef.current) {
      editorRef.current.style.fontSize = `${px}px`;
    }
    recount();
  };

  const onCanvasScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    const page = Math.min(
      stats.pages,
      Math.max(1, Math.floor(top / ((contentHeight * zoom) / 100)) + 1),
    );
    setCurrentPage(page);
  };

  /* ── файл ── */
  const handleNew = () =>
    guardApi.guard('new', () => {
      createDocument();
      toast({ title: 'Создан новый документ' });
    });

  const handleTemplate = (t: DocTemplate) =>
    guardApi.guard('new', () => {
      importDocument(
        t.title === 'Новый документ' ? 'Документ 1' : t.title,
        t.html,
      );
      toast({ title: 'Документ создан', description: t.title });
    });

  const togglePin = (id: string) =>
    setPinned((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      try {
        localStorage.setItem('pv-tekst-pinned', JSON.stringify(next));
      } catch {
        /* хранилище недоступно */
      }
      return next;
    });

  const handleOpen = () => {
    setFileMenu(false);
    guardApi.guard('open', pickFile);
  };

  const handleSave = useCallback(() => {
    persist();
    guardApi.markSaved();
    toast({ title: 'Документ сохранён' });
  }, [persist, guardApi]);

  const download = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildFullHtml = () => {
    const body = editorRef.current?.innerHTML ?? '';
    const title = active?.title ?? 'Документ';
    const f = furniture;

    /* колонтитулы повторяются на каждом листе средствами печати */
    const field = (text: string) =>
      text
        .replace(/\{СТРАНИЦА\}/gi, '" counter(page) "')
        .replace(/\{ВСЕГО\}/gi, '" counter(pages) "')
        .replace(/\{ИМЯ\}/gi, title)
        .replace(/\{ДАТА\}/gi, new Date().toLocaleDateString('ru-RU'));

    const numberText =
      f.numberPosition === 'none' ? '' : '" counter(page) "';

    const isTop = f.numberPosition.startsWith('top');
    const side = f.numberPosition.split('-')[1] ?? 'center';

    const slot = (position: 'top' | 'bottom', where: string) => {
      const own = position === 'top' ? f.headerText : f.footerText;
      const align = position === 'top' ? f.headerAlign : f.footerAlign;

      const parts: string[] = [];
      if (own && align === where) parts.push(field(own));
      if (numberText && (isTop ? 'top' : 'bottom') === position && side === where)
        parts.push(numberText);

      if (!parts.length) return '';
      return `@${position}-${where} { content: "${parts.join(' ')}"; font-size: 10pt; color: #444 }`;
    };

    const marks = ['left', 'center', 'right']
      .flatMap((w) => [slot('top', w), slot('bottom', w)])
      .filter(Boolean)
      .join(' ');

    const pb = borders.pageBorder;
    const frame =
      pb.enabled && !pb.art
        ? `body::before{content:"";position:fixed;inset:${pb.margin}pt;border:${pb.width}pt ${pb.style} ${pb.color};pointer-events:none}`
        : '';

    const [pw, ph] = PAPER_SIZES[print.paper];
    const size = setup.landscape ? `${ph}mm ${pw}mm` : `${pw}mm ${ph}mm`;

    const page = `@page { size: ${size}; margin: ${setup.margin}cm; ${marks} }`;

    /* какие страницы уйдут на печать и в каком порядке */
    const wanted = pagesToPrint(print, stats.pages, currentPage);
    const order = printOrder(wanted, print);

    return buildPrintHtml({
      body,
      title,
      setup: print,
      pageCss: page,
      bodyCss: `${frame}\n.pv-page-break{page-break-before:always}`,
      contentHeight: contentHeight,
      contentWidth:
        (setup.landscape ? PAGE_HEIGHT : PAGE_WIDTH) - setup.margin * CM * 2,
      pageWidth: setup.landscape ? PAGE_HEIGHT : PAGE_WIDTH,
      pageHeight: setup.landscape ? PAGE_WIDTH : PAGE_HEIGHT,
      padding: setup.margin * CM,
      pages: order,
      landscape: setup.landscape,
    });
  };

  const handleExportHtml = () => {
    /* в файл сохраняем документ целиком, без выбора страниц и копий */
    const body = editorRef.current?.innerHTML ?? '';
    const title = active?.title ?? 'Документ';

    const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${title}</title><style>
body{font-family:Calibri,Arial,sans-serif;line-height:1.5;max-width:21cm;margin:2cm auto}
table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:6px}
</style></head><body>${body}</body></html>`;

    download(html, `${active?.title ?? 'document'}.html`, 'text/html');
    toast({ title: 'Файл HTML сохранён' });
  };

  const handleExportDoc = () => {
    const body = editorRef.current?.innerHTML ?? active?.html ?? '';
    const title = active?.title ?? 'document';

    const bytes = htmlToDocx(body, title, {
      headerText: furniture.headerText,
      footerText: furniture.footerText,
      headerAlign: furniture.headerAlign,
      footerAlign: furniture.footerAlign,
      differentFirst: furniture.differentFirst,
      numberPosition: furniture.numberPosition,
      numberTop: furniture.numberPosition.startsWith('top'),
      numberAlign: (furniture.numberPosition.split('-')[1] ??
        'center') as 'left' | 'center' | 'right',
      pageBorder: borders.pageBorder,
    });
    const blob = new Blob([bytes.slice().buffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.docx`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Документ Word сохранён',
      description: `${title}.docx — откроется в Word с оформлением`,
    });
  };

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) {
      toast({
        title: 'Печать недоступна',
        description: 'Разрешите всплывающие окна в браузере',
      });
      return;
    }
    w.document.write(buildFullHtml());
    w.document.close();
    w.focus();

    /* даём странице отрисоваться, иначе печать уйдёт с пустым листом */
    window.setTimeout(() => w.print(), 250);

    const wanted = pagesToPrint(print, stats.pages, currentPage);

    toast({
      title: 'Документ отправлен на печать',
      description:
        print.copies > 1
          ? `Страниц: ${wanted.length}, копий: ${print.copies}`
          : `Страниц: ${wanted.length}`,
    });
  };

  /* ── вставка ── */
  const insertTable = () => tables.setDialogOpen(true);

  const insertImage = () => imageRef.current?.click();

  const onImagePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => exec('insertHTML', `<img src="${reader.result}" alt="">`);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  /* ── буфер обмена ── */
  const handleCopy = () => exec('copy');
  const handleCut = () => exec('cut');
  const handlePaste = async () => {
    editorRef.current?.focus();
    try {
      const text = await navigator.clipboard.readText();
      exec('insertText', text);
    } catch {
      toast({
        title: 'Вставка из буфера',
        description: 'Нажмите Ctrl+V — браузер не даёт доступ к буферу',
      });
    }
  };

  /* ── поиск и замена ── */
  const replaceInDoc = (
    query: string,
    replacement: string,
    all: boolean,
    matchCase: boolean,
  ) => {
    const el = editorRef.current;
    if (!el) return 0;
    const flags = matchCase ? (all ? 'g' : '') : all ? 'gi' : 'i';
    const re = new RegExp(escapeRe(query), flags);
    let count = 0;

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);

    for (const node of nodes) {
      if (!all && count > 0) break;
      const value = node.nodeValue ?? '';
      if (!re.test(value)) continue;
      re.lastIndex = 0;
      const matches = value.match(
        new RegExp(escapeRe(query), matchCase ? 'g' : 'gi'),
      );
      const found = matches ? matches.length : 0;
      node.nodeValue = value.replace(re, replacement);
      count += all ? found : 1;
    }

    if (count > 0) {
      persist();
      recount();
    }
    return count;
  };

  /* Tab внутри списка меняет уровень вложенности, как в Word */
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    const onTab = (e: KeyboardEvent) => {
      /* автозамена разбирает обычный ввод раньше остальных правил */
      if (e.key !== 'Tab') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) autocorrect.handleKey(e);
        return;
      }

      const sel = window.getSelection();
      const node = sel?.anchorNode;
      const start =
        node?.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null);

      /* внутри формулы Tab ведёт к следующему полю ввода */
      if (start?.closest('.pv-equation')) {
        e.preventDefault();
        equation.nextSlot();
        return;
      }

      /* в таблице Tab переходит к следующей ячейке */
      const cell = start?.closest('td, th');
      if (cell) {
        e.preventDefault();
        const all = Array.from(
          cell.closest('table')?.querySelectorAll('td, th') ?? [],
        );
        const next = all[all.indexOf(cell) + (e.shiftKey ? -1 : 1)];

        if (next) {
          const r = document.createRange();
          r.selectNodeContents(next);
          r.collapse(true);
          sel?.removeAllRanges();
          sel?.addRange(r);
          return;
        }

        /* последняя ячейка — добавляем строку, как это делает Word */
        if (!e.shiftKey) tables.addRow('below');
        return;
      }

      if (start?.closest('li')) {
        e.preventDefault();
        exec(e.shiftKey ? 'outdent' : 'indent');
        return;
      }

      /* вне списка Tab переводит текст к следующей позиции табуляции */
      e.preventDefault();
      tabs.handleTabKey();
    };

    el.addEventListener('keydown', onTab);
    return () => el.removeEventListener('keydown', onTab);
  }, [exec, tables, tabs, autocorrect, equation]);

  /* ── горячие клавиши ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === 's') {
        e.preventDefault();
        handleSave();
      } else if (k === 'f' || k === 'h') {
        e.preventDefault();
        setFindOpen(true);
      } else if (k === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-white font-body">
      <DropOverlay visible={dragging} />
      <UnsavedDialog
        action={guardApi.pending}
        title={active?.title ?? ''}
        onSave={() => guardApi.confirmSave(handleSave)}
        onDiscard={guardApi.discard}
        onCancel={guardApi.cancel}
      />
      <WindowTitleBar
        title={active?.title ?? ''}
        dirty={guardApi.dirty}
        onClose={guardApi.requestClose}
        onSave={handleSave}
        onUndo={() => exec('undo')}
        onRedo={() => exec('redo')}
      />

      <Ribbon
        tab={tab}
        onTab={setTab}
        onFileMenu={() => setFileMenu(true)}
        onCommand={exec}
        fontFamily={fontFamily}
        fontSize={fontSize}
        onFontFamily={applyFontFamily}
        onFontSize={applyFontSize}
        onFind={() => setFindOpen(true)}
        onReplace={() => setFindOpen(true)}
        onPaste={handlePaste}
        onCopy={handleCopy}
        onCut={handleCut}
        inTable={tables.inTable}
        onInsertRow={tables.addRow}
        onInsertColumn={tables.addColumn}
        onDeleteRow={tables.removeRow}
        onDeleteColumn={tables.removeColumn}
        onDeleteTable={tables.removeTable}
        onMerge={tables.merge}
        onSplitCell={tables.split}
        onTableBorders={tables.borders}
        onCellShading={tables.shading}
        onBorderColor={tables.changeBorderColor}
        onAlign={tables.align}
        onStyle={tables.style}
        onSort={tables.sort}
        onSum={tables.sum}
        onHeaderFooter={openFurniture}
        onBreak={breaks.insert}
        onShapes={() => shapes.setShapeDialog(true)}
        onTextBox={shapes.insertTextBox}
        onWordArt={() => shapes.setWordArtDialog(true)}
        onWrap={shapes.setWrap}
        onOrder={shapes.setOrder}
        onSymbol={() => inserts.setSymbolOpen(true)}
        onDateTime={() => inserts.setDateOpen(true)}
        onQuickParts={() => inserts.setPartsOpen(true)}
        inEquation={inEquation}
        onEquationNew={equation.insertNew}
        onEquationStructure={equation.insertStructure}
        onEquationSymbol={equation.insertSymbol}
        onEquationReady={equation.insertReady}
        onEquationDisplay={equation.toggleDisplay}
        onEquationRemove={equation.removeEquation}
        onChart={charts.open}
        onRemoveBreak={breaks.removeOne}
        onRemoveAllBreaks={breaks.removeAll}
        styles={docStyles.styles}
        activeStyle={docStyles.activeId}
        onStyleApply={docStyles.apply}
        onStylesPane={() => docStyles.setPaneOpen(true)}
        onStyleCreate={docStyles.create}
        onStyleUpdate={docStyles.updateFromSelection}
        onStyleClear={docStyles.clear}
        onFormatPainter={fmt.pasteFormat}
        hasSample={fmt.hasSample}
        onFontDialog={fmt.openFont}
        onParaDialog={fmt.openPara}
        onChangeCase={fmt.applyCase}
        onLineSpacing={fmt.setLineSpacing}
        onFormatMarks={() => setShowMarks((v) => !v)}
        formatMarks={showMarks || options.showFormatMarks}
        onSortList={() => fmt.sortList()}
        onMultilevel={fmt.multilevel}
        onBullets={fmt.toggleBullets}
        onNumbering={fmt.toggleNumbering}
        onBullet={fmt.setBullet}
        onNumberFormat={fmt.setNumberFormat}
        onRestartNumbering={fmt.restartNumbering}
        onBorders={borders.open}
        onBorderSide={borders.quickSide}
        onShading={borders.shade}
        onInsertTable={insertTable}
        onInsertImage={insertImage}
        onPrint={handlePrint}
        onNew={handleNew}
        onZoom={setZoom}
        zoom={zoom}
        theme={theme}
        onTheme={setTheme}
        paraSpacing={paraSpacing}
        onParaSpacing={setParaSpacing}
        watermark={watermark}
        onWatermark={setWatermark}
        pageColor={pageColor}
        onPageColor={setPageColor}
        pageBorder={pageBorder}
        onPageBorder={setPageBorder}
        onPageBorderDialog={borders.openPage}
        setup={setup}
        onSetup={patchSetup}
        citeStyle={refs.citeStyle}
        onCiteStyle={refs.setCiteStyle}
        onToc={refs.buildToc}
        onTocUpdate={refs.updateToc}
        onTocAddText={refs.addTocText}
        onFootnote={() => refs.addNote('foot')}
        onEndnote={() => refs.addNote('end')}
        onNextNote={refs.nextNote}
        onShowNotes={refs.showNotes}
        onCitation={refs.addCitation}
        onSources={refs.manageSources}
        onBibliography={refs.buildBibliography}
        onCaption={refs.addCaption}
        onFigureList={refs.buildFigureList}
        onCrossRef={refs.addCrossRef}
        onIndexMark={refs.markIndex}
        onIndexBuild={refs.buildIndex}
        onAuthorityMark={refs.markAuthority}
        onAuthorityBuild={refs.buildAuthorities}
        hasNotes={!!refs.count('sup.pv-fn, sup.pv-en')}
        hasToc={!!refs.count('.pv-toc')}
        hasIndex={!!refs.count('.pv-indexlist')}
        hasFigures={!!refs.count('.pv-figlist')}
        onSpelling={review.spelling}
        onThesaurus={review.thesaurus}
        onStats={review.stats}
        onReadAloud={review.readAloud}
        onReadability={review.readability}
        onTranslate={review.translate}
        onLanguage={review.language}
        onNewComment={review.newComment}
        onDeleteComment={review.deleteComment}
        onPrevComment={review.prevComment}
        onNextComment={review.nextComment}
        showComments={review.showComments}
        onToggleComments={review.toggleComments}
        trackChanges={review.trackChanges}
        onToggleTrack={review.toggleTrack}
        onShowMarkup={review.showMarkup}
        onReviewPane={review.reviewPane}
        onAcceptChange={review.acceptChange}
        onRejectChange={review.rejectChange}
        onCompare={review.compare}
        onRestrict={review.restrict}
        markupView={review.markupView}
        onMarkupView={review.applyMarkupView}
        hasComments={!!review.count('.pv-comment')}
        hasChanges={!!review.count('.pv-ins, .pv-del')}
        viewMode={viewMode}
        onViewMode={applyViewMode}
        showRuler={showRuler}
        onShowRuler={setShowRuler}
        showGrid={showGrid}
        onShowGrid={setShowGrid}
        showNav={showNav}
        onShowNav={setShowNav}
        pageFlow={pageFlow}
        onPageFlow={setPageFlow}
        onZoomDialog={zoomDialog}
        onFitWidth={fitWidth}
        onOnePage={fitOnePage}
        onManyPages={() => setZoom(50)}
        onNewWindow={() => window.open(window.location.href, '_blank')}
        onArrangeAll={() => setZoom(60)}
        onSplit={() => setSplitView((v) => !v)}
        splitView={splitView}
        onMacros={() =>
          toast({
            title: 'Макросы',
            description: 'Запись макросов в этой версии недоступна',
          })
        }
        onProperties={() => setFileMenu(true)}
      />

      {showRuler && viewMode === 'print' && (
        <DocRuler
          zoom={zoom}
          pageWidth={setup.landscape ? PAGE_HEIGHT : PAGE_WIDTH}
          padding={setup.margin * CM}
          tabStops={tabs.stops}
          tabAlign={tabs.align}
          onTabAlign={tabs.cycleAlign}
          onAddTab={tabs.add}
          onRemoveTab={tabs.remove}
        />
      )}

      <div className="flex min-h-0 flex-1">
        {showNav && (
          <NavigationPane
            getHeadings={getHeadings}
            onGo={goToHeading}
            onClose={() => setShowNav(false)}
            refreshKey={stats.words}
          />
        )}

        <DocumentCanvas
          ref={editorRef}
          zoom={zoom}
          pages={stats.pages}
          onInput={handleInput}
          onScroll={onCanvasScroll}
          theme={theme}
          setup={setup}
          paraSpacing={paraSpacing}
          watermark={watermark}
          pageColor={pageColor}
          pageBorder={pageBorder}
          pageBorderSetup={borders.pageBorder}
          viewMode={viewMode}
          showGrid={showGrid}
          pageFlow={pageFlow}
          splitView={splitView}
          furniture={furniture}
          docTitle={active?.title ?? ''}
          onEditFurniture={openFurniture}
        />

        <StylesPane
          open={docStyles.paneOpen}
        styles={docStyles.styles}
          activeId={docStyles.activeId}
          onClose={() => docStyles.setPaneOpen(false)}
          onApply={docStyles.apply}
          onEdit={docStyles.edit}
          onCreate={docStyles.create}
          onClear={docStyles.clear}
        />
      </div>

      {options.showStatusBar && (
        <StatusBar
          words={stats.words}
          chars={stats.chars}
          pages={stats.pages}
          currentPage={currentPage}
          zoom={zoom}
          onZoom={setZoom}
          savedAt={savedAt}
          section={breaks.section}
          sections={breaks.sections}
        />
      )}

      <OptionsDialog
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        options={options}
        onApply={(o) => {
          setOptions(o);
          setOptionsOpen(false);
          toast({ title: 'Параметры сохранены' });
        }}
        onReset={() => {
          resetOptions();
          toast({ title: 'Параметры сброшены' });
        }}
      />

      <FileMenu
        open={fileMenu}
        currentPage={currentPage}
        print={print}
        onPrintSetup={(patch) => setPrint((x) => ({ ...x, ...patch }))}
        onClose={() => setFileMenu(false)}
        documents={documents}
        activeId={activeId}
        onSelect={(id) => guardApi.guard('switch', () => setActiveId(id))}
        onRemove={removeDocument}
        onNew={handleNew}
        onTemplate={handleTemplate}
        pinned={pinned}
        onTogglePin={togglePin}
        onOpen={handleOpen}
        onSave={handleSave}
        onExportHtml={handleExportHtml}
        onExportDoc={handleExportDoc}
        onPrint={handlePrint}
        title={active?.title ?? ''}
        onTitle={(v) => active && updateDocument(active.id, { title: v })}
        theme={theme}
        setup={setup}
        onSetup={patchSetup}
        pages={stats.pages}
        getHtml={() => editorRef.current?.innerHTML ?? active?.html ?? ''}
        onOptions={() => {
          setFileMenu(false);
          setOptionsOpen(true);
        }}
      />

      <ChartDialog
        open={charts.dialogOpen}
        initial={charts.initial}
        onClose={() => charts.setDialogOpen(false)}
        onApply={charts.apply}
      />

      <SymbolDialog
        open={inserts.symbolOpen}
        onClose={() => inserts.setSymbolOpen(false)}
        onPick={inserts.insertSymbol}
      />

      <DateTimeDialog
        open={inserts.dateOpen}
        onClose={() => inserts.setDateOpen(false)}
        onPick={inserts.insertDate}
      />

      <QuickPartsDialog
        open={inserts.partsOpen}
        parts={inserts.parts}
        onClose={() => inserts.setPartsOpen(false)}
        onPick={inserts.insertPart}
        onRemove={inserts.removePart}
        onSaveSelection={inserts.savePart}
      />

      <ShapesGallery
        open={shapes.shapeDialog}
        onClose={() => shapes.setShapeDialog(false)}
        onPick={shapes.insertShape}
      />

      <WordArtGallery
        open={shapes.wordArtDialog}
        onClose={() => shapes.setWordArtDialog(false)}
        onPick={shapes.insertWordArt}
      />

      <AutoCorrectDialog
        open={autocorrect.dialogOpen}
        initial={autocorrect.setup}
        onClose={() => autocorrect.setDialogOpen(false)}
        onApply={(s) => {
          autocorrect.setSetup(s);
          autocorrect.setDialogOpen(false);
          toast({ title: 'Параметры автозамены сохранены' });
        }}
      />

      <BordersDialog
        open={borders.dialogOpen}
        initial={borders.initial}
        pageInitial={borders.pageBorder}
        onClose={() => borders.setDialogOpen(false)}
        onApply={borders.apply}
        onApplyPage={borders.applyPage}
        startOnPage={borders.pageTab}
      />

      <HeaderFooterDialog
        open={furnitureOpen}
        initial={furniture}
        part={furniturePart}
        onClose={() => setFurnitureOpen(false)}
        onApply={(f) => {
          setFurniture(f);
          setFurnitureOpen(false);
          toast({ title: 'Колонтитулы обновлены' });
        }}
      />

      <StyleDialog
        open={docStyles.dialogOpen}
        initial={docStyles.editing}
        onClose={() => docStyles.setDialogOpen(false)}
        onSave={docStyles.save}
        onDelete={docStyles.remove}
      />

      <TabsDialog
        open={tabs.dialogOpen}
        stops={tabs.stops}
        onClose={() => tabs.setDialogOpen(false)}
        onApply={tabs.applyAll}
      />

      <TableDialog
        open={tables.dialogOpen}
        onClose={() => tables.setDialogOpen(false)}
        onInsert={tables.insert}
      />

      <FontDialog
        open={fmt.fontOpen}
        initial={fmt.charInit}
        onClose={() => fmt.setFontOpen(false)}
        onApply={fmt.applyFont}
      />

      <ParagraphDialog
        open={fmt.paraOpen}
        initial={fmt.paraInit}
        onClose={() => fmt.setParaOpen(false)}
        onApply={fmt.applyPara}
        onTabs={() => {
          fmt.setParaOpen(false);
          tabs.setDialogOpen(true);
        }}
      />

      <FindReplaceDialog
        open={findOpen}
        onOpenChange={setFindOpen}
        onReplace={replaceInDoc}
      />

      <input
        ref={imageRef}
        type="file"
        accept="image/*"
        onChange={onImagePicked}
        className="hidden"
      />
    </div>
  );
};

export default Editor;