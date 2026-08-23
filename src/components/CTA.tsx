import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

const CTA = () => (
  <section className="border-t border-border py-20">
    <div className="relative overflow-hidden border border-border bg-primary px-8 py-14 text-primary-foreground sm:px-14">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-primary-foreground/20" />
      <div className="pointer-events-none absolute -bottom-24 right-24 h-72 w-72 rounded-full border border-primary-foreground/10" />

      <div className="relative max-w-[24em]">
        <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground/70">
          Первая версия готова к работе
        </div>
        <h2 className="mt-5 font-display text-[34px] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[44px]">
          Откройте чистый лист А4 прямо сейчас
        </h2>
        <p className="mt-5 leading-[1.6] text-primary-foreground/80">
          Ни установки, ни лицензии, ни регистрации. Документ создаётся в один
          клик, черновик сохраняется автоматически.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            to="/editor"
            className="inline-flex items-center gap-2 rounded-sm bg-primary-foreground px-7 py-3.5 text-[0.92rem] font-semibold text-primary transition-transform duration-200 hover:-translate-y-0.5"
          >
            <Icon name="FilePlus" size={17} />
            Создать документ
          </Link>
          <span className="text-[0.82rem] text-primary-foreground/70">
            Работает в любом современном браузере
          </span>
        </div>
      </div>
    </div>
  </section>
);

export default CTA;
