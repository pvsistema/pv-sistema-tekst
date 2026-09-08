import { useCallback, useEffect, useState } from 'react';

export interface PvDocument {
  id: string;
  title: string;
  html: string;
  updatedAt: number;
}

const STORAGE_KEY = 'pv-tekst-documents';

/** Пустой документ — с него начинается работа при запуске программы */
export const BLANK_HTML = '<p><br></p>';

const blank = (): PvDocument => ({
  id: `doc-${Date.now()}`,
  title: 'Новый документ',
  html: BLANK_HTML,
  updatedAt: Date.now(),
});

/** Документ, в котором пользователь ничего не написал */
const isBlank = (d: PvDocument) =>
  !d.html.replace(/<[^>]*>/g, '').replace(/&nbsp;|\s/g, '');

const load = (): PvDocument[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PvDocument[];
      if (Array.isArray(parsed)) return parsed.filter((d) => d?.id && !isBlank(d));
    }
  } catch {
    /* хранилище недоступно — работаем в памяти */
  }
  return [];
};

/**
 * Список документов. При запуске программы всегда открыт чистый лист,
 * а прежние документы остаются доступны в списке недавних.
 */
export const useDocuments = () => {
  const [initial] = useState<PvDocument[]>(() => [blank(), ...load()]);
  const [documents, setDocuments] = useState<PvDocument[]>(initial);
  const [activeId, setActiveId] = useState<string>(initial[0].id);

  useEffect(() => {
    try {
      /* пустые черновики не засоряют список недавних */
      const keep = documents.filter((d) => !isBlank(d)).slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keep));
    } catch {
      /* пропускаем */
    }
  }, [documents]);

  const active =
    documents.find((d) => d.id === activeId) ?? documents[0] ?? null;

  const createDocument = useCallback(() => {
    const doc = blank();
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
        /* удалили последний — оставляем чистый лист */
        if (!next.length) {
          const fresh = blank();
          setActiveId(fresh.id);
          return [fresh];
        }
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