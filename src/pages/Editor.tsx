import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useDocuments } from '@/hooks/use-documents';
import DocumentSidebar from '@/components/editor/DocumentSidebar';
import EditorToolbar from '@/components/editor/EditorToolbar';
import DocumentCanvas, {
  PAGE_CONTENT_HEIGHT,
} from '@/components/editor/DocumentCanvas';
import FindReplaceDialog from '@/components/editor/FindReplaceDialog';
import StatusBar from '@/components/editor/StatusBar';

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

  const [zoom, setZoom] = useState(90);
  const [findOpen, setFindOpen] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fontFamily, setFontFamily] = useState("'IBM Plex Sans', sans-serif");
  const [fontSize, setFontSize] = useState('16');
  const [stats, setStats] = useState({
    words: 0,
    chars: 0,
    paragraphs: 0,
    pages: 1,
  });

  const recount = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const text = el.innerText.replace(/\u00a0/g, ' ');
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.replace(/\n/g, '').length;
    const paragraphs = el.querySelectorAll('p, h1, h2, li').length;
    const pages = Math.max(1, Math.ceil(el.scrollHeight / PAGE_CONTENT_HEIGHT));
    setStats({ words, chars, paragraphs, pages });
  }, []);

  /* загрузка активного документа в холст */
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

  /* автосохранение */
  const handleInput = useCallback(() => {
    recount();
  }, [recount]);

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
    exec('fontName', v.replace(/'/g, '').split(',')[0]);
  };

  const applyFontSize = (v: string) => {
    setFontSize(v);
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) {
      document.execCommand('fontSize', false, '7');
      editorRef.current
        ?.querySelectorAll('font[size="7"]')
        .forEach((node) => {
          const el = node as HTMLElement;
          el.removeAttribute('size');
          el.style.fontSize = `${v}px`;
        });
    } else if (editorRef.current) {
      editorRef.current.style.fontSize = `${v}px`;
    }
    recount();
  };

  /* ── файл ── */
  const handleNew = () => {
    persist();
    createDocument();
    toast({ title: 'Создан новый документ' });
  };

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
      toast({ title: 'Документ открыт', description: file.name });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSave = () => {
    persist();
    toast({ title: 'Документ сохранён', description: 'Черновик в панели слева' });
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
    }</title><style>body{font-family:'IBM Plex Sans',Arial,sans-serif;max-width:21cm;margin:2cm auto;line-height:1.7}table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:6px}</style></head><body>${body}</body></html>`;
  };

  const handleExportHtml = () => {
    download(buildFullHtml(), `${active?.title ?? 'document'}.html`, 'text/html');
    toast({ title: 'Экспорт в HTML готов' });
  };

  const handleExportDoc = () => {
    download(
      buildFullHtml(),
      `${active?.title ?? 'document'}.doc`,
      'application/msword',
    );
    toast({ title: 'Экспорт в DOC готов' });
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
    const rows = 3;
    const cols = 3;
    let html = '<table><thead><tr>';
    for (let c = 0; c < cols; c += 1) html += `<th>Заголовок ${c + 1}</th>`;
    html += '</tr></thead><tbody>';
    for (let r = 0; r < rows; r += 1) {
      html += '<tr>';
      for (let c = 0; c < cols; c += 1) html += '<td>&nbsp;</td>';
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
      const matches = value.match(new RegExp(escapeRe(query), matchCase ? 'g' : 'gi'));
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

  return (
    <div className="flex h-screen flex-col bg-background font-body">
      {/* шапка редактора */}
      <div className="flex items-center gap-3 border-b border-foreground bg-card px-4 py-2">
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="rounded-sm p-1 text-foreground transition-colors hover:bg-accent lg:hidden"
          aria-label="Список документов"
        >
          <Icon name="PanelLeft" size={18} />
        </button>

        <Link
          to="/"
          className="shrink-0 font-display text-[1.05rem] font-bold tracking-[-0.02em]"
        >
          ПВ-Система <span className="text-primary">Текст</span>
        </Link>

        <span className="hidden h-5 w-px bg-border sm:block" />

        <Input
          value={active?.title ?? ''}
          onChange={(e) =>
            active && updateDocument(active.id, { title: e.target.value })
          }
          className="h-8 max-w-[320px] border-transparent bg-transparent text-[0.9rem] font-medium hover:border-border focus-visible:border-border"
          placeholder="Название документа"
        />

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-[0.8rem] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <Icon name="Save" size={14} />
            <span className="hidden sm:inline">Сохранить</span>
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* панель документов */}
        <div className="hidden w-[264px] shrink-0 lg:block">
          <DocumentSidebar
            documents={documents}
            activeId={activeId}
            onSelect={setActiveId}
            onCreate={handleNew}
            onRemove={removeDocument}
          />
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div
              className="absolute inset-0 bg-foreground/40"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative z-50 w-[264px] animate-fade-in">
              <DocumentSidebar
                documents={documents}
                activeId={activeId}
                onSelect={(id) => {
                  setActiveId(id);
                  setSidebarOpen(false);
                }}
                onCreate={handleNew}
                onRemove={removeDocument}
              />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <EditorToolbar
            onCommand={exec}
            onNew={handleNew}
            onOpen={handleOpen}
            onSave={handleSave}
            onExportHtml={handleExportHtml}
            onExportDoc={handleExportDoc}
            onPrint={handlePrint}
            onInsertTable={insertTable}
            onInsertImage={insertImage}
            onFind={() => setFindOpen(true)}
            fontFamily={fontFamily}
            fontSize={fontSize}
            onFontFamily={applyFontFamily}
            onFontSize={applyFontSize}
          />

          <DocumentCanvas
            ref={editorRef}
            zoom={zoom}
            pages={stats.pages}
            title={active?.title ?? ''}
            onInput={handleInput}
          />

          <StatusBar
            words={stats.words}
            chars={stats.chars}
            paragraphs={stats.paragraphs}
            pages={stats.pages}
            savedAt={savedAt}
            zoom={zoom}
            onZoom={setZoom}
          />
        </div>
      </div>

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
