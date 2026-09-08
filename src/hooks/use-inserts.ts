import { useCallback, useEffect, useState } from 'react';
import type { QuickPart } from '@/lib/symbols';
import { dateFormats, loadParts, saveParts } from '@/lib/symbols';

interface Options {
  editorRef: React.RefObject<HTMLDivElement>;
  exec: (command: string, value?: string) => void;
  recount: () => void;
  notify: (title: string, description?: string) => void;
}

/** Символы, дата и время, экспресс-блоки */
export const useInserts = ({ editorRef, exec, recount, notify }: Options) => {
  const [symbolOpen, setSymbolOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [partsOpen, setPartsOpen] = useState(false);
  const [parts, setParts] = useState<QuickPart[]>(loadParts);

  useEffect(() => {
    saveParts(parts);
  }, [parts]);

  const insertSymbol = useCallback(
    (char: string) => {
      /* неразрывные знаки вставляем разметкой, иначе браузер их схлопнет */
      const invisible = /[\u00a0\u2009\u00ad\u2011]/.test(char);

      if (invisible) {
        exec('insertHTML', `&#${char.codePointAt(0)};`);
      } else {
        exec('insertText', char);
      }

      recount();
    },
    [exec, recount],
  );

  const insertDate = useCallback(
    (text: string, autoUpdate: boolean, formatIndex = 0) => {
      if (autoUpdate) {
        /*
         * Поле обновится при следующем открытии документа. Номер формата
         * храним рядом, иначе при обновлении вид даты потеряется.
         */
        exec(
          'insertHTML',
          `<span class="pv-field" data-field="date" ` +
            `data-format="${formatIndex}">${text}</span>&nbsp;`,
        );
        notify('Дата вставлена', 'Будет обновляться автоматически');
      } else {
        exec('insertText', text);
        notify('Дата вставлена');
      }

      recount();
    },
    [exec, recount, notify],
  );

  const insertPart = useCallback(
    (part: QuickPart) => {
      exec('insertHTML', part.html);
      recount();
      notify('Блок вставлен', part.title);
    },
    [exec, recount, notify],
  );

  /** Сохраняет выделенный фрагмент как свой блок */
  const savePart = useCallback(
    (title: string) => {
      const sel = window.getSelection();

      if (!sel || !sel.rangeCount || sel.isCollapsed) {
        notify('Выделите фрагмент', 'Сначала выделите текст в документе');
        return;
      }

      const range = sel.getRangeAt(0);
      if (!editorRef.current?.contains(range.commonAncestorContainer)) {
        notify('Выделите фрагмент в документе');
        return;
      }

      const holder = document.createElement('div');
      holder.appendChild(range.cloneContents());

      setParts((list) => [
        ...list,
        {
          id: `own-${Date.now()}`,
          title,
          hint: 'Ваш блок',
          category: 'Мои блоки',
          html: holder.innerHTML,
        },
      ]);

      notify('Блок сохранён', title);
    },
    [editorRef, notify],
  );

  const removePart = useCallback((id: string) => {
    setParts((list) => list.filter((p) => p.id !== id));
  }, []);

  /** Обновляет поля даты при открытии документа */
  const refreshFields = useCallback(() => {
    const list = editorRef.current?.querySelectorAll<HTMLElement>(
      '[data-field="date"]',
    );

    if (!list?.length) return;

    const formats = dateFormats(new Date());

    list.forEach((el) => {
      const index = Number(el.dataset.format ?? 0);
      el.textContent = (formats[index] ?? formats[0]).value;
    });
  }, [editorRef]);

  return {
    symbolOpen,
    setSymbolOpen,
    dateOpen,
    setDateOpen,
    partsOpen,
    setPartsOpen,
    parts,
    insertSymbol,
    insertDate,
    insertPart,
    savePart,
    removePart,
    refreshFields,
  };
};
