import { Link } from 'react-router-dom';

const RULER = Array.from({ length: 20 }, (_, i) => i);

const Hero = () => (
  <section className="grid items-end gap-[72px] pb-4 lg:grid-cols-[1fr_468px]">
    <div className="max-w-[560px] animate-rise pt-10 lg:pt-[62px]">
      <div className="flex items-center gap-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Редактор документов в браузере
        <span className="rule-line h-px flex-1" />
      </div>

      <h1 className="mt-6 font-display text-[44px] font-medium leading-[1.06] tracking-[-0.035em] sm:text-[56px] lg:text-[68px]">
        Страница&nbsp;А4 <em className="italic text-primary">открывается</em> за
        две секунды
      </h1>

      <p className="mt-6 max-w-[26em] leading-[1.55] text-muted-foreground">
        Поля, колонтитулы и&nbsp;разбивка на&nbsp;страницы — как в&nbsp;настольном
        редакторе. Таблицы, списки, изображения, поиск и&nbsp;замена. Готовый
        документ уходит в&nbsp;
        <b className="font-medium text-foreground">DOCX или PDF</b>, черновики
        остаются в&nbsp;панели слева.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-[22px]">
        <Link
          to="/editor"
          className="inline-block rounded-sm bg-primary px-[30px] py-[15px] text-[0.92rem] font-semibold tracking-[0.02em] text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5"
        >
          Создать документ
        </Link>
        <span className="max-w-[15em] text-[0.8rem] leading-[1.4] text-muted-foreground">
          Или откройте свой файл — форматирование сохранится.
        </span>
      </div>
    </div>

    <div className="hidden w-[468px] animate-sheetin self-end lg:block">
      <div className="mb-[9px] flex h-5 items-end">
        {RULER.map((i) => (
          <i
            key={i}
            className={
              i === 2 || i === 17
                ? 'block h-[17px] flex-1 border-l border-primary'
                : `block flex-1 border-l border-[hsl(var(--hero-rule))] ${
                    i % 5 === 0 ? 'h-[11px]' : 'h-[5px]'
                  }`
            }
          />
        ))}
      </div>

      <div className="paper-shadow relative h-[640px] rounded-t-sm border border-b-0 border-[hsl(var(--hero-paper-edge))] bg-card px-[52px] pt-[44px]">
        <div className="flex justify-between border-b border-[hsl(var(--hero-rule))] pb-[9px] text-[0.66rem] uppercase tracking-[0.13em] text-muted-foreground">
          <span>Служебная записка</span>
          <span>Поля&nbsp;2&nbsp;см</span>
        </div>

        <div className="mt-[26px] font-display text-[1.55rem] font-bold leading-[1.15] tracking-[-0.02em]">
          О переходе отдела на&nbsp;электронный документооборот
        </div>
        <div className="mt-2 text-[0.76rem] tracking-[0.02em] text-muted-foreground">
          Черновик · сохранён 3&nbsp;минуты назад
        </div>

        <p className="doc-body-text mt-[22px] text-justify text-[0.84rem] leading-[1.72] hyphens-auto">
          Прошу согласовать перевод входящей корреспонденции отдела
          в&nbsp;электронный вид с&nbsp;1&nbsp;октября. Шаблоны приказов, актов
          и&nbsp;служебных записок уже собраны,{' '}
          <mark className="bg-[hsl(var(--hero-select))] text-foreground">
            нумерация страниц
          </mark>{' '}
          и&nbsp;колонтитулы настроены по&nbsp;требованиям делопроизводства.
        </p>
        <p className="mt-3 text-justify text-[0.84rem] leading-[1.72] text-foreground">
          Печатная копия сохраняет разметку: то, что видно на&nbsp;экране,
          ложится на&nbsp;лист без сдвигов
          <span className="ml-px inline-block h-[1.05em] w-[1.5px] animate-blink bg-[hsl(var(--hero-mark))] align-[-0.18em]" />
        </p>

        <div className="absolute bottom-[34px] left-[52px] right-[52px] z-10 flex justify-between border-t border-[hsl(var(--hero-rule))] pt-[9px] text-[0.68rem] uppercase tracking-[0.08em] text-muted-foreground">
          <span>
            Слов: <b className="font-semibold text-foreground">214</b>
          </span>
          <span>
            Страница <b className="font-semibold text-foreground">1</b> из 3
          </span>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-background" />
      </div>
    </div>
  </section>
);

export default Hero;