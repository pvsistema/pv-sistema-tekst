import { useState } from 'react';
import Icon from '@/components/ui/icon';
import type { PvDocument } from '@/hooks/use-documents';

interface Props {
  open: boolean;
  onClose: () => void;
  documents: PvDocument[];
  activeId: string;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onExportHtml: () => void;
  onExportDoc: () => void;
  onPrint: () => void;
  title: string;
  onTitle: (v: string) => void;
}

const ITEMS = [
  { key: 'new', label: 'Создать', icon: 'FilePlus2' },
  { key: 'open', label: 'Открыть', icon: 'FolderOpen' },
  { key: 'save', label: 'Сохранить', icon: 'Save' },
  { key: 'saveas', label: 'Сохранить как', icon: 'Download' },
  { key: 'print', label: 'Печать', icon: 'Printer' },
  { key: 'info', label: 'Сведения', icon: 'Info' },
] as const;

type ItemKey = (typeof ITEMS)[number]['key'];

const FileMenu = (p: Props) => {
  const [section, setSection] = useState<ItemKey>('open');

  if (!p.open) return null;

  return (
    <div className="absolute inset-0 z-50 flex bg-white">
      {/* левая колонка */}
      <div
        className="flex w-[180px] shrink-0 flex-col py-2 text-white"
        style={{ background: 'hsl(var(--win-title))' }}
      >
        <button
          type="button"
          onClick={p.onClose}
          className="mb-3 flex items-center gap-2 px-4 py-2 text-[13px] hover:bg-white/15"
        >
          <Icon name="ArrowLeft" size={18} />
        </button>

        {ITEMS.map((i) => (
          <button
            key={i.key}
            type="button"
            onClick={() => {
              if (i.key === 'new') {
                p.onNew();
                p.onClose();
              } else if (i.key === 'save') {
                p.onSave();
                p.onClose();
              } else {
                setSection(i.key);
              }
            }}
            className={`flex items-center gap-2 px-4 py-[7px] text-left text-[13px] transition-colors ${
              section === i.key ? 'bg-white/20' : 'hover:bg-white/15'
            }`}
          >
            <Icon name={i.icon} size={15} />
            {i.label}
          </button>
        ))}

        <div className="mt-auto px-4 pb-1 text-[11px] text-white/60">
          ПВ-Система Текст
        </div>
      </div>

      {/* правая область */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {section === 'open' && (
          <>
            <h2 className="mb-5 text-[24px] font-light text-[hsl(0_0%_20%)]">
              Открыть
            </h2>
            <button
              type="button"
              onClick={p.onOpen}
              className="mb-5 flex items-center gap-2 rounded-[2px] border border-[hsl(var(--win-ribbon-border))] px-3 py-2 text-[13px] hover:bg-[hsl(var(--win-hover))]"
            >
              <Icon name="HardDrive" size={16} /> Обзор на этом компьютере
            </button>

            <div className="mb-2 text-[13px] font-semibold text-[hsl(0_0%_30%)]">
              Последние документы
            </div>
            <div className="max-w-[620px] divide-y divide-[hsl(var(--win-ribbon-border))] border border-[hsl(var(--win-ribbon-border))]">
              {p.documents.map((d) => (
                <div
                  key={d.id}
                  className={`group flex items-center gap-3 px-3 py-2 ${
                    d.id === p.activeId ? 'bg-[hsl(var(--win-hover))]' : ''
                  }`}
                >
                  <Icon name="FileText" size={16} className="text-[hsl(var(--win-title))]" />
                  <button
                    type="button"
                    onClick={() => {
                      p.onSelect(d.id);
                      p.onClose();
                    }}
                    className="flex-1 text-left"
                  >
                    <div className="text-[13px]">{d.title}</div>
                    <div className="text-[11px] text-[hsl(0_0%_45%)]">
                      {new Date(d.updatedAt).toLocaleString('ru-RU')}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => p.onRemove(d.id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    title="Удалить"
                  >
                    <Icon name="Trash2" size={15} className="text-[hsl(0_60%_45%)]" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {section === 'saveas' && (
          <>
            <h2 className="mb-5 text-[24px] font-light text-[hsl(0_0%_20%)]">
              Сохранить как
            </h2>
            <input
              value={p.title}
              onChange={(e) => p.onTitle(e.target.value)}
              placeholder="Имя файла"
              className="mb-4 h-8 w-[360px] rounded-[2px] border border-[hsl(var(--win-ribbon-border))] px-2 text-[13px] outline-none focus:border-[hsl(var(--win-title))]"
            />
            <div className="flex flex-col items-start gap-2">
              <button
                type="button"
                onClick={p.onExportDoc}
                className="flex items-center gap-2 rounded-[2px] border border-[hsl(var(--win-ribbon-border))] px-3 py-2 text-[13px] hover:bg-[hsl(var(--win-hover))]"
              >
                <Icon name="FileType2" size={16} /> Документ Word (.doc)
              </button>
              <button
                type="button"
                onClick={p.onExportHtml}
                className="flex items-center gap-2 rounded-[2px] border border-[hsl(var(--win-ribbon-border))] px-3 py-2 text-[13px] hover:bg-[hsl(var(--win-hover))]"
              >
                <Icon name="Code" size={16} /> Веб-страница (.html)
              </button>
              <button
                type="button"
                onClick={p.onPrint}
                className="flex items-center gap-2 rounded-[2px] border border-[hsl(var(--win-ribbon-border))] px-3 py-2 text-[13px] hover:bg-[hsl(var(--win-hover))]"
              >
                <Icon name="FileDown" size={16} /> PDF (через печать)
              </button>
            </div>
          </>
        )}

        {section === 'print' && (
          <>
            <h2 className="mb-5 text-[24px] font-light text-[hsl(0_0%_20%)]">Печать</h2>
            <button
              type="button"
              onClick={p.onPrint}
              className="flex items-center gap-2 rounded-[2px] px-4 py-2 text-[13px] text-white"
              style={{ background: 'hsl(var(--win-title))' }}
            >
              <Icon name="Printer" size={16} /> Печать документа
            </button>
          </>
        )}

        {section === 'info' && (
          <>
            <h2 className="mb-5 text-[24px] font-light text-[hsl(0_0%_20%)]">
              Сведения
            </h2>
            <div className="space-y-1 text-[13px] text-[hsl(0_0%_30%)]">
              <div>Документ: {p.title || 'Без имени'}</div>
              <div>Формат страницы: A4, поля 2 см</div>
              <div>Документов в списке: {p.documents.length}</div>
              <div>Хранение: локально в браузере</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FileMenu;
