import { useCallback, useRef, useState } from 'react';
import type { AutoCorrectSetup } from '@/lib/autocorrect';
import {
  DEFAULT_AUTOCORRECT,
  capitalizeAfter,
  correctWord,
  dashReplacement,
  innerQuoteFor,
  listStarter,
  selectLeft,
} from '@/lib/autocorrect';

interface Options {
  editorRef: React.RefObject<HTMLDivElement>;
  exec: (command: string, value?: string) => void;
  notify: (title: string, description?: string) => void;
}

/** Что было заменено — чтобы можно было отменить */
interface LastFix {
  reason: string;
  original: string;
}

/** Автозамена и автоформат при вводе */
export const useAutoCorrect = ({ editorRef, exec, notify }: Options) => {
  const [setup, setSetup] = useState<AutoCorrectSetup>(DEFAULT_AUTOCORRECT);
  const [dialogOpen, setDialogOpen] = useState(false);
  const lastFix = useRef<LastFix | null>(null);

  /** Текст слева от курсора в пределах текущего абзаца */
  const textBefore = useCallback((): { text: string; range: Range } | null => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || !sel.isCollapsed) return null;

    const range = sel.getRangeAt(0);
    const block = (
      range.startContainer.nodeType === Node.TEXT_NODE
        ? range.startContainer.parentElement
        : (range.startContainer as HTMLElement)
    )?.closest('p, h1, h2, h3, h4, li, td, th, div');

    if (!block || !editorRef.current?.contains(block)) return null;

    const probe = range.cloneRange();
    probe.selectNodeContents(block);
    probe.setEnd(range.startContainer, range.startOffset);

    return { text: probe.toString(), range };
  }, [editorRef]);

  /** Заменяет несколько символов слева от курсора */
  const replaceLeft = useCallback(
    (length: number, text: string, asHtml = false) => {
      if (!selectLeft(length)) return;
      exec('insertHTML', asHtml ? text : escapeHtml(text));
    },
    [exec],
  );

  /**
   * Разбирает нажатие клавиши. Возвращает true, если сама вставила
   * символ и обычный ввод больше не нужен.
   */
  const handleKey = useCallback(
    (e: KeyboardEvent): boolean => {
      const info = textBefore();
      if (!info) return false;

      const before = info.text;

      /* кавычки заменяем в момент нажатия */
      if (setup.smartQuotes && (e.key === '"' || e.key === "'")) {
        e.preventDefault();
        const quote = e.key === '"' ? innerQuoteFor(before) : quoteApostrophe();
        exec('insertText', quote);
        lastFix.current = { reason: 'Кавычки', original: e.key };
        return true;
      }

      /* пробел, ввод и знаки конца предложения запускают разбор слова */
      const isBoundary =
        e.key === ' ' || e.key === 'Enter' || '.,!?;:)»'.includes(e.key);

      if (!isBoundary) return false;

      /* дефис между словами превращаем в тире */
      if (setup.dashes && e.key === ' ') {
        const dash = dashReplacement(before);
        if (dash) {
          e.preventDefault();
          replaceLeft(2, '\u00a0— ');
          lastFix.current = { reason: 'Тире', original: '-' };
          return true;
        }
      }

      /* автоматический список: «1. » или «- » в начале строки */
      if (e.key === ' ') {
        const kind = listStarter(`${before} `, setup);
        if (kind) {
          e.preventDefault();
          replaceLeft(before.length, '');
          exec(
            kind === 'bullet'
              ? 'insertUnorderedList'
              : 'insertOrderedList',
          );
          notify(
            'Список создан',
            'Продолжайте вводить — нумерация продолжится сама',
          );
          return true;
        }
      }

      /* исправление слова */
      const fix = correctWord(before, e.key, setup);
      if (fix) {
        e.preventDefault();
        replaceLeft(fix.length, fix.text, fix.text.startsWith('<a '));
        exec('insertText', e.key === 'Enter' ? '' : e.key);

        if (e.key === 'Enter') exec('insertParagraph');

        lastFix.current = {
          reason: fix.reason,
          original: before.slice(-fix.length),
        };
        return true;
      }

      /* прописная в начале предложения */
      const caps = capitalizeAfter(before, setup);
      if (caps) {
        e.preventDefault();
        replaceLeft(caps.length, caps.text);
        exec('insertText', e.key === 'Enter' ? '' : e.key);

        if (e.key === 'Enter') exec('insertParagraph');

        lastFix.current = { reason: caps.reason, original: '' };
        return true;
      }

      return false;
    },
    [textBefore, setup, exec, replaceLeft, notify],
  );

  /** Отменяет последнюю автозамену */
  const undoLast = useCallback(() => {
    if (!lastFix.current) {
      notify('Автозамен не было');
      return;
    }

    exec('undo');
    notify('Автозамена отменена', lastFix.current.reason);
    lastFix.current = null;
  }, [exec, notify]);

  const addEntry = useCallback((from: string, to: string) => {
    setSetup((s) => ({
      ...s,
      entries: [
        ...s.entries.filter((e) => e.from.toLowerCase() !== from.toLowerCase()),
        { from, to },
      ],
    }));
  }, []);

  const removeEntry = useCallback((from: string) => {
    setSetup((s) => ({
      ...s,
      entries: s.entries.filter((e) => e.from !== from),
    }));
  }, []);

  return {
    setup,
    setSetup,
    dialogOpen,
    setDialogOpen,
    handleKey,
    undoLast,
    addEntry,
    removeEntry,
  };
};

/** Апостроф в виде типографского знака */
const quoteApostrophe = () => '\u2019';

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
