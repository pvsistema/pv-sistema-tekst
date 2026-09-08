import { useState } from 'react';
import Icon from '@/components/ui/icon';
import type { PvDocument } from '@/hooks/use-documents';
import { TEMPLATES, DocTemplate } from './fileTemplates';
import TemplateThumb from './TemplateThumb';
import PrintPane from './PrintPane';
import type { DocTheme } from './RibbonDesign';
import type { PageSetup } from './RibbonLayout';

interface Props {
  open: boolean;
  onClose: () => void;
  documents: PvDocument[];
  activeId: string;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onNew: () => void;
  onTemplate: (t: DocTemplate) => void;
  onOpen: () => void;
  onSave: () => void;
  onExportHtml: () => void;
  onExportDoc: () => void;
  onPrint: () => void;
  title: string;
  onTitle: (v: string) => void;
  pinned: string[];
  onTogglePin: (id: string) => void;
  theme: DocTheme;
  setup: PageSetup;
  onSetup: (patch: Partial<PageSetup>) => void;
  pages: number;
  /** Страница, на которой стоит курсор */
  currentPage?: number;
  /** Параметры печати */
  print: import('@/lib/print').PrintSetup;
  onPrintSetup: (patch: Partial<import('@/lib/print').PrintSetup>) => void;
  getHtml: () => string;
  onOptions: () => void;
}

const NAV = [
  { key: 'home', label: 'Главная', icon: 'House' },
  { key: 'new', label: 'Создать', icon: 'FileText' },
  { key: 'open', label: 'Открыть', icon: 'FolderOpen' },
  { key: 'sep' },
  { key: 'info', label: 'Сведения' },
  { key: 'save', label: 'Сохранить' },
  { key: 'saveas', label: 'Сохранить как' },
  { key: 'journal', label: 'Журнал', disabled: true },
  { key: 'print', label: 'Печать' },
  { key: 'share', label: 'Общий доступ' },
  { key: 'export', label: 'Экспорт' },
  { key: 'close', label: 'Закрыть' },
] as const;

const BOTTOM = [
  { key: 'account', label: 'Учетная запись' },
  { key: 'feedback', label: 'Отзывы и предложения' },
  { key: 'options', label: 'Параметры' },
] as const;

type Section = string;

const greeting = () => {
  const h = new Date().getHours();
  if (h < 6) return 'Доброй ночи';
  if (h < 12) return 'Доброе утро';
  if (h < 18) return 'Добрый день';
  return 'Добрый вечер';
};

/** Дата в стиле Word: «Только что», «Вчера в 23:30», «Пн в 1:33» */
const wordDate = (ts: number) => {
  const d = new Date(ts);
  const now = new Date();
  const time = d.toLocaleTimeString('ru-RU', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const diffDays = Math.floor(
    (new Date(now.toDateString()).getTime() -
      new Date(d.toDateString()).getTime()) /
      86_400_000,
  );
  if (now.getTime() - ts < 5 * 60_000) return 'Только что';
  if (diffDays === 0) return `Сегодня в ${time}`;
  if (diffDays === 1) return `Вчера в ${time}`;
  if (diffDays < 7) {
    const wd = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][d.getDay()];
    return `${wd} в ${time}`;
  }
  return d.toLocaleDateString('ru-RU');
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-5 text-[26px] font-light text-[hsl(0_0%_20%)]">{children}</h2>
);

const FlatBtn = ({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-2 rounded-[2px] border border-[hsl(var(--win-ribbon-border))] px-3 py-2 text-[13px] hover:bg-[hsl(var(--win-hover))]"
  >
    <Icon name={icon} size={16} /> {label}
  </button>
);

const FileMenu = (p: Props) => {
  const [section, setSection] = useState<Section>('home');
  const [tab, setTab] = useState<'recent' | 'pinned'>('recent');
  const [createOpen, setCreateOpen] = useState(true);

  if (!p.open) return null;

  const shown =
    tab === 'pinned'
      ? p.documents.filter((d) => p.pinned.includes(d.id))
      : p.documents;

  const nav = (key: string) => {
    if (key === 'save') {
      p.onSave();
      p.onClose();
      return;
    }
    if (key === 'close') {
      p.onClose();
      return;
    }
    setSection(key);
  };

  /* галерея шаблонов */
  const gallery = (
    <div className="flex max-w-[1220px] flex-wrap gap-x-[24px] gap-y-5">
      {TEMPLATES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => {
            p.onTemplate(t);
            p.onClose();
          }}
          className="group w-[128px] text-left"
        >
          <div className="h-[86px] w-[100px] border border-[hsl(var(--win-ribbon-border))] shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-shadow group-hover:border-[hsl(var(--win-title))] group-hover:shadow-[0_2px_6px_rgba(0,0,0,0.2)]">
            <TemplateThumb kind={t.thumb} />
          </div>
          <div className="mt-2 truncate text-[12px] text-[hsl(0_0%_25%)] group-hover:text-[hsl(var(--win-title))]">
            {t.title}
          </div>
        </button>
      ))}
    </div>
  );

  /* список документов */
  const docList = (
    <div className="max-w-[1220px]">
      <div className="flex items-center border-b border-[hsl(var(--win-ribbon-border))] pb-1 text-[12px] text-[hsl(0_0%_45%)]">
        <Icon name="FileText" size={14} className="ml-[10px] mr-3" />
        <span className="flex-1">Имя</span>
        <span className="w-[380px]">Дата изменения</span>
      </div>

      {shown.map((d) => (
        <div
          key={d.id}
          className={`group flex items-center border-b border-[hsl(var(--win-ribbon-border))] py-[7px] ${
            d.id === p.activeId ? 'bg-[hsl(var(--win-hover))]' : 'hover:bg-[hsl(210_40%_97%)]'
          }`}
        >
          <span className="ml-[8px] mr-3 flex h-[18px] w-[16px] items-center justify-center bg-[#2b579a] text-[9px] font-bold text-white">
            W
          </span>
          <button
            type="button"
            onClick={() => {
              p.onSelect(d.id);
              p.onClose();
            }}
            className="flex flex-1 items-center text-left"
          >
            <span className="flex-1">
              <span className="block text-[13px] text-[hsl(0_0%_15%)]">
                {d.title}
              </span>
              <span className="block text-[11px] text-[hsl(0_0%_50%)]">
                Локальное хранилище
              </span>
            </span>
            <span className="w-[380px] text-[12px] text-[hsl(0_0%_35%)]">
              {wordDate(d.updatedAt)}
            </span>
          </button>
          <button
            type="button"
            title={p.pinned.includes(d.id) ? 'Открепить' : 'Закрепить'}
            onClick={() => p.onTogglePin(d.id)}
            className={`mr-2 ${
              p.pinned.includes(d.id) ? '' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <Icon
              name="Pin"
              size={14}
              className={
                p.pinned.includes(d.id)
                  ? 'text-[hsl(var(--win-title))]'
                  : 'text-[hsl(0_0%_45%)]'
              }
            />
          </button>
          <button
            type="button"
            title="Удалить"
            onClick={() => p.onRemove(d.id)}
            className="mr-3 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Icon name="Trash2" size={14} className="text-[hsl(0_60%_45%)]" />
          </button>
        </div>
      ))}

      {!shown.length && (
        <div className="py-6 text-[13px] text-[hsl(0_0%_45%)]">
          Список пуст
        </div>
      )}
    </div>
  );

  return (
    <div className="absolute inset-0 z-50 flex bg-white">
      {/* левая синяя панель */}
      <div
        className="flex w-[190px] shrink-0 flex-col py-1 text-white"
        style={{ background: 'hsl(var(--win-title))' }}
      >
        <button
          type="button"
          onClick={p.onClose}
          title="Назад"
          className="mb-4 flex h-10 w-12 items-center justify-center"
        >
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-white/70">
            <Icon name="ArrowLeft" size={14} />
          </span>
        </button>

        {NAV.map((i, idx) =>
          i.key === 'sep' ? (
            <span key={idx} className="my-2 mx-4 h-px bg-white/25" />
          ) : (
            <button
              key={i.key}
              type="button"
              disabled={'disabled' in i && i.disabled}
              onClick={() => nav(i.key)}
              className={`flex items-center gap-3 py-[6px] pl-4 pr-3 text-left text-[13px] transition-colors ${
                'disabled' in i && i.disabled
                  ? 'cursor-default text-white/40'
                  : section === i.key
                    ? 'bg-white/25'
                    : 'hover:bg-white/15'
              }`}
            >
              {'icon' in i && i.icon ? (
                <Icon name={i.icon as string} size={15} />
              ) : (
                <span className="w-[15px]" />
              )}
              {i.label}
            </button>
          ),
        )}

        <div className="mt-auto border-t border-white/25 pt-2">
          {BOTTOM.map((b) => (
            <button
              key={b.key}
              type="button"
              onClick={() =>
                b.key === 'options' ? p.onOptions() : setSection(b.key)
              }
              className={`flex w-full items-center py-[6px] pl-4 pr-3 text-left text-[13px] ${
                section === b.key ? 'bg-white/25' : 'hover:bg-white/15'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* правая область */}
      <div
        className={`flex-1 bg-white px-8 py-5 ${
          section === 'print' ? 'min-h-0 overflow-hidden' : 'overflow-auto'
        }`}
      >
        {section === 'home' && (
          <>
            <h2 className="mb-6 text-[26px] font-light text-[hsl(0_0%_20%)]">
              {greeting()}
            </h2>

            <button
              type="button"
              onClick={() => setCreateOpen((v) => !v)}
              className="mb-4 flex items-center gap-1 text-[15px] text-[hsl(0_0%_25%)]"
            >
              <Icon name={createOpen ? 'ChevronDown' : 'ChevronRight'} size={16} />
              Создать
            </button>

            {createOpen && (
              <>
                {gallery}
                <div className="my-4 flex max-w-[1220px] justify-end">
                  <button
                    type="button"
                    onClick={() => setSection('new')}
                    className="flex items-center gap-2 text-[13px] font-semibold text-[hsl(var(--win-title))] hover:underline"
                  >
                    Другие шаблоны <Icon name="ArrowRight" size={15} />
                  </button>
                </div>
              </>
            )}

            <div className="mb-3 mt-6 flex gap-6 border-b border-[hsl(var(--win-ribbon-border))]">
              {(['recent', 'pinned'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`-mb-px border-b-2 pb-2 text-[14px] ${
                    tab === t
                      ? 'border-[hsl(var(--win-title))] font-semibold text-[hsl(0_0%_20%)]'
                      : 'border-transparent text-[hsl(0_0%_40%)] hover:text-[hsl(0_0%_20%)]'
                  }`}
                >
                  {t === 'recent' ? 'Последние' : 'Закрепленные'}
                </button>
              ))}
            </div>

            {docList}

            <div className="mt-4 flex max-w-[1220px] justify-end">
              <button
                type="button"
                onClick={() => setSection('open')}
                className="flex items-center gap-2 text-[13px] font-semibold text-[hsl(var(--win-title))] hover:underline"
              >
                Другие документы <Icon name="ArrowRight" size={15} />
              </button>
            </div>
          </>
        )}

        {section === 'new' && (
          <>
            <SectionTitle>Создать</SectionTitle>
            {gallery}
          </>
        )}

        {section === 'open' && (
          <>
            <SectionTitle>Открыть</SectionTitle>
            <div className="mb-5">
              <FlatBtn
                icon="HardDrive"
                label="Обзор на этом компьютере"
                onClick={p.onOpen}
              />
            </div>
            {docList}
          </>
        )}

        {section === 'saveas' && (
          <>
            <SectionTitle>Сохранить как</SectionTitle>
            <input
              value={p.title}
              onChange={(e) => p.onTitle(e.target.value)}
              placeholder="Имя файла"
              className="mb-4 h-8 w-[360px] rounded-[2px] border border-[hsl(var(--win-ribbon-border))] px-2 text-[13px] outline-none focus:border-[hsl(var(--win-title))]"
            />
            <div className="flex flex-col items-start gap-2">
              <FlatBtn icon="FileType2" label="Документ Word (.docx)" onClick={p.onExportDoc} />
              <FlatBtn icon="Code" label="Веб-страница (.html)" onClick={p.onExportHtml} />
              <FlatBtn icon="FileDown" label="PDF (через печать)" onClick={p.onPrint} />
            </div>
          </>
        )}

        {section === 'export' && (
          <>
            <SectionTitle>Экспорт</SectionTitle>
            <div className="flex flex-col items-start gap-2">
              <FlatBtn icon="FileDown" label="Создать документ PDF" onClick={p.onPrint} />
              <FlatBtn icon="FileType2" label="Изменить тип файла (.docx)" onClick={p.onExportDoc} />
              <FlatBtn icon="Code" label="Веб-страница (.html)" onClick={p.onExportHtml} />
            </div>
          </>
        )}

        {section === 'print' && (
          <div className="flex h-full min-h-0 flex-col">
            <SectionTitle>Печать</SectionTitle>
            <div className="min-h-0 flex-1">
              <PrintPane
                getHtml={p.getHtml}
                theme={p.theme}
                setup={p.setup}
                onSetup={p.onSetup}
                pages={p.pages}
                currentPage={p.currentPage}
                print={p.print}
                onPrintSetup={p.onPrintSetup}
                onPrint={p.onPrint}
                onOptions={() => setSection('info')}
              />
            </div>
          </div>
        )}

        {section === 'share' && (
          <>
            <SectionTitle>Общий доступ</SectionTitle>
            <div className="flex flex-col items-start gap-2">
              <FlatBtn
                icon="Link"
                label="Скопировать ссылку на документ"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                }}
              />
              <FlatBtn icon="Mail" label="Отправить копию файлом" onClick={p.onExportDoc} />
            </div>
          </>
        )}

        {section === 'info' && (
          <>
            <SectionTitle>Сведения</SectionTitle>
            <div className="space-y-1 text-[13px] text-[hsl(0_0%_30%)]">
              <div>Документ: {p.title || 'Без имени'}</div>
              <div>Формат страницы: A4</div>
              <div>Документов в списке: {p.documents.length}</div>
              <div>Закреплено: {p.pinned.length}</div>
              <div>Хранение: локально в браузере</div>
            </div>
          </>
        )}

        {section === 'account' && (
          <>
            <SectionTitle>Учетная запись</SectionTitle>
            <div className="space-y-1 text-[13px] text-[hsl(0_0%_30%)]">
              <div>Пользователь: локальный сеанс</div>
              <div>Продукт: ПВ-Система Текст</div>
            </div>
          </>
        )}

        {section === 'feedback' && (
          <>
            <SectionTitle>Отзывы и предложения</SectionTitle>
            <p className="max-w-[560px] text-[13px] text-[hsl(0_0%_30%)]">
              Напишите, чего не хватает в редакторе — учтём в следующих
              обновлениях.
            </p>
          </>
        )}


      </div>
    </div>
  );
};

export default FileMenu;