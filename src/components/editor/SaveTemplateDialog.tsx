import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Props {
  open: boolean;
  /** Имя открытого документа — подставляем как название бланка */
  docName?: string;
  onClose: () => void;
  onSave: (title: string, hint: string) => void;
}

/** Окно «Сохранить как шаблон» */
const SaveTemplateDialog = ({ open, docName, onClose, onSave }: Props) => {
  const [title, setTitle] = useState('');
  const [hint, setHint] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle(docName && docName !== 'Документ 1' ? docName : '');
    setHint('');
  }, [open, docName]);

  if (!open) return null;

  const ready = title.trim().length > 0;

  const submit = () => {
    if (!ready) return;
    onSave(title.trim(), hint.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[112] flex items-center justify-center bg-slate-900/30"
      onMouseDown={onClose}
    >
      <div
        className="w-[420px] rounded-md bg-[hsl(var(--win-ribbon))] shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          className="flex h-8 items-center justify-between px-3 text-[12px]"
          style={{
            background: 'hsl(var(--win-title))',
            color: 'hsl(var(--win-title-text))',
          }}
        >
          <span>Сохранение шаблона</span>
          <button type="button" onClick={onClose} className="px-1">
            ✕
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div>
            <p className="mb-1 text-[11px] text-slate-600">Имя шаблона</p>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="Например: Письмо ООО Домашний компьютер"
              className="h-[28px] w-full rounded-[2px] border border-slate-300 bg-white px-1.5 text-[12px] outline-none focus:border-primary"
            />
          </div>

          <div>
            <p className="mb-1 text-[11px] text-slate-600">
              Пояснение (необязательно)
            </p>
            <input
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="Для чего этот бланк"
              className="h-[28px] w-full rounded-[2px] border border-slate-300 bg-white px-1.5 text-[12px] outline-none focus:border-primary"
            />
          </div>

          <p className="flex items-start gap-1.5 rounded-[2px] bg-white px-2.5 py-2 text-[11px] leading-tight text-slate-600">
            <Icon name="Info" size={12} className="mt-[1px] shrink-0" />
            <span>
              Бланк попадёт в папку «Шаблоны». Чтобы создать по нему документ,
              откройте «Файл → Создать».
            </span>
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-300 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button size="sm" disabled={!ready} onClick={submit}>
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SaveTemplateDialog;
