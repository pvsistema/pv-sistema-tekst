import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

const NAV = [
  { label: 'Редактор', href: '#vozmozhnosti' },
  { label: 'Форматы', href: '#formaty' },
  { label: 'Для организаций', href: '#komu' },
];

const Header = () => {
  const [open, setOpen] = useState(false);

  const scrollTo = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="flex items-baseline justify-between border-b border-foreground pb-3.5">
      <Link
        to="/"
        className="font-display text-[1.35rem] font-bold tracking-[-0.02em]"
      >
        ПВ-Система <span className="text-primary">Текст</span>
      </Link>

      <nav className="hidden items-baseline gap-[30px] md:flex">
        {NAV.map((item) => (
          <button
            key={item.href}
            onClick={() => scrollTo(item.href)}
            className="border-b border-transparent pb-0.5 text-[0.8rem] font-medium uppercase tracking-[0.09em] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            {item.label}
          </button>
        ))}
        <Link
          to="/editor"
          className="border-b border-transparent pb-0.5 text-[0.8rem] font-medium uppercase tracking-[0.09em] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        >
          Войти
        </Link>
      </nav>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Меню"
        className="text-foreground md:hidden"
      >
        <Icon name={open ? 'X' : 'Menu'} size={22} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[68px] z-50 animate-fade-in border-y border-border bg-card px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollTo(item.href)}
                className="text-left text-sm uppercase tracking-[0.09em] text-muted-foreground"
              >
                {item.label}
              </button>
            ))}
            <Link
              to="/editor"
              className="text-left text-sm uppercase tracking-[0.09em] text-primary"
            >
              Открыть редактор
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
