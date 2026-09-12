import { useCallback, useEffect, useState } from 'react';
import type { CharFormat, ParaFormat } from '@/lib/text-format';
import {
  DEFAULT_CHAR,
  DEFAULT_PARA,
  applyCharFormat,
  applyParaFormat,
  changeCase,
  lineHeightOf,
  readCharFormat,
  readParaFormat,
  selectedElement,
  selectedParagraph,
  selectedParagraphs,
} from '@/lib/text-format';

interface Options {
  editorRef: React.RefObject<HTMLDivElement>;
  exec: (command: string, value?: string) => void;
  recount: () => void;
  notify: (title: string, description?: string) => void;
}

/** Стили маркеров и форматов нумерации, как в библиотеках Word */
export const BULLETS = ['•', '○', '▪', '◆', '➢', '✓', '–', '»'];
export const NUMBER_FORMATS: { value: string; label: string }[] = [
  { value: 'decimal', label: '1. 2. 3.' },
  { value: 'lower-alpha', label: 'a) b) c)' },
  { value: 'upper-alpha', label: 'A. B. C.' },
  { value: 'lower-roman', label: 'i. ii. iii.' },
  { value: 'upper-roman', label: 'I. II. III.' },
];

/**
 * Форматирование символов, абзацев и списков — то, что в Word
 * собрано на вкладке «Главная».
 */
export const useFormat = ({ editorRef, exec, recount, notify }: Options) => {
  const [fontOpen, setFontOpen] = useState(false);
  const [paraOpen, setParaOpen] = useState(false);
  const [charInit, setCharInit] = useState<CharFormat>(DEFAULT_CHAR);
  const [paraInit, setParaInit] = useState<ParaFormat>(DEFAULT_PARA);

  const root = () => editorRef.current;

  /** Открывает окно «Шрифт», подставив оформление под курсором */
  const openFont = useCallback(() => {
    setCharInit(readCharFormat(root()));
    setFontOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Открывает окно «Абзац», подставив настройки текущего абзаца */
  const openPara = useCallback(() => {
    setParaInit(readParaFormat(root()));
    setParaOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFont = useCallback(
    (f: CharFormat) => {
      setFontOpen(false);
      if (applyCharFormat(root(), f)) {
        recount();
        notify('Оформление применено');
      } else {
        notify('Выделите текст', 'Оформление применяется к выделенному тексту');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [recount, notify],
  );

  /**
   * Меняет только вид линии подчёркивания, остальное оформление
   * выделенного текста остаётся прежним — как в Word.
   */
  const applyUnderline = useCallback(
    (kind: CharFormat['underline']) => {
      const now = readCharFormat(root());

      if (applyCharFormat(root(), { ...now, underline: kind })) {
        recount();
        return;
      }

      notify('Выделите текст', 'Подчёркивание применяется к выделенному тексту');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [recount, notify],
  );

  const applyPara = useCallback(
    (f: ParaFormat) => {
      setParaOpen(false);
      const n = applyParaFormat(root(), f);
      recount();
      notify(
        n > 1 ? `Настройки применены к ${n} абзацам` : 'Настройки абзаца применены',
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [recount, notify],
  );

  /** Междустрочный интервал одной командой из ленты */
  const setLineSpacing = useCallback(
    (v: number) => {
      const list = selectedParagraphs(root());
      if (!list.length) {
        notify('Установите курсор в абзац');
        return;
      }
      list.forEach((el) => {
        el.style.lineHeight = String(v);
      });
      recount();
      notify(`Междустрочный интервал ${String(v).replace('.', ',')}`);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [recount, notify],
  );

  /** Интервал перед абзацем или после него — команды группы «Абзац» */
  const addSpacing = useCallback(
    (where: 'before' | 'after', pt: number) => {
      const list = selectedParagraphs(root());
      list.forEach((el) => {
        if (where === 'before') el.style.marginTop = `${pt * 1.333}px`;
        else el.style.marginBottom = `${pt * 1.333}px`;
      });
      recount();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [recount],
  );

  const applyCase = useCallback(
    (mode: 'sentence' | 'lower' | 'upper' | 'capitalize' | 'toggle') => {
      if (!changeCase(root(), mode)) {
        notify('Выделите текст', 'Регистр меняется у выделенного текста');
        return;
      }
      recount();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [recount, notify],
  );

  /* ── списки ── */

  /** Ближайший к курсору список */
  const currentList = (): HTMLElement | null => {
    let el = selectedElement(root());
    while (el && el !== root() && el.tagName !== 'UL' && el.tagName !== 'OL') {
      el = el.parentElement;
    }
    return el && el !== root() ? el : null;
  };

  const toggleBullets = useCallback(() => {
    exec('insertUnorderedList');
  }, [exec]);

  const toggleNumbering = useCallback(() => {
    exec('insertOrderedList');
  }, [exec]);

  /** Меняет маркер у списка, в котором стоит курсор */
  const setBullet = useCallback(
    (symbol: string) => {
      const list = currentList();
      if (!list || list.tagName !== 'UL') {
        exec('insertUnorderedList');
      }
      const target = currentList();
      if (!target) return;

      target.style.listStyleType = 'none';
      target.setAttribute('data-bullet', symbol);
      target.classList.add('pv-bullet');
      target.style.setProperty('--pv-bullet', `"${symbol}  "`);
      recount();
      notify(`Маркер списка: ${symbol}`);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [exec, recount, notify],
  );

  /** Меняет вид нумерации: цифры, буквы или римские числа */
  const setNumberFormat = useCallback(
    (format: string) => {
      const list = currentList();
      if (!list || list.tagName !== 'OL') {
        exec('insertOrderedList');
      }
      const target = currentList();
      if (!target) return;

      target.classList.remove('pv-bullet');
      target.style.removeProperty('--pv-bullet');
      target.style.listStyleType = format;
      recount();
      notify('Формат нумерации изменён');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [exec, recount, notify],
  );

  /** Начать нумерацию заново либо продолжить предыдущую */
  const restartNumbering = useCallback(
    (start: number) => {
      const list = currentList();
      if (!list || list.tagName !== 'OL') {
        notify('Курсор не в нумерованном списке');
        return;
      }
      (list as HTMLOListElement).start = start;
      recount();
      notify(start === 1 ? 'Нумерация начата заново' : `Нумерация с ${start}`);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [recount, notify],
  );

  /** Многоуровневый список: вложенность задаётся клавишей Tab */
  const multilevel = useCallback(() => {
    exec('insertOrderedList');
    const list = currentList();
    if (list) list.classList.add('pv-multilevel');
    notify(
      'Многоуровневый список',
      'Tab — уровень ниже, Shift+Tab — уровень выше',
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exec, notify]);

  /** Сортировка пунктов списка или строк по алфавиту */
  const sortList = useCallback(
    (desc = false) => {
      const list = currentList();
      if (!list) {
        notify('Курсор не в списке', 'Сортируются пункты списка');
        return;
      }

      const items = Array.from(list.children).filter(
        (c) => c.tagName === 'LI',
      ) as HTMLElement[];

      items
        .sort((a, b) => {
          const r = (a.textContent ?? '').localeCompare(
            b.textContent ?? '',
            'ru',
          );
          return desc ? -r : r;
        })
        .forEach((li) => list.appendChild(li));

      recount();
      notify(desc ? 'Список отсортирован от Я до А' : 'Список отсортирован от А до Я');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [recount, notify],
  );

  /** Формат по образцу: запоминает оформление и переносит на другой текст */
  const [sample, setSample] = useState<CharFormat | null>(null);

  /* Режим «прилипания»: двойной щелчок в Word позволяет применять
     формат много раз, пока не выключишь кнопку. */
  const [sticky, setSticky] = useState(false);

  const copyFormat = useCallback(() => {
    const f = readCharFormat(root());
    setSample(f);
    notify('Формат скопирован', 'Выделите текст, к которому его применить');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notify]);

  /** Двойной щелчок по кнопке — многократное применение формата */
  const lockFormat = useCallback(() => {
    const f = readCharFormat(root());
    setSample(f);
    setSticky(true);
    notify(
      'Формат по образцу закреплён',
      'Применяйте к любому тексту. Нажмите кнопку ещё раз, чтобы выключить',
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notify]);

  const pasteFormat = useCallback(() => {
    /* закреплённый режим выключается повторным нажатием кнопки */
    if (sticky) {
      setSticky(false);
      setSample(null);
      notify('Формат по образцу выключен');
      return;
    }

    if (!sample) {
      copyFormat();
      return;
    }
    if (applyCharFormat(root(), sample)) {
      recount();
      notify('Формат применён');
      setSample(null);
    } else {
      notify('Выделите текст');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sample, sticky, copyFormat, recount, notify]);

  /*
   * Пока режим закреплён, каждое новое выделение получает образец —
   * достаточно провести мышью по тексту.
   */
  useEffect(() => {
    if (!sticky || !sample) return;

    const el = editorRef.current;
    if (!el) return;

    const apply = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      if (applyCharFormat(el, sample)) recount();
    };

    el.addEventListener('mouseup', apply);
    return () => el.removeEventListener('mouseup', apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sticky, sample, recount]);

  return {
    fontOpen,
    paraOpen,
    charInit,
    paraInit,
    setFontOpen,
    setParaOpen,
    openFont,
    openPara,
    applyFont,
    applyPara,
    applyUnderline,
    setLineSpacing,
    addSpacing,
    applyCase,
    toggleBullets,
    toggleNumbering,
    setBullet,
    setNumberFormat,
    restartNumbering,
    multilevel,
    sortList,
    copyFormat,
    pasteFormat,
    lockFormat,
    /** Закреплён ли режим многократного применения */
    formatSticky: sticky,
    hasSample: !!sample,
    lineHeightOf,
    selectedParagraph,
  };
};