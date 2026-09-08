/** Набор символов одной вкладки окна «Символ» */
export interface SymbolSet {
  title: string;
  chars: string[];
}

export const SYMBOL_SETS: SymbolSet[] = [
  {
    title: 'Часто используемые',
    chars: [
      '€', '₽', '$', '£', '¥', '¢', '©', '®', '™', '§',
      '¶', '†', '‡', '•', '…', '‰', '°', '№', '±', '×',
      '÷', '≠', '≈', '≤', '≥', '∞', '√', '∑', '∏', '∆',
    ],
  },
  {
    title: 'Знаки препинания',
    chars: [
      '«', '»', '„', '“', '”', '‘', '’', '‚', '–', '—',
      '‑', '·', '‥', '⁃', '⁂', '¡', '¿', '‼', '⁇', '⁈',
    ],
  },
  {
    title: 'Стрелки',
    chars: [
      '←', '↑', '→', '↓', '↔', '↕', '↖', '↗', '↘', '↙',
      '⇐', '⇑', '⇒', '⇓', '⇔', '↩', '↪', '⟵', '⟶', '⇄',
    ],
  },
  {
    title: 'Математика',
    chars: [
      '∀', '∃', '∅', '∈', '∉', '∋', '∩', '∪', '⊂', '⊃',
      '⊆', '⊇', '∧', '∨', '¬', '∫', '∮', '∂', '∇', '∝',
      '≡', '≅', '∼', '⊥', '∠', '∥', '½', '⅓', '¼', '¾',
    ],
  },
  {
    title: 'Греческие буквы',
    chars: [
      'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ',
      'λ', 'μ', 'ν', 'ξ', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ',
      'χ', 'ψ', 'ω', 'Γ', 'Δ', 'Θ', 'Λ', 'Ξ', 'Π', 'Σ',
      'Φ', 'Ψ', 'Ω',
    ],
  },
  {
    title: 'Значки',
    chars: [
      '★', '☆', '☑', '☐', '☒', '✓', '✔', '✗', '✘', '♦',
      '♣', '♠', '♥', '☺', '☹', '☼', '☂', '⚑', '⚠', '☎',
      '✉', '✂', '✈', '⌚', '⌛', '⏰', '♪', '♫', '⚙', '⌂',
    ],
  },
];

/** Названия символов — подсказка при наведении */
export const SYMBOL_NAMES: Record<string, string> = {
  '€': 'Знак евро',
  '₽': 'Знак рубля',
  '£': 'Знак фунта',
  '¥': 'Знак иены',
  '©': 'Знак охраны авторского права',
  '®': 'Знак охраны товарного знака',
  '™': 'Товарный знак',
  '§': 'Параграф',
  '¶': 'Знак абзаца',
  '№': 'Номер',
  '±': 'Плюс-минус',
  '×': 'Знак умножения',
  '÷': 'Знак деления',
  '≠': 'Не равно',
  '≈': 'Приблизительно равно',
  '≤': 'Меньше или равно',
  '≥': 'Больше или равно',
  '∞': 'Бесконечность',
  '√': 'Квадратный корень',
  '∑': 'Сумма',
  '°': 'Градус',
  '•': 'Маркер списка',
  '…': 'Многоточие',
  '«': 'Открывающая кавычка-ёлочка',
  '»': 'Закрывающая кавычка-ёлочка',
  '–': 'Короткое тире',
  '—': 'Длинное тире',
};

/** Код символа в шестнадцатеричном виде — как показывает Word */
export const charCode = (ch: string): string =>
  (ch.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0');

/** Специальные знаки со своими сочетаниями клавиш */
export const SPECIAL_CHARS: {
  label: string;
  char: string;
  hint: string;
}[] = [
  { label: 'Длинное тире', char: '—', hint: 'Alt+Ctrl+Минус' },
  { label: 'Короткое тире', char: '–', hint: 'Ctrl+Минус' },
  { label: 'Неразрывный пробел', char: '\u00a0', hint: 'Ctrl+Shift+Пробел' },
  { label: 'Неразрывный дефис', char: '\u2011', hint: 'Ctrl+Shift+Дефис' },
  { label: 'Мягкий перенос', char: '\u00ad', hint: 'Ctrl+Дефис' },
  { label: 'Узкий пробел', char: '\u2009', hint: '' },
  { label: 'Знак абзаца', char: '¶', hint: '' },
  { label: 'Многоточие', char: '…', hint: 'Alt+Ctrl+Точка' },
];

/** Форматы даты и времени для окна «Дата и время» */
export const dateFormats = (d: Date): { label: string; value: string }[] => {
  const pad = (n: number) => String(n).padStart(2, '0');

  /* родительный падеж — «8 сентября», именительный — «Сентябрь 2026» */
  const MONTHS = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ];

  const MONTHS_NAME = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ];

  const DAYS = [
    'воскресенье', 'понедельник', 'вторник', 'среда',
    'четверг', 'пятница', 'суббота',
  ];

  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  return [
    { label: 'Краткая дата', value: `${pad(day)}.${pad(month + 1)}.${year}` },
    { label: 'Полная дата', value: `${day} ${MONTHS[month]} ${year} г.` },
    {
      label: 'День недели и дата',
      value: `${DAYS[d.getDay()]}, ${day} ${MONTHS[month]} ${year} г.`,
    },
    { label: 'Дата и время', value: `${pad(day)}.${pad(month + 1)}.${year} ${time}` },
    { label: 'Только время', value: time },
    {
      label: 'Время с секундами',
      value: `${time}:${pad(d.getSeconds())}`,
    },
    { label: 'Год и месяц', value: `${MONTHS_NAME[month]} ${year} г.` },
    { label: 'Международный', value: `${year}-${pad(month + 1)}-${pad(day)}` },
  ];
};

/** Готовый блок текста, который вставляется одной кнопкой */
export interface QuickPart {
  id: string;
  title: string;
  hint: string;
  category: string;
  html: string;
}

/** Встроенные экспресс-блоки */
export const BUILTIN_PARTS: QuickPart[] = [
  {
    id: 'signature',
    title: 'Строка подписи',
    hint: 'Место для подписи и расшифровки',
    category: 'Документ',
    html:
      '<p style="margin-top:32px">_______________________ / _______________________</p>' +
      '<p style="font-size:11px;color:#595959">подпись&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;расшифровка</p>',
  },
  {
    id: 'requisites',
    title: 'Реквизиты организации',
    hint: 'Название, адрес, ИНН и телефон',
    category: 'Документ',
    html:
      '<p style="font-weight:700">ООО «Название»</p>' +
      '<p style="font-size:12px;color:#444">Адрес: 000000, г. Город, ул. Улица, д. 1<br>' +
      'ИНН 0000000000 · КПП 000000000<br>Телефон: +7 (000) 000-00-00</p>',
  },
  {
    id: 'address',
    title: 'Адресат',
    hint: 'Кому адресован документ',
    category: 'Письмо',
    html:
      '<p style="text-align:right;margin-bottom:24px">Генеральному директору<br>' +
      'ООО «Название»<br>И. И. Иванову</p>',
  },
  {
    id: 'greeting',
    title: 'Обращение',
    hint: 'Вежливое начало письма',
    category: 'Письмо',
    html: '<p>Уважаемый Иван Иванович!</p>',
  },
  {
    id: 'closing',
    title: 'Подпись в письме',
    hint: 'Завершение письма',
    category: 'Письмо',
    html:
      '<p style="margin-top:24px">С уважением,<br>' +
      'Директор&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
      '_____________&nbsp;&nbsp;&nbsp;&nbsp;И. И. Иванов</p>',
  },
  {
    id: 'approve',
    title: 'Гриф утверждения',
    hint: 'УТВЕРЖДАЮ в правом верхнем углу',
    category: 'Документ',
    html:
      '<p style="text-align:right;margin-bottom:24px">УТВЕРЖДАЮ<br>' +
      'Директор ООО «Название»<br>_____________ И. И. Иванов<br>' +
      '«____» __________ 20___ г.</p>',
  },
  {
    id: 'table-head',
    title: 'Таблица с заголовком',
    hint: 'Готовая таблица на три столбца',
    category: 'Таблицы',
    html:
      '<table style="width:100%;border-collapse:collapse"><tr>' +
      '<th style="border:1px solid #999;padding:6px;background:#d9e2f3">№</th>' +
      '<th style="border:1px solid #999;padding:6px;background:#d9e2f3">Наименование</th>' +
      '<th style="border:1px solid #999;padding:6px;background:#d9e2f3">Сумма</th></tr>' +
      '<tr><td style="border:1px solid #999;padding:6px">1</td>' +
      '<td style="border:1px solid #999;padding:6px"></td>' +
      '<td style="border:1px solid #999;padding:6px"></td></tr></table><p><br></p>',
  },
  {
    id: 'note',
    title: 'Примечание в рамке',
    hint: 'Выделенный блок с пояснением',
    category: 'Оформление',
    html:
      '<p style="border-left:3px solid #4472c4;background:#eef3fb;padding:8px 12px">' +
      'Обратите внимание: здесь важное пояснение.</p>',
  },
];

const STORAGE_KEY = 'pv-tekst-quick-parts';

/** Читает сохранённые блоки пользователя */
export const loadParts = (): QuickPart[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as QuickPart[];
  } catch {
    /* хранилище недоступно */
  }
  return [];
};

/** Сохраняет блоки пользователя */
export const saveParts = (parts: QuickPart[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parts));
  } catch {
    /* пропускаем */
  }
};
