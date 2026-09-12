import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Props {
  open: boolean;
  /** Сколько всего страниц в документе */
  pages: number;
  onClose: () => void;
  onGo: (page: number) => void;
}

/** Окно «Перейти» — курсор встаёт в начало нужной страницы, как в Word */
const GoToDialog = ({ open, pages, onClose, onGo }: Props) => {
  const [text, setText] = useState('1');

  useEffect(() => {
    if (open) setText('1');
  }, [open]);

  if (!open) return null;

  const page = Number(text);
  const valid = Number.isFinite(page) && page >= 1 && page <= pages;

  const go = () => {
    if (!valid) return;
    onGo(page);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/25">
      <div className="w-[330px] rounded-[3px] border border-[hsl(var(--win-ribbon-border))] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[hsl(var(--win-ribbon-border))] bg-[hsl(0_0%_96%)] px-3 py-1.5">
          <span className="text-[12px] font-semibold">Перейти</span>
          <button
            type="button"
            title="Закрыть"
            onClick={onClose}
            className="flex h-[18px] w-[18px] items-center justify-center rounded-[2px] hover:bg-[hsl(0_70%_60%)] hover:text-white"
          >
            <Icon name="X" size={12} />
          </button>
        </div>

        <div className="p-3">
          <p className="mb-1.5 text-[11px] text-slate-600">
            Введите номер страницы (всего: {pages})
          </p>

          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value.replace(/[^\d]/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && go()}
            className="h-[24px] w-full rounded-[2px] border border-[hsl(var(--win-ribbon-border))] px-2 text-[12px] outline-none focus:border-[hsl(var(--win-title))]"
          />

          {!valid && text !== '' && (
            <p className="mt-1 text-[10px] text-[hsl(0_70%_45%)]">
              Такой страницы нет в документе
            </p>
          )}

          <div className="mt-3 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button size="sm" disabled={!valid} onClick={go}>
              Перейти
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoToDialog;
