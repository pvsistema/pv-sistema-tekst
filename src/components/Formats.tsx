import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';

const FORMATS = [
  { name: 'DOC', note: 'Открыть и сохранить', icon: 'FileType' },
  { name: 'HTML', note: 'Экспорт с разметкой', icon: 'Code' },
  { name: 'PDF', note: 'Через печать браузера', icon: 'Printer' },
  { name: 'TXT', note: 'Импорт простого текста', icon: 'FileText' },
];

const FAQ = [
  {
    q: 'Где хранятся мои документы?',
    a: 'В первой версии черновики сохраняются локально в браузере — на сервер ничего не уходит. При сборке настольной версии на C# хранилище подключается к вашей базе или файловой системе организации.',
  },
  {
    q: 'Совпадёт ли печать с тем, что на экране?',
    a: 'Да. Холст жёстко привязан к формату A4 с полями 2 см и показывает границы страниц пунктиром. При печати текст ложится на лист без сдвигов.',
  },
  {
    q: 'Можно ли работать без интернета?',
    a: 'После загрузки страницы редактор работает в браузере: форматирование, таблицы, поиск и замена, счётчик слов не требуют соединения.',
  },
  {
    q: 'Что дальше после веб-версии?',
    a: 'Интерфейс и логика первой версии переносятся в настольное приложение на C#: тот же набор меню, панель форматирования и страничный режим.',
  },
];

const Formats = () => (
  <section id="formaty" className="border-t border-border py-20">
    <div className="grid gap-14 lg:grid-cols-2">
      <div>
        <div className="flex items-center gap-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Форматы
          <span className="rule-line h-px flex-1" />
        </div>

        <h2 className="mt-6 max-w-[12em] font-display text-[34px] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[42px]">
          Документ <em className="italic text-primary">уходит</em> в привычном
          виде
        </h2>

        <div className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2">
          {FORMATS.map((f) => (
            <div key={f.name} className="bg-card p-6">
              <Icon name={f.icon} size={20} className="text-primary" />
              <div className="mt-4 font-display text-lg font-bold">{f.name}</div>
              <div className="mt-1 text-[0.82rem] text-muted-foreground">
                {f.note}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Частые вопросы
          <span className="rule-line h-px flex-1" />
        </div>

        <Accordion type="single" collapsible className="mt-6">
          {FAQ.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left font-display text-[1.05rem] font-medium hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-[0.92rem] leading-[1.65] text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  </section>
);

export default Formats;
