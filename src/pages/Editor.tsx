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
import type { DocTemplate } from '@/components/editor/fileTemplates';
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
  const fileRef = useRef<HTMLInputElement>(null);
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

  /* конструктор */
  const [theme, setTheme] = useState<DocTheme>(THEMES[0]);
  const [paraSpacing, setParaSpacing] = useState(8);
  const [watermark, setWatermark] = useState('');
  const [pageColor, setPageColor] = useState('#ffffff');
  const [pageBorder, setPageBorder] = useState(false);

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
    const pages = Math.max(1, Math.ceil(el.scrollHeight / contentHeight));
    setStats({ words, chars, pages });
  }, [contentHeight]);

  useEffect(() => {
    if (editorRef.current && active) {
      editorRef.current.innerHTML = active.html;
      recount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const persist = useCallback(() => {
    if (!editorRef.current || !active) return;
    updateDocument(active.id, { html: editorRef.current.innerHTML });
    setSavedAt(Date.now());
  }, [active, updateDocument]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (editorRef.current && active) {
        updateDocument(active.id, { html: editorRef.current.innerHTML });
      }
    }, 8000);
    return () => window.clearInterval(id);
  }, [active, updateDocument]);

  const exec = useCallback(
    (command: string, value?: string) => {
      editorRef.current?.focus();
      document.execCommand(command, false, value);
      recount();
    },
    [recount],
  );

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
  const handleNew = () => {
    persist();
    createDocument();
    toast({ title: 'Создан новый документ' });
  };

  const handleTemplate = (t: DocTemplate) => {
    persist();
    importDocument(t.title === 'Новый документ' ? 'Документ 1' : t.title, t.html);
    toast({ title: 'Документ создан', description: t.title });
  };

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

  const handleOpen = () => fileRef.current?.click();

  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result ?? '');
      const isHtml = /\.(html?|doc)$/i.test(file.name);
      const html = isHtml
        ? raw.replace(/^[\s\S]*?<body[^>]*>|<\/body>[\s\S]*$/gi, '')
        : raw
            .split(/\n{2,}/)
            .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
            .join('');
      importDocument(file.name.replace(/\.[^.]+$/, ''), html);
      setFileMenu(false);
      toast({ title: 'Документ открыт', description: file.name });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSave = () => {
    persist();
    toast({ title: 'Документ сохранён' });
  };

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
    return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${
      active?.title ?? 'Документ'
    }</title><style>body{font-family:Calibri,Arial,sans-serif;max-width:21cm;margin:2cm auto;line-height:1.5}table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:6px}</style></head><body>${body}</body></html>`;
  };

  const handleExportHtml = () => {
    download(buildFullHtml(), `${active?.title ?? 'document'}.html`, 'text/html');
    toast({ title: 'Файл HTML сохранён' });
  };

  const handleExportDoc = () => {
    download(
      buildFullHtml(),
      `${active?.title ?? 'document'}.doc`,
      'application/msword',
    );
    toast({ title: 'Файл DOC сохранён' });
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
    w.print();
  };

  /* ── вставка ── */
  const insertTable = () => {
    let html = '<table><thead><tr>';
    for (let c = 0; c < 3; c += 1) html += `<th>Заголовок ${c + 1}</th>`;
    html += '</tr></thead><tbody>';
    for (let r = 0; r < 3; r += 1) {
      html += '<tr>';
      for (let c = 0; c < 3; c += 1) html += '<td>&nbsp;</td>';
      html += '</tr>';
    }
    html += '</tbody></table><p><br></p>';
    exec('insertHTML', html);
  };

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
      <WindowTitleBar
        title={active?.title ?? ''}
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
        setup={setup}
        onSetup={patchSetup}
      />

      <DocRuler
        zoom={zoom}
        pageWidth={setup.landscape ? PAGE_HEIGHT : PAGE_WIDTH}
        padding={setup.margin * CM}
      />

      <DocumentCanvas
        ref={editorRef}
        zoom={zoom}
        pages={stats.pages}
        onInput={recount}
        onScroll={onCanvasScroll}
        theme={theme}
        setup={setup}
        paraSpacing={paraSpacing}
        watermark={watermark}
        pageColor={pageColor}
        pageBorder={pageBorder}
      />

      <StatusBar
        words={stats.words}
        chars={stats.chars}
        pages={stats.pages}
        currentPage={currentPage}
        zoom={zoom}
        onZoom={setZoom}
        savedAt={savedAt}
      />

      <FileMenu
        open={fileMenu}
        onClose={() => setFileMenu(false)}
        documents={documents}
        activeId={activeId}
        onSelect={setActiveId}
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
      />

      <FindReplaceDialog
        open={findOpen}
        onOpenChange={setFindOpen}
        onReplace={replaceInDoc}
      />

      <input
        ref={fileRef}
        type="file"
        accept=".txt,.html,.htm,.doc,.md"
        onChange={onFilePicked}
        className="hidden"
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