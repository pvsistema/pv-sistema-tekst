import Icon from '@/components/ui/icon';

interface DropOverlayProps {
  visible: boolean;
}

/** Подсказка поверх окна, когда пользователь тянет файл в программу */
const DropOverlay = ({ visible }: DropOverlayProps) => {
  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
      <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-white/80 bg-white px-14 py-12 shadow-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Icon name="FileDown" size={32} className="text-primary" />
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900">
            Отпустите файл, чтобы открыть
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Word (.docx), .rtf, .txt или .html
          </p>
        </div>
      </div>
    </div>
  );
};

export default DropOverlay;
