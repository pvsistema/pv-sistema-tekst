import { useCallback, useEffect, useState } from 'react';
import type { DocStyle } from '@/lib/doc-styles';
import {
  BUILTIN_STYLES,
  applyStyle,
  clearStyle,
  currentStyleId,
  loadCustomStyles,
  repaintStyle,
  saveCustomStyles,
  styleFromSelection,
} from '@/lib/doc-styles';
import { readCharFormat, readParaFormat } from '@/lib/text-format';

interface Options {
  editorRef: React.RefObject<HTMLDivElement>;
  recount: () => void;
  notify: (title: string, description?: string) => void;
}

/** Стили документа: применение, создание, изменение, область стилей */
export const useStyles = ({ editorRef, recount, notify }: Options) => {
  const [custom, setCustom] = useState<DocStyle[]>(loadCustomStyles);
  const [paneOpen, setPaneOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  /* стиль, который правим; пусто — создаём новый */
  const [editing, setEditing] = useState<DocStyle | null>(null);
  const [activeId, setActiveId] = useState('normal');

  const styles = [...BUILTIN_STYLES, ...custom];
  const root = () => editorRef.current;

  useEffect(() => {
    saveCustomStyles(custom);
  }, [custom]);

  /* подсвечиваем стиль абзаца, в котором стоит курсор */
  useEffect(() => {
    const check = () => setActiveId(currentStyleId(editorRef.current, styles));

    document.addEventListener('selectionchange', check);
    return () => document.removeEventListener('selectionchange', check);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorRef, custom.length]);

  const apply = useCallback(
    (style: DocStyle) => {
      const n = applyStyle(root(), style);

      if (!n) {
        notify(
          style.kind === 'character' ? 'Выделите текст' : 'Установите курсор в абзац',
          style.kind === 'character'
            ? 'Стиль знака применяется к выделенному тексту'
            : undefined,
        );
        return;
      }

      setActiveId(style.id);
      recount();
      notify(`Стиль «${style.name}» применён`);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [recount, notify],
  );

  const applyById = useCallback(
    (id: string) => {
      const style = styles.find((s) => s.id === id);
      if (style) apply(style);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [apply, custom.length],
  );

  /** Создать стиль на основе того, как оформлен текущий текст */
  const create = useCallback(() => {
    const char = readCharFormat(root());
    const para = readParaFormat(root());

    setEditing(
      styleFromSelection(`Стиль ${custom.length + 1}`, char, para, 'paragraph'),
    );
    setDialogOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [custom.length]);

  const edit = useCallback((style: DocStyle) => {
    setEditing(style);
    setDialogOpen(true);
  }, []);

  /** Сохраняет стиль и обновляет все абзацы, которые им размечены */
  const save = useCallback(
    (style: DocStyle) => {
      setDialogOpen(false);

      const known = styles.some((s) => s.id === style.id);
      const builtin = BUILTIN_STYLES.some((s) => s.id === style.id);

      setCustom((prev) => {
        /* встроенный стиль не перезаписываем — храним его правку рядом */
        if (builtin) {
          const others = prev.filter((s) => s.id !== style.id);
          return [...others, { ...style, builtin: false }];
        }
        return known
          ? prev.map((s) => (s.id === style.id ? style : s))
          : [...prev, style];
      });

      const touched = repaintStyle(root(), style);
      recount();

      notify(
        known ? `Стиль «${style.name}» изменён` : `Стиль «${style.name}» создан`,
        touched ? `Обновлено абзацев: ${touched}` : undefined,
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [recount, notify, custom.length],
  );

  const remove = useCallback(
    (id: string) => {
      setDialogOpen(false);
      setCustom((prev) => prev.filter((s) => s.id !== id));
      notify('Стиль удалён');
    },
    [notify],
  );

  /** Снимает оформление и возвращает абзацу обычный вид */
  const clear = useCallback(() => {
    const n = clearStyle(root());
    if (!n) {
      notify('Установите курсор в абзац');
      return;
    }
    setActiveId('normal');
    recount();
    notify('Форматирование снято');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recount, notify]);

  /** Обновляет стиль так, чтобы он совпал с текущим оформлением */
  const updateFromSelection = useCallback(() => {
    const style = styles.find((s) => s.id === activeId);
    if (!style) return;

    const next: DocStyle = {
      ...style,
      builtin: false,
      char: readCharFormat(root()),
      para: readParaFormat(root()),
    };

    setCustom((prev) => {
      const others = prev.filter((s) => s.id !== next.id);
      return [...others, next];
    });

    const touched = repaintStyle(root(), next);
    recount();
    notify(
      `Стиль «${next.name}» обновлён`,
      touched ? `Обновлено абзацев: ${touched}` : undefined,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, custom.length, recount, notify]);

  return {
    styles,
    activeId,
    paneOpen,
    setPaneOpen,
    dialogOpen,
    setDialogOpen,
    editing,
    apply,
    applyById,
    create,
    edit,
    save,
    remove,
    clear,
    updateFromSelection,
  };
};
