import { useCallback, useEffect, useState } from 'react';

export interface PvDocument {
  id: string;
  title: string;
  html: string;
  updatedAt: number;
}

const STORAGE_KEY = 'pv-tekst-documents';

const DEFAULT_DOC_HTML = `<h1>О переходе отдела на электронный документооборот</h1>
<p>Прошу согласовать перевод входящей корреспонденции отдела в электронный вид с 1 октября. Шаблоны приказов, актов и служебных записок уже собраны, нумерация страниц и колонтитулы настроены по требованиям делопроизводства.</p>
<p>Печатная копия сохраняет разметку: то, что видно на экране, ложится на лист без сдвигов. Ниже — перечень документов, которые переводятся в электронный вид в первую очередь.</p>
<ul><li>Служебные записки и заявления сотрудников</li><li>Приказы по основной деятельности</li><li>Акты приёма-передачи и накладные</li></ul>
<p>Ответственный за перевод — начальник канцелярии. Срок подготовки шаблонов — до 25 сентября.</p>`;

const createDefaults = (): PvDocument[] => {
  const now = Date.now();
  return [
    {
      id: 'doc-1',
      title: 'Служебная записка',
      html: DEFAULT_DOC_HTML,
      updatedAt: now,
    },
    {
      id: 'doc-2',
      title: 'Приказ № 142-ОД',
      html: '<h1>Приказ № 142-ОД</h1><p>Об утверждении графика отпусков на следующий календарный год.</p>',
      updatedAt: now - 3600_000,
    },
    {
      id: 'doc-3',
      title: 'Курсовая работа',
      html: '<h1>Введение</h1><p>Актуальность темы обусловлена растущим объёмом электронного документооборота в бюджетных организациях.</p>',
      updatedAt: now - 86_400_000,
    },
  ];
};

const load = (): PvDocument[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PvDocument[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    /* storage недоступен — работаем в памяти */
  }
  return createDefaults();
};

export const useDocuments = () => {
  const [documents, setDocuments] = useState<PvDocument[]>(load);
  const [activeId, setActiveId] = useState<string>(() => load()[0].id);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch {
      /* пропускаем */
    }
  }, [documents]);

  const active =
    documents.find((d) => d.id === activeId) ?? documents[0] ?? null;

  const createDocument = useCallback(() => {
    const doc: PvDocument = {
      id: `doc-${Date.now()}`,
      title: 'Новый документ',
      html: '<h1>Заголовок документа</h1><p>Начните вводить текст…</p>',
      updatedAt: Date.now(),
    };
    setDocuments((prev) => [doc, ...prev]);
    setActiveId(doc.id);
    return doc;
  }, []);

  const updateDocument = useCallback(
    (id: string, patch: Partial<Omit<PvDocument, 'id'>>) => {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, ...patch, updatedAt: Date.now() } : d,
        ),
      );
    },
    [],
  );

  const removeDocument = useCallback(
    (id: string) => {
      setDocuments((prev) => {
        const next = prev.filter((d) => d.id !== id);
        if (!next.length) return createDefaults();
        if (id === activeId) setActiveId(next[0].id);
        return next;
      });
    },
    [activeId],
  );

  const importDocument = useCallback((title: string, html: string) => {
    const doc: PvDocument = {
      id: `doc-${Date.now()}`,
      title,
      html,
      updatedAt: Date.now(),
    };
    setDocuments((prev) => [doc, ...prev]);
    setActiveId(doc.id);
    return doc;
  }, []);

  return {
    documents,
    active,
    activeId,
    setActiveId,
    createDocument,
    updateDocument,
    removeDocument,
    importDocument,
  };
};
