import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { RibbonGroup, BigCmd, SmallCmd, Stack } from './RibbonControls';
import type { TabActions } from './RibbonTabs';

export interface ReviewProps extends TabActions {
  onSpelling: () => void;
  onThesaurus: () => void;
  onStats: () => void;
  onReadAloud: () => void;
  onReadability: () => void;
  onTranslate: () => void;
  onLanguage: () => void;
  onNewComment: () => void;
  onDeleteComment: () => void;
  onPrevComment: () => void;
  onNextComment: () => void;
  showComments: boolean;
  onToggleComments: () => void;
  trackChanges: boolean;
  onToggleTrack: () => void;
  onShowMarkup: () => void;
  onReviewPane: () => void;
  onAcceptChange: () => void;
  onRejectChange: () => void;
  onCompare: () => void;
  onRestrict: () => void;
  markupView: string;
  onMarkupView: (v: string) => void;
  hasComments: boolean;
  hasChanges: boolean;
}

const MARKUP_VIEWS = [
  'Исправления',
  'Все исправления',
  'Без исправлений',
  'Исходный документ',
];

/** Большая кнопка с текстовой пиктограммой «ABC» — как в группе «Правописание» */
const AbcBig = ({
  sub,
  label,
  onClick,
  width = 62,
}: {
  sub: string;
  label: string;
  onClick: () => void;
  width?: number;
}) => (
  <button
    type="button"
    title={label}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className="win-btn h-[68px] shrink-0 flex-col justify-start gap-[2px] px-1 pt-1"
    style={{ width }}
  >
    <span className="flex h-[28px] flex-col items-center justify-center leading-none">
      <span className="text-[11px] font-semibold text-[hsl(0_0%_25%)]">ABC</span>
      <span className="text-[13px] leading-tight text-[hsl(215_60%_38%)]">
        {sub}
      </span>
    </span>
    <span className="text-center text-[10px] leading-[1.15]">{label}</span>
  </button>
);

const RibbonReview = (p: ReviewProps) => {
  const [viewOpen, setViewOpen] = useState(false);

  return (
    <>
      <RibbonGroup title="Правописание">
        <AbcBig sub="✓" label="Правописание" onClick={p.onSpelling} width={70} />
        <BigCmd
          icon="BookOpen"
          lines={['Тезаурус']}
          width={54}
          onClick={p.onThesaurus}
        />
        <AbcBig sub="123" label="Статистика" onClick={p.onStats} width={62} />
      </RibbonGroup>

      <RibbonGroup title="Речь">
        <BigCmd
          icon="Volume2"
          lines={['Прочесть', 'вслух']}
          width={58}
          onClick={p.onReadAloud}
        />
      </RibbonGroup>

      <RibbonGroup title="Специальные возможности">
        <BigCmd
          icon="Accessibility"
          lines={['Проверить', 'читаемость']}
          caret
          width={70}
          onClick={p.onReadability}
        />
      </RibbonGroup>

      <RibbonGroup title="Язык">
        <BigCmd
          icon="Languages"
          lines={['Перевод']}
          caret
          width={56}
          onClick={p.onTranslate}
        />
        <BigCmd
          icon="Globe"
          lines={['Язык']}
          caret
          width={48}
          onClick={p.onLanguage}
        />
      </RibbonGroup>

      <RibbonGroup title="Примечания">
        <BigCmd
          icon="MessageSquarePlus"
          lines={['Создать', 'примечание']}
          width={68}
          onClick={p.onNewComment}
        />
        <BigCmd
          icon="MessageSquareX"
          lines={['Удалить']}
          caret
          width={52}
          onClick={p.onDeleteComment}
          disabled={!p.hasComments}
        />
        <BigCmd
          icon="CornerUpLeft"
          lines={['Предыдущее']}
          width={68}
          onClick={p.onPrevComment}
          disabled={!p.hasComments}
        />
        <BigCmd
          icon="CornerUpRight"
          lines={['Следующее']}
          width={64}
          onClick={p.onNextComment}
          disabled={!p.hasComments}
        />
        <button
          type="button"
          title="Показать примечания"
          onMouseDown={(e) => e.preventDefault()}
          onClick={p.onToggleComments}
          data-active={p.showComments ? 'true' : 'false'}
          className="win-btn h-[68px] w-[64px] shrink-0 flex-col justify-start gap-[3px] px-1 pt-1"
        >
          <Icon name="MessagesSquare" size={24} className="text-[hsl(215_60%_38%)]" />
          <span className="flex flex-col items-center text-[10px] leading-[1.15]">
            <span>Показать</span>
            <span>примечания</span>
          </span>
        </button>
      </RibbonGroup>

      <RibbonGroup title="Запись исправлений">
        <button
          type="button"
          title="Записывать исправления"
          onMouseDown={(e) => e.preventDefault()}
          onClick={p.onToggleTrack}
          data-active={p.trackChanges ? 'true' : 'false'}
          className="win-btn h-[68px] w-[70px] shrink-0 flex-col justify-start gap-[3px] px-1 pt-1"
        >
          <Icon name="FileSignature" size={24} className="text-[hsl(215_60%_38%)]" />
          <span className="flex flex-col items-center text-[10px] leading-[1.15]">
            <span>Записывать</span>
            <span>исправления</span>
            <Icon name="ChevronDown" size={9} />
          </span>
        </button>

        <div className="flex shrink-0 flex-col justify-center gap-[2px]" style={{ width: 168 }}>
          <div className="relative flex h-[20px] items-center gap-1.5">
            <Icon name="Highlighter" size={14} className="shrink-0 text-[hsl(215_60%_38%)]" />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setViewOpen((v) => !v)}
              className="flex h-[20px] flex-1 items-center justify-between rounded-[2px] border border-[hsl(var(--win-ribbon-border))] bg-white px-1 text-[11px]"
            >
              <span className="truncate">{p.markupView}</span>
              <Icon name="ChevronDown" size={9} />
            </button>
            {viewOpen && (
              <div className="absolute left-[18px] top-full z-30 w-[180px] border border-[hsl(var(--win-ribbon-border))] bg-white py-1 shadow-md">
                {MARKUP_VIEWS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      p.onMarkupView(v);
                      setViewOpen(false);
                    }}
                    className="block w-full px-3 py-[4px] text-left text-[12px] hover:bg-[hsl(var(--win-hover))]"
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>
          <SmallCmd
            icon="ScrollText"
            label="Показать исправления"
            caret
            onClick={p.onShowMarkup}
          />
          <SmallCmd
            icon="PanelLeft"
            label="Область проверки"
            caret
            onClick={p.onReviewPane}
          />
        </div>
      </RibbonGroup>

      <RibbonGroup title="Изменения">
        <BigCmd
          icon="Check"
          lines={['Принять']}
          caret
          width={52}
          onClick={p.onAcceptChange}
          disabled={!p.hasChanges}
        />
        <BigCmd
          icon="X"
          lines={['Отклонить']}
          caret
          width={60}
          onClick={p.onRejectChange}
          disabled={!p.hasChanges}
        />
        <Stack width={110}>
          <SmallCmd
            icon="CornerUpLeft"
            label="Предыдущее"
            onClick={p.onPrevComment}
            disabled={!p.hasChanges}
          />
          <SmallCmd
            icon="CornerUpRight"
            label="Следующее"
            onClick={p.onNextComment}
            disabled={!p.hasChanges}
          />
        </Stack>
      </RibbonGroup>

      <RibbonGroup title="Сравнение">
        <BigCmd
          icon="GitCompare"
          lines={['Сравнить']}
          caret
          width={58}
          onClick={p.onCompare}
        />
      </RibbonGroup>

      <RibbonGroup title="Защитить">
        <BigCmd
          icon="UserRoundX"
          lines={['Блокировать', 'авторов']}
          caret
          width={70}
          disabled
        />
        <BigCmd
          icon="FileLock2"
          lines={['Ограничить', 'редактирование']}
          width={80}
          onClick={p.onRestrict}
        />
      </RibbonGroup>

      <RibbonGroup title="Рукописный ввод">
        <BigCmd
          icon="PenLine"
          lines={['Скрыть рукописные', 'фрагменты']}
          caret
          width={104}
          disabled
        />
      </RibbonGroup>
    </>
  );
};

export default RibbonReview;
