import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import type { PendingAction } from '@/hooks/use-unsaved-guard';

interface Props {
  action: PendingAction;
  title: string;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

/** Что произойдёт с документом — зависит от того, куда уходит пользователь */
const REASON: Record<Exclude<PendingAction, null>, string> = {
  close: 'перед закрытием программы',
  new: 'перед созданием нового документа',
  open: 'перед открытием другого файла',
  switch: 'перед переходом к другому документу',
};

/** Спрашивает про несохранённые правки, как это делает Word */
const UnsavedDialog = ({
  action,
  title,
  onSave,
  onDiscard,
  onCancel,
}: Props) => {
  if (!action) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40"
      onMouseDown={onCancel}
    >
      <div
        className="w-[440px] rounded-lg bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex gap-4 p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <Icon name="TriangleAlert" size={22} className="text-amber-600" />
          </div>

          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-slate-900">
              Сохранить изменения в документе?
            </p>
            <p className="mt-1.5 break-words text-sm text-slate-600">
              «{title || 'Документ'}» изменён {REASON[action]}. Если не
              сохранить, последние правки будут потеряны.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 rounded-b-lg border-t bg-slate-50 px-6 py-4">
          <Button variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button variant="outline" onClick={onDiscard}>
            Не сохранять
          </Button>
          <Button onClick={onSave}>Сохранить</Button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedDialog;
