import { useCallback, useState } from 'react';

interface Params {
  editorRef: React.RefObject<HTMLDivElement>;
  exec: (command: string, value?: string) => void;
  recount: () => void;
  notify: (title: string, description?: string) => void;
  words: number;
  chars: number;
  pages: number;
}

/** Примечания, запись исправлений и проверка текста вкладки «Рецензирование» */
export const useReview = ({
  editorRef,
  exec,
  recount,
  notify,
  words,
  chars,
  pages,
}: Params) => {
  const [showComments, setShowComments] = useState(true);
  const [trackChanges, setTrackChanges] = useState(false);
  const [markupView, setMarkupView] = useState('Исправления');
  const [cursor, setCursor] = useState(0);

  const el = () => editorRef.current;

  const count = (selector: string) => el()?.querySelectorAll(selector).length ?? 0;

  /* ── примечания ── */
  const newComment = () => {
    const sel = window.getSelection();
    const picked = sel?.toString().trim();
    const text = window.prompt('Текст примечания', 'Уточнить формулировку');
    if (!text) return;

    const num = count('.pv-comment') + 1;
    const body = picked || 'фрагмент';
    exec(
      'insertHTML',
      `<span class="pv-comment" data-note="${text.replace(/"/g, '&quot;')}" data-num="${num}">${body}<span class="pv-comment-mark">${num}</span></span>`,
    );

    const root = el();
    if (root) {
      let pane = root.querySelector('.pv-comment-list');
      if (!pane) {
        pane = document.createElement('div');
        pane.className = 'pv-comment-list pv-notes';
        pane.innerHTML = '<div class="pv-notes-title">Примечания</div>';
        root.appendChild(pane);
      }
      const item = document.createElement('p');
      item.className = 'pv-note-item';
      item.innerHTML = `<b>${num}. Рецензент:</b> ${text}`;
      pane.appendChild(item);
    }

    recount();
    notify('Примечание добавлено', text);
  };

  const deleteComment = () => {
    const root = el();
    const marks = root?.querySelectorAll('.pv-comment');
    if (!marks?.length) return;
    const last = marks[marks.length - 1];
    last.replaceWith(...Array.from(last.childNodes).filter(
      (n) => !(n instanceof HTMLElement && n.classList.contains('pv-comment-mark')),
    ));
    root?.querySelector('.pv-comment-list p:last-of-type')?.remove();
    if (!root?.querySelectorAll('.pv-comment').length) {
      root?.querySelector('.pv-comment-list')?.remove();
    }
    recount();
    notify('Примечание удалено');
  };

  const jump = (dir: 1 | -1) => {
    const marks = el()?.querySelectorAll('.pv-comment, .pv-ins, .pv-del');
    if (!marks?.length) return;
    const next = (cursor + dir + marks.length) % marks.length;
    marks[next].scrollIntoView({ behavior: 'smooth', block: 'center' });
    setCursor(next);
  };

  const toggleComments = () => {
    const root = el();
    if (!root) return;
    const next = !showComments;
    setShowComments(next);
    root.classList.toggle('pv-hide-comments', !next);
    notify(next ? 'Примечания показаны' : 'Примечания скрыты');
  };

  /* ── исправления ── */
  const toggleTrack = () => {
    const next = !trackChanges;
    setTrackChanges(next);
    notify(
      next ? 'Запись исправлений включена' : 'Запись исправлений выключена',
      next ? 'Новый текст помечается цветом' : undefined,
    );
  };

  /** вставка текста в режиме исправлений */
  const insertTracked = useCallback(
    (text: string) => {
      if (trackChanges) exec('insertHTML', `<span class="pv-ins">${text}</span>`);
      else exec('insertText', text);
    },
    [exec, trackChanges],
  );

  const applyMarkupView = (v: string) => {
    setMarkupView(v);
    const root = el();
    if (!root) return;
    root.classList.remove('pv-markup-none', 'pv-markup-original');
    if (v === 'Без исправлений') root.classList.add('pv-markup-none');
    if (v === 'Исходный документ') root.classList.add('pv-markup-original');
    notify(`Режим: ${v}`);
  };

  const showMarkup = () =>
    notify(
      'Показать исправления',
      `Примечаний: ${count('.pv-comment')}, изменений: ${count('.pv-ins, .pv-del')}`,
    );

  const reviewPane = () => {
    el()?.querySelector('.pv-comment-list')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    notify('Область проверки', 'Список примечаний внизу документа');
  };

  const acceptChange = () => {
    const root = el();
    const ins = root?.querySelector('.pv-ins');
    const del = root?.querySelector('.pv-del');
    if (ins) ins.replaceWith(...Array.from(ins.childNodes));
    else if (del) del.remove();
    else return;
    recount();
    notify('Исправление принято');
  };

  const rejectChange = () => {
    const root = el();
    const ins = root?.querySelector('.pv-ins');
    const del = root?.querySelector('.pv-del');
    if (ins) ins.remove();
    else if (del) del.replaceWith(...Array.from(del.childNodes));
    else return;
    recount();
    notify('Исправление отклонено');
  };

  /* ── правописание и статистика ── */
  const spelling = () => {
    const text = el()?.innerText ?? '';
    const doubles = text.match(/\b(\w+)\s+\1\b/gi) ?? [];
    const spaces = text.match(/\s{2,}/g) ?? [];
    if (!doubles.length && !spaces.length) {
      notify('Проверка завершена', 'Ошибок не найдено');
      return;
    }
    notify(
      'Найдены неточности',
      `Повторы слов: ${doubles.length}, двойные пробелы: ${spaces.length}`,
    );
  };

  const thesaurus = () => {
    const w = window.getSelection()?.toString().trim();
    if (!w) {
      notify('Тезаурус', 'Выделите слово для подбора синонимов');
      return;
    }
    window.open(
      `https://ya.ru/search/?text=${encodeURIComponent(`синонимы ${w}`)}`,
      '_blank',
    );
  };

  const stats = () => {
    const text = el()?.innerText ?? '';
    const paragraphs = count('p') || 1;
    notify(
      'Статистика',
      `Страниц: ${pages} · Слов: ${words} · Знаков: ${chars} · Абзацев: ${paragraphs} · Знаков с пробелами: ${text.length}`,
    );
  };

  const readAloud = () => {
    const text = window.getSelection()?.toString().trim() || el()?.innerText || '';
    if (!('speechSynthesis' in window) || !text) {
      notify('Озвучивание недоступно');
      return;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      notify('Чтение остановлено');
      return;
    }
    const u = new SpeechSynthesisUtterance(text.slice(0, 3000));
    u.lang = 'ru-RU';
    window.speechSynthesis.speak(u);
    notify('Чтение вслух', 'Нажмите ещё раз, чтобы остановить');
  };

  const readability = () => {
    const text = el()?.innerText ?? '';
    const sentences = (text.match(/[.!?]+/g) ?? []).length || 1;
    const avg = Math.round(words / sentences);
    notify(
      'Проверка читаемости',
      `Предложений: ${sentences} · В среднем ${avg} слов в предложении${
        avg > 20 ? ' — стоит упростить' : ' — хороший показатель'
      }`,
    );
  };

  const translate = () => {
    const t = window.getSelection()?.toString().trim() || el()?.innerText || '';
    window.open(
      `https://translate.yandex.ru/?text=${encodeURIComponent(t.slice(0, 500))}`,
      '_blank',
    );
  };

  const language = () => notify('Язык проверки', 'Русский (Россия)');

  const compare = () =>
    notify('Сравнение', 'Откройте второй документ, чтобы сравнить версии');

  const restrict = () => {
    const root = el();
    if (!root) return;
    const locked = root.getAttribute('contenteditable') === 'false';
    root.setAttribute('contenteditable', locked ? 'true' : 'false');
    notify(
      locked ? 'Редактирование разрешено' : 'Редактирование ограничено',
      locked ? undefined : 'Документ доступен только для чтения',
    );
  };

  return {
    showComments,
    trackChanges,
    markupView,
    newComment,
    deleteComment,
    prevComment: () => jump(-1),
    nextComment: () => jump(1),
    toggleComments,
    toggleTrack,
    insertTracked,
    applyMarkupView,
    showMarkup,
    reviewPane,
    acceptChange,
    rejectChange,
    spelling,
    thesaurus,
    stats,
    readAloud,
    readability,
    translate,
    language,
    compare,
    restrict,
    count,
  };
};
