import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t border-foreground py-10">
    <div className="flex flex-col gap-6 sm:flex-row sm:items-baseline sm:justify-between">
      <div>
        <div className="font-display text-[1.2rem] font-bold tracking-[-0.02em]">
          ПВ-Система <span className="text-primary">Текст</span>
        </div>
        <p className="mt-2 max-w-[26em] text-[0.85rem] leading-[1.5] text-muted-foreground">
          Веб-редактор текстовых документов формата A4. Первая версия — основа
          для настольного приложения на C#.
        </p>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-2 text-[0.78rem] uppercase tracking-[0.09em] text-muted-foreground">
        <Link to="/editor" className="story-link hover:text-foreground">
          Редактор
        </Link>
        <a href="#vozmozhnosti" className="story-link hover:text-foreground">
          Возможности
        </a>
        <a href="#formaty" className="story-link hover:text-foreground">
          Форматы
        </a>
        <a href="#komu" className="story-link hover:text-foreground">
          Кому подойдёт
        </a>
      </div>
    </div>

    <div className="mt-8 border-t border-border pt-5 text-[0.75rem] uppercase tracking-[0.09em] text-muted-foreground">
      © {new Date().getFullYear()} ПВ-Система Текст
    </div>
  </footer>
);

export default Footer;
