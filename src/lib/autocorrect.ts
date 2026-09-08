/** Одна замена: что на что */
export interface AutoEntry {
  from: string;
  to: string;
}

/** Настройки автозамены и автоформата при вводе */
export interface AutoCorrectSetup {
  /** Первая буква предложения — прописная */
  capitalizeSentence: boolean;
  /** Две прописные подряд: «ПРивет» → «Привет» */
  fixTwoCaps: boolean;
  /** Английские названия дней и месяцев с прописной */
  capitalizeDays: boolean;
  /** Заменять опечатки по списку */
  replaceTypos: boolean;
  /** Прямые кавычки на «ёлочки» */
  smartQuotes: boolean;
  /** Дефис между словами на длинное тире */
  dashes: boolean;
  /** Адреса и почту превращать в ссылки */
  autoLinks: boolean;
  /** Дроби и знаки: (c) → ©, 1/2 → ½ */
  symbols: boolean;
  /** Порядковые числительные: 1-й надстрочным */
  ordinals: boolean;
  /** Список продолжается сам */
  autoLists: boolean;
  /** Свои замены пользователя */
  entries: AutoEntry[];
}

/** Список опечаток по умолчанию */
export const DEFAULT_ENTRIES: AutoEntry[] = [
  { from: 'чтото', to: 'что-то' },
  { from: 'какбудто', to: 'как будто' },
  { from: 'вообщем', to: 'в общем' },
  { from: 'придти', to: 'прийти' },
  { from: 'вобще', to: 'вообще' },
  { from: 'тоже самое', to: 'то же самое' },
  { from: 'извените', to: 'извините' },
  { from: 'спосибо', to: 'спасибо' },
  { from: 'пожалуйсто', to: 'пожалуйста' },
  { from: 'колличество', to: 'количество' },
  { from: 'руб.', to: '₽' },
  { from: '(с)', to: '©' },
  { from: '(р)', to: '®' },
  { from: '(тм)', to: '™' },
];

export const DEFAULT_AUTOCORRECT: AutoCorrectSetup = {
  capitalizeSentence: true,
  fixTwoCaps: true,
  capitalizeDays: true,
  replaceTypos: true,
  smartQuotes: true,
  dashes: true,
  autoLinks: true,
  symbols: true,
  ordinals: true,
  autoLists: true,
  entries: DEFAULT_ENTRIES,
};

/** Знаки, которые ставятся вместо сочетаний символов */
const SYMBOLS: AutoEntry[] = [
  { from: '(c)', to: '©' },
  { from: '(r)', to: '®' },
  { from: '(tm)', to: '™' },
  { from: '1/2', to: '½' },
  { from: '1/4', to: '¼' },
  { from: '3/4', to: '¾' },
  { from: '1/3', to: '⅓' },
  { from: '...', to: '…' },
  { from: '->', to: '→' },
  { from: '<-', to: '←' },
  { from: '+-', to: '±' },
  { from: '!=', to: '≠' },
  { from: '<=', to: '≤' },
  { from: '>=', to: '≥' },
];

/*
 * В русском языке дни недели и месяцы пишутся со строчной буквы,
 * поэтому правило применяется только к английским названиям.
 */
const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];

/** Результат разбора: чем заменить последнее слово */
export interface Correction {
  /** Сколько символов слева от курсора заменить */
  length: number;
  /** Чем заменить */
  text: string;
  /** Что именно сработало — для подсказки пользователю */
  reason: string;
}

/**
 * Подбирает замену для слова, которое пользователь только что закончил.
 * `before` — весь текст слева от курсора, `typed` — введённый разделитель.
 */
export const correctWord = (
  before: string,
  typed: string,
  s: AutoCorrectSetup,
): Correction | null => {
  /* последнее слово: буквы, цифры и служебные знаки */
  const match = before.match(/([^\s\u00a0]+)$/);
  if (!match) return null;

  const word = match[1];
  const lower = word.toLowerCase();

  /* знаки и дроби */
  if (s.symbols) {
    const sym = SYMBOLS.find((x) => x.from === lower);
    if (sym) {
      return { length: word.length, text: sym.to, reason: 'Знак подставлен' };
    }
  }

  /* список замен пользователя */
  if (s.replaceTypos) {
    const entry = s.entries.find((e) => e.from.toLowerCase() === lower);
    if (entry) {
      /* сохраняем прописную, если слово начиналось с неё */
      const text =
        word[0] === word[0].toUpperCase() && entry.to[0]
          ? entry.to[0].toUpperCase() + entry.to.slice(1)
          : entry.to;

      return { length: word.length, text, reason: 'Опечатка исправлена' };
    }
  }

  /* две прописные подряд: ПРивет → Привет */
  if (
    s.fixTwoCaps &&
    word.length > 2 &&
    /^[А-ЯA-Z]{2}[а-яa-z]/.test(word) &&
    word !== word.toUpperCase()
  ) {
    return {
      length: word.length,
      text: word[0] + word[1].toLowerCase() + word.slice(2),
      reason: 'Исправлены две прописные',
    };
  }

  /* английские дни недели и месяцы с прописной */
  if (s.capitalizeDays && (DAYS.includes(lower) || MONTHS.includes(lower))) {
    if (word[0] !== word[0].toUpperCase()) {
      return {
        length: word.length,
        text: word[0].toUpperCase() + word.slice(1),
        reason: 'Название с прописной',
      };
    }
  }

  /* порядковые числительные: 1-й, 2-е, 25-го */
  if (s.ordinals && /^\d+-[а-яё]{1,2}$/i.test(word)) {
    const [num, suffix] = word.split('-');
    return {
      length: word.length,
      text: `${num}-\u2060${suffix}`,
      reason: 'Порядковое числительное',
    };
  }

  /* адрес сайта или почта — превращаем в ссылку */
  if (s.autoLinks && typed !== '') {
    const isMail = /^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i.test(word);
    const isUrl = /^(https?:\/\/|www\.)[^\s]+\.[a-z]{2,}/i.test(word);

    if (isMail || isUrl) {
      const href = isMail
        ? `mailto:${word}`
        : word.startsWith('http')
          ? word
          : `https://${word}`;

      return {
        length: word.length,
        text: `<a href="${href}" class="pv-link">${word}</a>`,
        reason: isMail ? 'Адрес почты' : 'Ссылка создана',
      };
    }
  }

  return null;
};

/**
 * Заменяет прямые кавычки на «ёлочки». Открывающая или закрывающая —
 * решаем по тому, что стоит слева.
 */
export const quoteFor = (before: string): string => {
  const prev = before.slice(-1);
  const opening = !prev || /[\s\u00a0([{«—-]/.test(prev);
  return opening ? '«' : '»';
};

/** Внутренние кавычки — „лапки“ внутри «ёлочек» */
export const innerQuoteFor = (before: string): string => {
  const opened = (before.match(/«/g) ?? []).length;
  const closed = (before.match(/»/g) ?? []).length;

  if (opened > closed) {
    const prev = before.slice(-1);
    return !prev || /[\s\u00a0([{«]/.test(prev) ? '„' : '“';
  }

  return quoteFor(before);
};

/**
 * Дефис между словами превращается в длинное тире: «слово - слово».
 * Проверяем, что слева пробел, дефис и пробел.
 */
export const dashReplacement = (before: string): number => {
  /* «текст - » — дефис окружён пробелами */
  return /[^\s]\s-\s$/.test(before) ? 3 : 0;
};

/** Первая буква предложения — прописная */
export const capitalizeAfter = (
  before: string,
  s: AutoCorrectSetup,
): Correction | null => {
  if (!s.capitalizeSentence) return null;

  /* ищем слово в начале предложения: после точки или в начале строки */
  const m = before.match(/(^|[.!?]\s+|\n\s*)([а-яa-z])([^\s]*)$/);
  if (!m) return null;

  const letter = m[2];
  const rest = m[3];

  return {
    length: letter.length + rest.length,
    text: letter.toUpperCase() + rest,
    reason: 'Первая буква предложения',
  };
};

/** Разбирает строку начала списка: «1. », «- », «* » */
export const listStarter = (
  line: string,
  s: AutoCorrectSetup,
): 'bullet' | 'number' | null => {
  if (!s.autoLists) return null;

  if (/^\s*[-*•]\s$/.test(line)) return 'bullet';
  if (/^\s*\d+[.)]\s$/.test(line)) return 'number';

  return null;
};

/**
 * Выделяет несколько символов слева от курсора, чтобы их можно было
 * заменить. Возвращает false, если столько текста слева нет.
 */
export const selectLeft = (length: number): boolean => {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || length <= 0) return false;

  const range = sel.getRangeAt(0);
  const endNode = range.startContainer;
  const endOffset = range.startOffset;

  let left = length;
  let node: Node = endNode;
  let offset = endOffset;

  while (left > 0) {
    if (node.nodeType === Node.TEXT_NODE && offset >= left) {
      offset -= left;
      left = 0;
      break;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      left -= offset;
      offset = 0;
    }

    /* уходим к предыдущему узлу в пределах абзаца */
    let prev = node.previousSibling;

    if (!prev) {
      let up: Node | null = node.parentNode;

      while (up && !up.previousSibling) {
        if (isBlock(up)) return false;
        up = up.parentNode;
      }

      if (!up || isBlock(up)) return false;
      prev = up.previousSibling;
    }

    if (!prev) return false;

    node = prev;
    while (node.lastChild) node = node.lastChild;
    offset = node.textContent?.length ?? 0;
  }

  if (left > 0) return false;

  const target = document.createRange();
  target.setStart(node, offset);
  target.setEnd(endNode, endOffset);

  sel.removeAllRanges();
  sel.addRange(target);

  return true;
};

const isBlock = (node: Node): boolean => {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  return /^(P|H1|H2|H3|H4|LI|TD|TH|DIV|BODY)$/.test((node as Element).tagName);
};
