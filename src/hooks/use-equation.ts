import { useCallback, useEffect, useState } from 'react';
import { SLOT, wrapEquation } from '@/lib/equation';

interface Options {
  editorRef: React.RefObject<HTMLDivElement>;
  exec: (command: string, value?: string) => void;
  recount: () => void;
  notify: (title: string, description?: string) => void;
  /** Открыть контекстную вкладку конструктора */
  onActive: (active: boolean) => void;
}

/** Конструктор формул: вставка структур и символов */
export const useEquation = ({
  editorRef,
  exec,
  recount,
  notify,
  onActive,
}: Options) => {
  const [current, setCurrent] = useState<HTMLElement | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);

  /** Ставит курсор в первое пустое поле формулы */
  const focusFirstSlot = useCallback((root: HTMLElement) => {
    const slots = root.querySelectorAll<HTMLElement>('.pv-eq-slot');

    const target =
      [...slots].find((s) => !s.textContent?.trim()) ?? slots[slots.length - 1];

    if (!target) return;

    const range = document.createRange();
    range.selectNodeContents(target);
    range.collapse(true);

    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, []);

  /** Отмечает формулу, внутри которой стоит курсор */
  const track = useCallback(() => {
    const node = window.getSelection()?.anchorNode;

    const el = (
      node?.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element)
    )?.closest?.('.pv-equation') as HTMLElement | null;

    editorRef.current
      ?.querySelectorAll('.pv-equation-active')
      .forEach((x) => x.classList.remove('pv-equation-active'));

    if (el && editorRef.current?.contains(el)) {
      el.classList.add('pv-equation-active');
      setCurrent(el);
      onActive(true);
      return;
    }

    setCurrent(null);
    onActive(false);
  }, [editorRef, onActive]);

  useEffect(() => {
    document.addEventListener('selectionchange', track);
    return () => document.removeEventListener('selectionchange', track);
  }, [track]);

  /** Создаёт пустую формулу и ставит в неё курсор */
  const insertNew = useCallback(
    (display = false) => {
      exec('insertHTML', wrapEquation(SLOT, display) + '&nbsp;');

      /* даём разметке появиться, затем целимся в пустое поле */
      window.setTimeout(() => {
        const list = editorRef.current?.querySelectorAll<HTMLElement>(
          '.pv-equation',
        );
        const last = list?.[list.length - 1];
        if (last) focusFirstSlot(last);
        track();
      }, 0);

      recount();
      notify(
        'Формула добавлена',
        'Выберите структуру на вкладке «Конструктор формул»',
      );
    },
    [exec, editorRef, focusFirstSlot, track, recount, notify],
  );

  /** Вставляет структуру внутрь текущей формулы */
  const insertStructure = useCallback(
    (html: string) => {
      if (!current) {
        /* формулы ещё нет — создаём её вместе со структурой */
        exec('insertHTML', wrapEquation(html) + '&nbsp;');

        window.setTimeout(() => {
          const list = editorRef.current?.querySelectorAll<HTMLElement>(
            '.pv-equation',
          );
          const last = list?.[list.length - 1];
          if (last) focusFirstSlot(last);
          track();
        }, 0);

        recount();
        return;
      }

      exec('insertHTML', html);

      window.setTimeout(() => {
        if (current) focusFirstSlot(current);
      }, 0);

      recount();
    },
    [current, exec, editorRef, focusFirstSlot, track, recount],
  );

  /** Вставляет символ в текущее поле */
  const insertSymbol = useCallback(
    (char: string) => {
      exec('insertText', char);
      recount();
    },
    [exec, recount],
  );

  /** Готовая формула из галереи */
  const insertReady = useCallback(
    (html: string, label: string) => {
      exec('insertHTML', wrapEquation(html, true) + '<p><br></p>');
      recount();
      notify('Формула вставлена', label);
    },
    [exec, recount, notify],
  );

  /** Переключает формулу между строкой и отдельным абзацем */
  const toggleDisplay = useCallback(() => {
    if (!current) {
      notify('Установите курсор в формулу');
      return;
    }

    current.classList.toggle('pv-equation-block');
    recount();

    notify(
      current.classList.contains('pv-equation-block')
        ? 'Формула вынесена в отдельную строку'
        : 'Формула помещена в строку текста',
    );
  }, [current, recount, notify]);

  /** Переход к следующему полю ввода — клавиша Tab внутри формулы */
  const nextSlot = useCallback((): boolean => {
    if (!current) return false;

    const slots = [
      ...current.querySelectorAll<HTMLElement>('.pv-eq-slot'),
    ];

    const node = window.getSelection()?.anchorNode;
    const here = (
      node?.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element)
    )?.closest?.('.pv-eq-slot') as HTMLElement | null;

    const index = here ? slots.indexOf(here) : -1;
    const target = slots[index + 1];

    if (!target) return false;

    const range = document.createRange();
    range.selectNodeContents(target);
    range.collapse(false);

    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    return true;
  }, [current]);

  const removeEquation = useCallback(() => {
    if (!current) {
      notify('Установите курсор в формулу');
      return;
    }

    current.remove();
    setCurrent(null);
    onActive(false);
    recount();
    notify('Формула удалена');
  }, [current, onActive, recount, notify]);

  return {
    current,
    galleryOpen,
    setGalleryOpen,
    insertNew,
    insertStructure,
    insertSymbol,
    insertReady,
    toggleDisplay,
    nextSlot,
    removeEquation,
  };
};
