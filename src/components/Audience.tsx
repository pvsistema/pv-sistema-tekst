import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

const GROUPS = [
  {
    id: 'org',
    icon: 'Building2',
    label: 'Сотрудникам организаций',
    title: 'Документооборот без установки программ',
    text: 'Служебные записки, приказы, акты и накладные — по шаблонам с готовыми колонтитулами и нумерацией. Черновики остаются в панели слева, документ открывается на любом рабочем месте.',
    points: [
      'Шаблоны делопроизводства',
      'Единое оформление отдела',
      'Экспорт в DOC и PDF',
    ],
  },
  {
    id: 'gov',
    icon: 'Landmark',
    label: 'Госучреждениям',
    title: 'Требования к оформлению соблюдены',
    text: 'Формат A4, поля 2 см, фиксированная разбивка на страницы. Печатная копия совпадает с экраном — то, что согласовано, то и уходит на подпись.',
    points: [
      'Строгий страничный режим',
      'Работа в закрытом контуре',
      'Сборка на C# для внутренних систем',
    ],
  },
  {
    id: 'edu',
    icon: 'GraduationCap',
    label: 'Студентам и преподавателям',
    title: 'Рефераты и курсовые в срок',
    text: 'Заголовки, списки, таблицы и изображения, счётчик слов и символов прямо в строке состояния. Поиск и замена приводит терминологию к единому виду за один шаг.',
    points: [
      'Счётчик слов и символов',
      'Списки и таблицы',
      'Вставка изображений',
    ],
  },
  {
    id: 'home',
    icon: 'Home',
    label: 'Частным пользователям',
    title: 'Дома, на любом компьютере',
    text: 'Заявление, резюме, письмо или объявление — открывается в браузере и не требует лицензии. Файл можно скачать себе или сразу отправить на печать.',
    points: ['Ничего не нужно устанавливать', 'Работает офлайн', 'Печать в PDF'],
  },
];

const Audience = () => {
  const [active, setActive] = useState(GROUPS[0].id);
  const current = GROUPS.find((g) => g.id === active) ?? GROUPS[0];

  return (
    <section id="komu" className="border-t border-border py-20">
      <div className="flex items-center gap-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Кому подойдёт
        <span className="rule-line h-px flex-1" />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[300px_1fr]">
        <div className="flex flex-col border-t border-border">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setActive(g.id)}
              className={cn(
                'flex items-center gap-3 border-b border-border px-1 py-4 text-left text-[0.95rem] transition-colors',
                g.id === active
                  ? 'font-semibold text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon name={g.icon} size={17} />
              {g.label}
              {g.id === active && (
                <Icon name="ArrowRight" size={15} className="ml-auto" />
              )}
            </button>
          ))}
        </div>

        <article
          key={current.id}
          className="animate-fade-in border border-border bg-card p-8 sm:p-10"
        >
          <h3 className="max-w-[14em] font-display text-[28px] font-medium leading-[1.15] tracking-[-0.02em] sm:text-[34px]">
            {current.title}
          </h3>
          <p className="mt-5 max-w-[34em] leading-[1.65] text-muted-foreground">
            {current.text}
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {current.points.map((p) => (
              <li
                key={p}
                className="flex items-start gap-2 border-t border-border pt-3 text-[0.86rem]"
              >
                <Icon
                  name="Check"
                  size={15}
                  className="mt-0.5 shrink-0 text-primary"
                />
                {p}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
};

export default Audience;
