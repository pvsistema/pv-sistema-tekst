import { useCallback, useState } from 'react';

interface Params {
  editorRef: React.RefObject<HTMLDivElement>;
  exec: (command: string, value?: string) => void;
  recount: () => void;
  notify: (title: string, description?: string) => void;
}

/** Сноски, оглавление, ссылки, названия и указатели вкладки «Ссылки» */
export const useReferences = ({ editorRef, exec, recount, notify }: Params) => {
  const [citeStyle, setCiteStyle] = useState('APA');
  const [sources, setSources] = useState<string[]>([]);
  const [noteIndex, setNoteIndex] = useState(0);

  const el = () => editorRef.current;

  const count = (selector: string) => el()?.querySelectorAll(selector).length ?? 0;

  /* ── сноски ── */
  const addNote = (kind: 'foot' | 'end') => {
    const root = el();
    if (!root) return;
    const cls = kind === 'foot' ? 'pv-fn' : 'pv-en';
    const listCls = kind === 'foot' ? 'pv-fn-list' : 'pv-en-list';
    const num = root.querySelectorAll(`sup.${cls}`).length + 1;
    const mark = kind === 'foot' ? String(num) : `${num}*`;

    exec('insertHTML', `<sup class="${cls}" id="${cls}-${num}">${mark}</sup>`);

    let list = root.querySelector(`.${listCls}`);
    if (!list) {
      list = document.createElement('div');
      list.className = `${listCls} pv-notes`;
      list.innerHTML = `<div class="pv-notes-title">${
        kind === 'foot' ? 'Сноски' : 'Концевые сноски'
      }</div>`;
      root.appendChild(list);
    }
    const item = document.createElement('p');
    item.className = 'pv-note-item';
    item.innerHTML = `<sup>${mark}</sup> Текст сноски ${num}`;
    list.appendChild(item);

    recount();
    notify(
      kind === 'foot' ? 'Сноска добавлена' : 'Концевая сноска добавлена',
      `Номер ${mark}`,
    );
  };

  const nextNote = () => {
    const marks = el()?.querySelectorAll('sup.pv-fn, sup.pv-en');
    if (!marks?.length) return;
    const i = noteIndex % marks.length;
    marks[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
    setNoteIndex(i + 1);
  };

  const showNotes = () => {
    const list = el()?.querySelector('.pv-notes');
    list?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  /* ── оглавление ── */
  const buildToc = useCallback(
    (style: 'auto' | 'manual') => {
      const root = el();
      if (!root) return;
      root.querySelector('.pv-toc')?.remove();

      const box = document.createElement('div');
      box.className = 'pv-toc';
      let inner = '<div class="pv-toc-title">Оглавление</div>';

      if (style === 'manual') {
        inner +=
          '<p class="pv-toc-row"><span>Введите название главы (уровень 1)</span><span>1</span></p>' +
          '<p class="pv-toc-row pv-toc-l2"><span>Введите название главы (уровень 2)</span><span>2</span></p>' +
          '<p class="pv-toc-row pv-toc-l3"><span>Введите название главы (уровень 3)</span><span>3</span></p>';
      } else {
        const heads = Array.from(root.querySelectorAll('h1, h2, h3'));
        if (!heads.length) {
          notify('Заголовков нет', 'Примените стиль «Заголовок» к тексту');
          return;
        }
        heads.forEach((h, i) => {
          const lv = Number(h.tagName[1]);
          const id = `pv-h-${i}`;
          h.id = id;
          inner += `<p class="pv-toc-row pv-toc-l${lv}"><span>${h.textContent}</span><span>${
            i + 1
          }</span></p>`;
        });
      }

      box.innerHTML = inner;
      root.insertBefore(box, root.firstChild);
      recount();
      notify('Оглавление вставлено');
    },
    [notify, recount],
  );

  const updateToc = () => {
    if (!el()?.querySelector('.pv-toc')) return;
    buildToc('auto');
    notify('Оглавление обновлено');
  };

  const addTocText = (level: number) => {
    exec('formatBlock', `<h${level}>`);
    notify(`Абзац помечен как уровень ${level}`);
  };

  /* ── ссылки и литература ── */
  const addCitation = () => {
    const src = window.prompt(
      'Источник (автор, название, год)',
      'Иванов И. И. Делопроизводство, 2024',
    );
    if (!src) return;
    setSources((prev) => [...prev, src]);
    const short = src.split(',')[0];
    exec('insertHTML', `<span class="pv-cite">(${short}, ${citeStyle})</span>`);
    notify('Ссылка вставлена');
  };

  const manageSources = () => {
    notify(
      'Источники',
      sources.length ? sources.join(' · ') : 'Список источников пуст',
    );
  };

  const buildBibliography = () => {
    const root = el();
    if (!root) return;
    if (!sources.length) {
      notify('Нет источников', 'Сначала вставьте ссылку');
      return;
    }
    root.querySelector('.pv-biblio')?.remove();
    const box = document.createElement('div');
    box.className = 'pv-biblio pv-notes';
    box.innerHTML =
      '<div class="pv-notes-title">Список литературы</div>' +
      sources
        .map((s, i) => `<p class="pv-note-item">${i + 1}. ${s}</p>`)
        .join('');
    root.appendChild(box);
    recount();
    notify('Список литературы создан', `Стиль ${citeStyle}`);
  };

  /* ── названия и указатели ── */
  const addCaption = () => {
    const num = count('.pv-caption') + 1;
    const text = window.prompt('Название', `Рисунок ${num}`) ?? `Рисунок ${num}`;
    exec('insertHTML', `<p class="pv-caption">${text}</p>`);
    notify('Название добавлено');
  };

  const buildFigureList = () => {
    const root = el();
    if (!root) return;
    const caps = Array.from(root.querySelectorAll('.pv-caption'));
    if (!caps.length) {
      notify('Названий нет', 'Сначала добавьте название к рисунку');
      return;
    }
    root.querySelector('.pv-figlist')?.remove();
    const box = document.createElement('div');
    box.className = 'pv-figlist pv-notes';
    box.innerHTML =
      '<div class="pv-notes-title">Список иллюстраций</div>' +
      caps
        .map(
          (c, i) =>
            `<p class="pv-toc-row"><span>${c.textContent}</span><span>${i + 1}</span></p>`,
        )
        .join('');
    root.insertBefore(box, root.firstChild);
    recount();
    notify('Список иллюстраций создан');
  };

  const addCrossRef = () => {
    const heads = Array.from(el()?.querySelectorAll('h1, h2, h3') ?? []);
    if (!heads.length) {
      notify('Нет заголовков для ссылки');
      return;
    }
    const target = heads[0];
    if (!target.id) target.id = 'pv-h-cross';
    exec(
      'insertHTML',
      `<a class="pv-cross" href="#${target.id}">см. «${target.textContent}»</a>`,
    );
    notify('Перекрёстная ссылка вставлена');
  };

  const markIndex = () => {
    const sel = window.getSelection()?.toString().trim();
    if (!sel) {
      notify('Выделите слово', 'Затем нажмите «Пометить элемент»');
      return;
    }
    exec('insertHTML', `<span class="pv-index" data-term="${sel}">${sel}</span>`);
    notify('Элемент помечен', sel);
  };

  const buildIndex = () => {
    const root = el();
    if (!root) return;
    const terms = Array.from(root.querySelectorAll('.pv-index')).map(
      (n) => n.textContent ?? '',
    );
    if (!terms.length) {
      notify('Указатель пуст', 'Сначала пометьте элементы');
      return;
    }
    root.querySelector('.pv-indexlist')?.remove();
    const box = document.createElement('div');
    box.className = 'pv-indexlist pv-notes';
    box.innerHTML =
      '<div class="pv-notes-title">Предметный указатель</div>' +
      Array.from(new Set(terms))
        .sort((a, b) => a.localeCompare(b, 'ru'))
        .map((t) => `<p class="pv-note-item">${t}</p>`)
        .join('');
    root.appendChild(box);
    recount();
    notify('Указатель построен');
  };

  const markAuthority = () => {
    const sel = window.getSelection()?.toString().trim();
    if (!sel) {
      notify('Выделите текст ссылки');
      return;
    }
    exec('insertHTML', `<span class="pv-auth">${sel}</span>`);
    notify('Ссылка помечена');
  };

  const buildAuthorities = () => {
    const root = el();
    if (!root) return;
    const items = Array.from(root.querySelectorAll('.pv-auth')).map(
      (n) => n.textContent ?? '',
    );
    if (!items.length) {
      notify('Нет помеченных ссылок');
      return;
    }
    root.querySelector('.pv-authlist')?.remove();
    const box = document.createElement('div');
    box.className = 'pv-authlist pv-notes';
    box.innerHTML =
      '<div class="pv-notes-title">Таблица ссылок</div>' +
      items.map((t, i) => `<p class="pv-note-item">${i + 1}. ${t}</p>`).join('');
    root.appendChild(box);
    recount();
    notify('Таблица ссылок создана');
  };

  return {
    citeStyle,
    setCiteStyle,
    addNote,
    nextNote,
    showNotes,
    buildToc,
    updateToc,
    addTocText,
    addCitation,
    manageSources,
    buildBibliography,
    addCaption,
    buildFigureList,
    addCrossRef,
    markIndex,
    buildIndex,
    markAuthority,
    buildAuthorities,
    count,
  };
};
