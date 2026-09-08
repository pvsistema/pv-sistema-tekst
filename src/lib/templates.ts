/** Шаблон, созданный пользователем */
export interface UserTemplate {
  id: string;
  title: string;
  /** Краткое пояснение, что это за бланк */
  hint: string;
  html: string;
  /** Когда сохранён — миллисекунды */
  saved: number;
  /** На основе какого шаблона сделан */
  basedOn?: string;
}

const STORAGE_KEY = 'pv-tekst-templates';

/** Читает папку «Шаблоны» */
export const loadTemplates = (): UserTemplate[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const list = JSON.parse(raw) as UserTemplate[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

/** Сохраняет папку «Шаблоны» */
export const saveTemplates = (list: UserTemplate[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* хранилище переполнено — молча пропускаем */
  }
};

/** Дата сохранения в привычном виде */
export const templateDate = (ms: number): string => {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
};

/**
 * Убирает из документа временную разметку редактора, чтобы
 * в шаблон не попали следы выделения и рабочие пометки.
 */
export const cleanForTemplate = (html: string): string => {
  const holder = document.createElement('div');
  holder.innerHTML = html;

  holder
    .querySelectorAll(
      '.pv-equation-active, .pv-object-active, .pv-selected, .pv-shape-active',
    )
    .forEach((el) => {
      el.classList.remove(
        'pv-equation-active',
        'pv-object-active',
        'pv-selected',
        'pv-shape-active',
      );
    });

  /* маркеры поиска не нужны в бланке */
  holder.querySelectorAll('.pv-find-hit').forEach((el) => {
    el.replaceWith(...el.childNodes);
  });

  return holder.innerHTML;
};

/**
 * Бланк деловой переписки из урока: шапка организации,
 * адресат, дата и место для подписи.
 */
export const LETTER_TEMPLATE = `<p style="text-align:center;font-weight:700;font-size:15px">ООО «Домашний компьютер»</p>
<p style="text-align:center;font-size:11px;color:#595959">424000, г. Йошкар-Ола, ул. Советская, д. 100<br>тел. (8362) 00-00-00 · mail@example.ru</p>
<p style="border-bottom:1px solid #7f7f7f"><br></p>
<p style="text-align:right;margin-top:18px">Генеральному директору<br>ООО «Название»<br>И. И. Иванову</p>
<p style="margin-top:18px">№ _______ от «____» __________ 20___ г.</p>
<p style="margin-top:18px">Уважаемый Иван Иванович!</p>
<p style="text-indent:1.25cm">Текст письма.</p>
<p style="margin-top:28px">С уважением,<br>Генеральный директор&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_____________&nbsp;&nbsp;&nbsp;&nbsp;И. И. Иванов</p>`;

/** Бланк служебной записки */
export const MEMO_TEMPLATE = `<p style="text-align:right">Директору ООО «Название»<br>И. И. Иванову<br>от ___________________</p>
<h1 style="text-align:center">Служебная записка</h1>
<p style="text-indent:1.25cm">Довожу до Вашего сведения, что ____________________________.</p>
<p style="text-indent:1.25cm">Прошу ____________________________.</p>
<p style="margin-top:28px">«____» __________ 20___ г.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_____________&nbsp;&nbsp;&nbsp;&nbsp;/_____________/</p>`;

/** Бланк отчёта с готовой структурой */
export const REPORT_TEMPLATE = `<p style="text-align:center;font-size:11px;color:#595959">ООО «Название»</p>
<h1 style="text-align:center">Отчёт о проделанной работе</h1>
<p style="text-align:center;color:#595959">за _____________ 20___ г.</p>
<h2>1. Общие сведения</h2>
<p style="text-indent:1.25cm">Текст раздела.</p>
<h2>2. Выполненные работы</h2>
<table style="width:100%;border-collapse:collapse"><tr><th style="border:1px solid #999;padding:6px;background:#d9e2f3">№</th><th style="border:1px solid #999;padding:6px;background:#d9e2f3">Работа</th><th style="border:1px solid #999;padding:6px;background:#d9e2f3">Срок</th></tr><tr><td style="border:1px solid #999;padding:6px">1</td><td style="border:1px solid #999;padding:6px"></td><td style="border:1px solid #999;padding:6px"></td></tr></table>
<h2>3. Выводы</h2>
<p style="text-indent:1.25cm">Текст раздела.</p>
<p style="margin-top:28px">Исполнитель&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_____________&nbsp;&nbsp;&nbsp;&nbsp;/_____________/</p>`;

/** Бланк приказа */
export const ORDER_TEMPLATE = `<p style="text-align:center;font-weight:700;font-size:15px">ООО «Название»</p>
<h1 style="text-align:center">ПРИКАЗ</h1>
<p style="text-align:center">№ _______ от «____» __________ 20___ г.</p>
<p style="margin-top:14px">О ____________________________</p>
<p style="margin-top:14px;text-indent:1.25cm">В связи с ____________________________</p>
<p style="font-weight:700;margin-top:14px">ПРИКАЗЫВАЮ:</p>
<ol><li>____________________________</li><li>Контроль за исполнением приказа оставляю за собой.</li></ol>
<p style="margin-top:28px">Директор&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;_____________&nbsp;&nbsp;&nbsp;&nbsp;И. И. Иванов</p>`;
