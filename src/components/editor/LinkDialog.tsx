import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export interface LinkSetup {
  /** Текст, который увидит читатель */
  text: string;
  /** Куда ведёт ссылка */
  href: string;
  /** Всплывающая подсказка */
  tip: string;
  /** Открывать в новой вкладке */
  blank: boolean;
}

interface Props {
  open: boolean;
  /** Выделенный текст и уже стоящая ссылка, если курсор внутри неё */
  initial: LinkSetup;
  /** Заголовки документа — для ссылок внутрь текста */
  headings: { id: string; text: string; level: number }[];
  /** Можно ли убрать ссылку: курсор стоит внутри существующей */
  canRemove: boolean;
  onClose: () => void;
  onApply: (setup: LinkSetup) => void;
  onRemove: () => void;
}

const inputCls =
  'h-[26px] w-full rounded-[2px] border border-slate-300 bg-white px-1.5 text-[12px] outline-none focus:border-[hsl(var(--win-title))]';

/** Быстрые заготовки адреса — экономят набор */
const PREFIXES = [
  { label: 'Сайт', value: 'https://', icon: 'Globe' },
  { label: 'Почта', value: 'mailto:', icon: 'Mail' },
  { label: 'Телефон', value: 'tel:+7', icon: 'Phone' },
];

/** Окно «Вставка гиперссылки» — вместо системного окошка браузера */
const LinkDialog = ({
  open,
  initial,
  headings,
  canRemove,
  onClose,
  onApply,
  onRemove,
}: Props) => {
  const [s, setS] = useState<LinkSetup>(initial);
  const [mode, setMode] = useState<'web' | 'place'>('web');

  useEffect(() => {
    if (!open) return;
    setS(initial);
    setMode(initial.href.startsWith('#') ? 'place' : 'web');
  }, [open, initial]);

  if (!open) return null;

  const patch = (v: Partial<LinkSetup>) => setS((x) => ({ ...x, ...v }));

  const ready = s.href.trim().length > 1;

  const apply = () => {
    if (!ready) return;
    onApply({ ...s, text: s.text.trim() || s.href });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[118] flex items-center justify-center bg-slate-900/30"
      onMouseDown={onClose}
    >
      <div
        className="w-[540px] rounded-md bg-[hsl(var(--win-ribbon))] shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          className="flex h-8 items-center justify-between px-3 text-[12px]"
          style={{
            background: 'hsl(var(--win-title))',
            color: 'hsl(var(--win-title-text))',
          }}
        >
          <span>Вставка гиперссылки</span>
          <button type="button" onClick={onClose} className="px-1">
            ✕
          </button>
        </div>

        <div className="flex gap-1 border-b border-slate-300 px-4 pt-3">
          {[
            { id: 'web' as const, label: 'Файлом, веб-страницей' },
            { id: 'place' as const, label: 'Местом в документе' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setMode(t.id)}
              className={`rounded-t-[3px] border border-b-0 px-3 py-1.5 text-[12px] ${
                mode === t.id
                  ? 'border-slate-300 bg-white font-medium'
                  : 'border-transparent text-slate-600 hover:bg-white/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-3 p-4">
          <div>
            <p className="mb-1 text-[11px] text-slate-600">Текст</p>
            <input
              value={s.text}
              onChange={(e) => patch({ text: e.target.value })}
              placeholder="Текст, который увидит читатель"
              className={inputCls}
            />
          </div>

          {mode === 'web' ? (
            <div>
              <p className="mb-1 text-[11px] text-slate-600">Адрес</p>
              <input
                autoFocus
                value={s.href}
                onChange={(e) => patch({ href: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && apply()}
                placeholder="https://example.ru"
                className={inputCls}
              />

              <div className="mt-1.5 flex gap-1.5">
                {PREFIXES.map((x) => (
                  <button
                    key={x.value}
                    type="button"
                    onClick={() => patch({ href: x.value })}
                    className="flex items-center gap-1 rounded-[2px] border border-slate-300 bg-white px-2 py-1 text-[11px] hover:border-[hsl(var(--win-title))]"
                  >
                    <Icon name={x.icon} size={11} />
                    {x.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-1 text-[11px] text-slate-600">
                Выберите заголовок документа
              </p>

              {!headings.length && (
                <p className="rounded-[2px] border border-slate-300 bg-white px-2 py-3 text-center text-[11px] text-slate-500">
                  В документе пока нет заголовков. Примените стиль «Заголовок 1»
                  к нужным строкам
                </p>
              )}

              {!!headings.length && (
                <div className="max-h-[150px] overflow-auto rounded-[2px] border border-slate-300 bg-white">
                  {headings.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => patch({ href: `#${h.id}` })}
                      className={`block w-full px-2 py-[5px] text-left text-[12px] hover:bg-[hsl(var(--win-hover))] ${
                        s.href === `#${h.id}`
                          ? 'bg-[hsl(var(--win-hover))] font-medium'
                          : ''
                      }`}
                      style={{ paddingLeft: 8 + (h.level - 1) * 14 }}
                    >
                      {h.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <p className="mb-1 text-[11px] text-slate-600">
              Подсказка при наведении
            </p>
            <input
              value={s.tip}
              onChange={(e) => patch({ tip: e.target.value })}
              placeholder="Необязательно"
              className={inputCls}
            />
          </div>

          {mode === 'web' && (
            <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-slate-700">
              <input
                type="checkbox"
                checked={s.blank}
                onChange={(e) => patch({ blank: e.target.checked })}
                className="h-3.5 w-3.5 accent-[hsl(var(--win-title))]"
              />
              Открывать в новой вкладке
            </label>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-300 px-4 py-3">
          {canRemove && (
            <Button
              variant="outline"
              size="sm"
              className="mr-auto"
              onClick={() => {
                onRemove();
                onClose();
              }}
            >
              Удалить ссылку
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button size="sm" disabled={!ready} onClick={apply}>
            ОК
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LinkDialog;
