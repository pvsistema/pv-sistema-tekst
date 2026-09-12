import { useCallback, useRef, useState } from 'react';
import type { LinkSetup } from '@/components/editor/LinkDialog';

const EMPTY: LinkSetup = { text: '', href: 'https://', tip: '', blank: true };

interface Options {
  editorRef: React.RefObject<HTMLDivElement>;
  exec: (command: string, value?: string) => void;
  recount: () => void;
  notify: (title: string, description?: string) => void;
}

/** Работа с гиперссылками: своё окно вместо системного prompt */
export const useLinks = ({ editorRef, exec, recount, notify }: Options) => {
  const [open, setOpen] = useState(false);
  const [initial, setInitial] = useState<LinkSetup>(EMPTY);
  const [canRemove, setCanRemove] = useState(false);

  /* запоминаем выделение: щелчок по окну сбивает его */
  const saved = useRef<Range | null>(null);
  const editing = useRef<HTMLAnchorElement | null>(null);

  const root = () => editorRef.current;

  /** Ссылка под курсором, если он внутри неё */
  const linkAtCursor = (): HTMLAnchorElement | null => {
    const node = window.getSelection()?.anchorNode;
    if (!node || !root()?.contains(node)) return null;

    const el =
      node.nodeType === Node.ELEMENT_NODE
        ? (node as Element)
        : node.parentElement;

    return el?.closest('a') ?? null;
  };

  const openDialog = useCallback(() => {
    const selection = window.getSelection();

    saved.current =
      selection && selection.rangeCount
        ? selection.getRangeAt(0).cloneRange()
        : null;

    const link = linkAtCursor();
    editing.current = link;

    setInitial(
      link
        ? {
            text: link.textContent ?? '',
            href: link.getAttribute('href') ?? '',
            tip: link.getAttribute('title') ?? '',
            blank: link.getAttribute('target') === '_blank',
          }
        : {
            ...EMPTY,
            text: selection?.toString() ?? '',
          },
    );

    setCanRemove(!!link);
    setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Возвращает выделение на место перед вставкой */
  const restore = () => {
    const el = root();
    if (!el) return;

    el.focus();

    if (!saved.current) return;

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(saved.current);
  };

  const apply = useCallback(
    (setup: LinkSetup) => {
      const link = editing.current;

      /* правим уже существующую ссылку на месте */
      if (link) {
        link.setAttribute('href', setup.href);
        link.textContent = setup.text;

        if (setup.tip) link.setAttribute('title', setup.tip);
        else link.removeAttribute('title');

        if (setup.blank && !setup.href.startsWith('#')) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        } else {
          link.removeAttribute('target');
          link.removeAttribute('rel');
        }

        editing.current = null;
        recount();
        notify('Ссылка изменена');
        return;
      }

      restore();

      const attrs = [
        `href="${setup.href.replace(/"/g, '&quot;')}"`,
        setup.tip ? `title="${setup.tip.replace(/"/g, '&quot;')}"` : '',
        setup.blank && !setup.href.startsWith('#')
          ? 'target="_blank" rel="noopener noreferrer"'
          : '',
      ]
        .filter(Boolean)
        .join(' ');

      const safe = setup.text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      exec('insertHTML', `<a ${attrs}>${safe}</a>`);
      recount();
      notify('Ссылка добавлена', setup.href);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [exec, recount, notify],
  );

  const remove = useCallback(() => {
    const link = editing.current ?? linkAtCursor();
    if (!link) return;

    /* оставляем текст, убираем только саму ссылку */
    const text = document.createTextNode(link.textContent ?? '');
    link.replaceWith(text);

    editing.current = null;
    recount();
    notify('Ссылка удалена', 'Текст остался на месте');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recount, notify]);

  return {
    open,
    setOpen,
    initial,
    canRemove,
    openDialog,
    apply,
    remove,
  };
};
