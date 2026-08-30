import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { RibbonGroup, BigCmd, SmallCmd, Stack } from './RibbonControls';
import type { TabActions } from './RibbonTabs';

export interface LinksProps extends TabActions {
  onToc: (style: 'auto' | 'manual') => void;
  onTocUpdate: () => void;
  onTocAddText: (level: number) => void;
  onFootnote: () => void;
  onEndnote: () => void;
  onNextNote: () => void;
  onShowNotes: () => void;
  onCitation: () => void;
  onSources: () => void;
  onBibliography: () => void;
  onCaption: () => void;
  onFigureList: () => void;
  onCrossRef: () => void;
  onIndexMark: () => void;
  onIndexBuild: () => void;
  onAuthorityMark: () => void;
  onAuthorityBuild: () => void;
  citeStyle: string;
  onCiteStyle: (v: string) => void;
  hasNotes: boolean;
  hasToc: boolean;
  hasIndex: boolean;
  hasFigures: boolean;
}

const CITE_STYLES = [
  'APA',
  'Chicago',
  'GOST — сортировка по именам',
  'ISO 690 — первый элемент и дата',
  'MLA',
  'Turabian',
];

/** Кнопка «Вставить сноску» — крупная буквенная пиктограмма как в Word */
const NoteBig = ({
  glyph,
  sup,
  lines,
  onClick,
  width = 52,
}: {
  glyph: string;
  sup: string;
  lines: string[];
  onClick: () => void;
  width?: number;
}) => (
  <button
    type="button"
    title={lines.join(' ')}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className="win-btn h-[68px] shrink-0 flex-col justify-start gap-[3px] px-1 pt-1"
    style={{ width }}
  >
    <span className="flex h-[26px] items-start leading-none">
      <span className="text-[19px] font-semibold text-[hsl(0_0%_25%)]">
        {glyph}
      </span>
      <span className="mt-[1px] text-[10px] text-[hsl(215_60%_38%)]">{sup}</span>
    </span>
    <span className="flex flex-col items-center text-[10px] leading-[1.15]">
      {lines.map((l) => (
        <span key={l}>{l}</span>
      ))}
    </span>
  </button>
);

const RibbonLinks = (p: LinksProps) => {
  const [styleOpen, setStyleOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [addTextOpen, setAddTextOpen] = useState(false);

  return (
    <>
      <RibbonGroup title="Оглавление">
        <div className="relative">
          <BigCmd
            icon="ListTree"
            lines={['Оглавление']}
            caret
            width={62}
            onClick={() => setTocOpen((v) => !v)}
          />
          {tocOpen && (
            <div className="absolute left-0 top-full z-30 w-[220px] border border-[hsl(var(--win-ribbon-border))] bg-white py-1 shadow-md">
              {[
                { k: 'auto' as const, l: 'Автособираемое оглавление' },
                { k: 'manual' as const, l: 'Ручное оглавление' },
              ].map((o) => (
                <button
                  key={o.k}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    p.onToc(o.k);
                    setTocOpen(false);
                  }}
                  className="block w-full px-3 py-[5px] text-left text-[12px] hover:bg-[hsl(var(--win-hover))]"
                >
                  {o.l}
                </button>
              ))}
            </div>
          )}
        </div>

        <Stack width={132}>
          <div className="relative">
            <SmallCmd
              icon="TextCursorInput"
              label="Добавить текст"
              caret
              onClick={() => setAddTextOpen((v) => !v)}
            />
            {addTextOpen && (
              <div className="absolute left-0 top-full z-30 w-[150px] border border-[hsl(var(--win-ribbon-border))] bg-white py-1 shadow-md">
                {[1, 2, 3].map((lv) => (
                  <button
                    key={lv}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      p.onTocAddText(lv);
                      setAddTextOpen(false);
                    }}
                    className="block w-full px-3 py-[5px] text-left text-[12px] hover:bg-[hsl(var(--win-hover))]"
                  >
                    Уровень {lv}
                  </button>
                ))}
              </div>
            )}
          </div>
          <SmallCmd
            icon="RefreshCw"
            label="Обновить таблицу"
            onClick={p.onTocUpdate}
            disabled={!p.hasToc}
          />
        </Stack>
      </RibbonGroup>

      <RibbonGroup title="Сноски">
        <NoteBig
          glyph="AB"
          sup="1"
          lines={['Вставить', 'сноску']}
          onClick={p.onFootnote}
        />
        <Stack width={180}>
          <SmallCmd
            icon="BookMarked"
            label="Вставить концевую сноску"
            onClick={p.onEndnote}
          />
          <SmallCmd
            icon="ArrowDownToLine"
            label="Следующая сноска"
            caret
            onClick={p.onNextNote}
            disabled={!p.hasNotes}
          />
          <SmallCmd
            icon="Eye"
            label="Показать сноски"
            onClick={p.onShowNotes}
            disabled={!p.hasNotes}
          />
        </Stack>
      </RibbonGroup>

      <RibbonGroup title="Исследование">
        <BigCmd
          icon="Info"
          lines={['Интеллектуальный', 'поиск']}
          width={96}
          onClick={() => {
            const q = window.getSelection()?.toString().trim();
            window.open(
              `https://ya.ru/search/?text=${encodeURIComponent(q || 'справка')}`,
              '_blank',
            );
          }}
        />
      </RibbonGroup>

      <RibbonGroup title="Ссылки и списки литературы">
        <BigCmd
          icon="BookPlus"
          lines={['Вставить', 'ссылку']}
          caret
          width={62}
          onClick={p.onCitation}
        />
        <div className="flex shrink-0 flex-col justify-center gap-[2px]" style={{ width: 190 }}>
          <SmallCmd
            icon="Library"
            label="Управление источниками"
            onClick={p.onSources}
          />

          <div className="flex h-[20px] items-center gap-1.5">
            <Icon
              name="ListChecks"
              size={14}
              className="shrink-0 text-[hsl(215_60%_38%)]"
            />
            <span className="text-[11px] leading-none">Стиль:</span>
            <div className="relative flex-1">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setStyleOpen((v) => !v)}
                className="flex h-[20px] w-full items-center justify-between rounded-[2px] border border-[hsl(var(--win-ribbon-border))] bg-white px-1 text-[11px]"
              >
                <span className="truncate">{p.citeStyle}</span>
                <Icon name="ChevronDown" size={9} />
              </button>
              {styleOpen && (
                <div className="absolute left-0 top-full z-30 w-[230px] border border-[hsl(var(--win-ribbon-border))] bg-white py-1 shadow-md">
                  {CITE_STYLES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        p.onCiteStyle(s);
                        setStyleOpen(false);
                      }}
                      className="block w-full px-3 py-[4px] text-left text-[12px] hover:bg-[hsl(var(--win-hover))]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <SmallCmd
            icon="BookText"
            label="Список литературы"
            caret
            onClick={p.onBibliography}
          />
        </div>
      </RibbonGroup>

      <RibbonGroup title="Названия">
        <BigCmd
          icon="Tag"
          lines={['Вставить', 'название']}
          width={62}
          onClick={p.onCaption}
        />
        <Stack width={158}>
          <SmallCmd
            icon="Images"
            label="Список иллюстраций"
            onClick={p.onFigureList}
          />
          <SmallCmd
            icon="RefreshCw"
            label="Обновить таблицу"
            onClick={p.onFigureList}
            disabled={!p.hasFigures}
          />
          <SmallCmd
            icon="Link2"
            label="Перекрестная ссылка"
            onClick={p.onCrossRef}
          />
        </Stack>
      </RibbonGroup>

      <RibbonGroup title="Предметный указатель">
        <BigCmd
          icon="BookmarkPlus"
          lines={['Пометить', 'элемент']}
          width={62}
          onClick={p.onIndexMark}
        />
        <Stack width={150}>
          <SmallCmd
            icon="ListOrdered"
            label="Предметный указатель"
            onClick={p.onIndexBuild}
          />
          <SmallCmd
            icon="RefreshCw"
            label="Обновить указатель"
            onClick={p.onIndexBuild}
            disabled={!p.hasIndex}
          />
        </Stack>
      </RibbonGroup>

      <RibbonGroup title="Таблица ссылок">
        <BigCmd
          icon="Bookmark"
          lines={['Пометить', 'ссылку']}
          width={62}
          onClick={p.onAuthorityMark}
        />
        <Stack width={140}>
          <SmallCmd
            icon="Table"
            label="Таблица ссылок"
            onClick={p.onAuthorityBuild}
          />
          <SmallCmd
            icon="RefreshCw"
            label="Обновить таблицу"
            onClick={p.onAuthorityBuild}
            disabled
          />
        </Stack>
      </RibbonGroup>
    </>
  );
};

export default RibbonLinks;
