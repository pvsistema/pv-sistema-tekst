import { useCallback, useEffect, useState } from 'react';
import type { UserTemplate } from '@/lib/templates';
import { cleanForTemplate, loadTemplates, saveTemplates } from '@/lib/templates';

interface Options {
  editorRef: React.RefObject<HTMLDivElement>;
  notify: (title: string, description?: string) => void;
}

/** Свои шаблоны: сохранение бланка и создание документа по нему */
export const useTemplates = ({ editorRef, notify }: Options) => {
  const [list, setList] = useState<UserTemplate[]>(loadTemplates);
  const [saveOpen, setSaveOpen] = useState(false);

  useEffect(() => {
    saveTemplates(list);
  }, [list]);

  /** Сохраняет текущий документ как бланк */
  const save = useCallback(
    (title: string, hint: string, basedOn?: string) => {
      const html = editorRef.current?.innerHTML ?? '';

      if (!html.replace(/<[^>]+>/g, '').trim()) {
        notify('Документ пуст', 'Сначала подготовьте бланк');
        return;
      }

      const item: UserTemplate = {
        id: `tpl-${Date.now()}`,
        title,
        hint,
        html: cleanForTemplate(html),
        saved: Date.now(),
        basedOn,
      };

      setList((prev) => [item, ...prev]);
      notify('Шаблон сохранён', title);
    },
    [editorRef, notify],
  );

  const remove = useCallback(
    (id: string) => {
      setList((prev) => prev.filter((t) => t.id !== id));
      notify('Шаблон удалён');
    },
    [notify],
  );

  /** Переименование бланка в папке «Шаблоны» */
  const rename = useCallback((id: string, title: string) => {
    setList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title } : t)),
    );
  }, []);

  return { list, saveOpen, setSaveOpen, save, remove, rename };
};
