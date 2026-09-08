import {
  LETTER_TEMPLATE,
  MEMO_TEMPLATE,
  ORDER_TEMPLATE,
  REPORT_TEMPLATE,
} from '@/lib/templates';

export interface DocTemplate {
  id: string;
  title: string;
  /** вид миниатюры в галерее «Создать» */
  thumb:
    | 'blank'
    | 'welcome'
    | 'single'
    | 'resume'
    | 'toc'
    | 'chrono'
    | 'chrono2'
    | 'letter'
    | 'letter2'
    | 'blank-form'
    | 'memo'
    | 'report'
    | 'order';
  html: string;
}

const RESUME = `<h1>Иванов Сергей Петрович</h1>
<p>Москва · +7 900 000-00-00 · mail@example.ru</p>
<h2>Опыт работы</h2>
<p><b>Ведущий специалист</b>, ООО «Компания», 2021 — настоящее время</p>
<ul><li>Ведение документооборота подразделения</li><li>Подготовка отчётности и регламентов</li></ul>
<h2>Образование</h2>
<p>Высшее, экономика и управление, 2018</p>
<h2>Навыки</h2>
<ul><li>Делопроизводство</li><li>Работа с текстовыми редакторами</li></ul>`;

const COVER = `<p>Кому: отдел подбора персонала</p>
<h1>Сопроводительное письмо</h1>
<p>Уважаемые коллеги!</p>
<p>Направляю резюме на вакансию специалиста. Считаю, что мой опыт работы с документами и отчётностью будет полезен вашей команде.</p>
<p>Готов обсудить детали на собеседовании в удобное для вас время.</p>
<p>С уважением,<br>Иванов С. П.</p>`;

export const TEMPLATES: DocTemplate[] = [
  {
    id: 'blank',
    title: 'Новый документ',
    thumb: 'blank',
    html: '<p><br></p>',
  },
  {
    id: 'welcome',
    title: 'Добро пожаловать в Word',
    thumb: 'welcome',
    html: `<h1>Обзор возможностей</h1>
<p>Этот документ показывает, как работают заголовки, списки и таблицы в редакторе.</p>
<h2>Форматирование</h2>
<p>Выделите текст и примените стиль на вкладке «Главная» — начертание, размер и цвет меняются сразу.</p>
<h2>Разметка страницы</h2>
<p>Поля, ориентация и колонки настраиваются на вкладке «Макет», внешний вид документа — на вкладке «Конструктор».</p>`,
  },
  {
    id: 'single',
    title: 'С одинарным интервалом (пустой)',
    thumb: 'single',
    html: '<h1>Заголовок</h1><p>Текст с одинарным межстрочным интервалом.</p>',
  },
  {
    id: 'resume-blue',
    title: 'Резюме (серо-голубое оформление)',
    thumb: 'resume',
    html: RESUME,
  },
  {
    id: 'toc',
    title: 'Руководство по добавлению оглавления',
    thumb: 'toc',
    html: `<h1>Оглавление</h1>
<p>1. Введение</p><p>2. Основная часть</p><p>3. Заключение</p>
<h1>1. Введение</h1><p>Опишите цель документа и его задачи.</p>
<h1>2. Основная часть</h1><p>Изложите материал по разделам.</p>
<h1>3. Заключение</h1><p>Сформулируйте выводы.</p>`,
  },
  {
    id: 'chrono-resume',
    title: 'Современное хронологическое резюме',
    thumb: 'chrono',
    html: RESUME,
  },
  {
    id: 'chrono-letter',
    title: 'Современное хронологическое письмо',
    thumb: 'chrono2',
    html: COVER,
  },
  {
    id: 'cover-1',
    title: 'Сопроводительное письмо (хронологическое)',
    thumb: 'letter',
    html: COVER,
  },
  {
    id: 'cover-2',
    title: 'Сопроводительное письмо (современное)',
    thumb: 'letter2',
    html: COVER,
  },
  {
    id: 'business-letter',
    title: 'Бланк делового письма',
    thumb: 'blank-form',
    html: LETTER_TEMPLATE,
  },
  {
    id: 'memo',
    title: 'Служебная записка',
    thumb: 'memo',
    html: MEMO_TEMPLATE,
  },
  {
    id: 'report',
    title: 'Отчёт о проделанной работе',
    thumb: 'report',
    html: REPORT_TEMPLATE,
  },
  {
    id: 'order',
    title: 'Приказ',
    thumb: 'order',
    html: ORDER_TEMPLATE,
  },
];
