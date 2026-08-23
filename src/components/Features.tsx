import Icon from '@/components/ui/icon';

const FEATURES = [
  {
    icon: 'Type',
    title: 'Панель форматирования',
    text: 'Шрифт, кегль, начертание, цвет, выравнивание и межстрочный интервал — всё под рукой в одной строке.',
  },
  {
    icon: 'List',
    title: 'Списки и таблицы',
    text: 'Маркированные и нумерованные списки, таблицы с границами, вставка изображений прямо в текст.',
  },
  {
    icon: 'FileText',
    title: 'Страничный режим A4',
    text: 'Поля 2 см, колонтитулы, автоматическая разбивка на страницы. Что на экране — то и на печати.',
  },
  {
    icon: 'FolderOpen',
    title: 'Меню «Файл»',
    text: 'Создать, открыть, сохранить, экспортировать в HTML, DOC или отправить на печать в PDF.',
  },
  {
    icon: 'Search',
    title: 'Поиск и замена',
    text: 'Найдите слово по всему документу и замените его — по одному вхождению или сразу везде.',
  },
  {
    icon: 'Undo2',
    title: 'Отмена и повтор',
    text: 'История правок, счётчик слов, символов и абзацев обновляется на каждом нажатии клавиши.',
  },
];

const Features = () => (
  <section id="vozmozhnosti" className="border-t border-border py-20">
    <div className="flex items-center gap-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
      Возможности первой версии
      <span className="rule-line h-px flex-1" />
    </div>

    <h2 className="mt-6 max-w-[16em] font-display text-[34px] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[44px]">
      Всё, что нужно для <em className="italic text-primary">рабочего</em>{' '}
      документа
    </h2>

    <div className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((f) => (
        <article
          key={f.title}
          className="group bg-card p-8 transition-colors hover:bg-secondary"
        >
          <Icon
            name={f.icon}
            size={22}
            className="text-primary transition-transform duration-300 group-hover:-translate-y-0.5"
          />
          <h3 className="mt-5 font-display text-xl font-bold tracking-[-0.02em]">
            {f.title}
          </h3>
          <p className="mt-3 text-[0.9rem] leading-[1.6] text-muted-foreground">
            {f.text}
          </p>
        </article>
      ))}
    </div>
  </section>
);

export default Features;
