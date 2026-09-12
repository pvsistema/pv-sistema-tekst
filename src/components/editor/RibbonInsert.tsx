import Icon from '@/components/ui/icon';
import { RibbonGroup } from './RibbonControls';
import type { TabActions } from './RibbonTabs';

/** Большая кнопка ленты с подписью в две строки и стрелкой раскрытия */
const BigCmd = ({
  icon,
  lines,
  caret,
  onClick,
  width = 56,
  glyph,
}: {
  icon?: string;
  lines: string[];
  caret?: boolean;
  onClick?: () => void;
  width?: number;
  glyph?: string;
}) => (
  <button
    type="button"
    title={lines.join(' ')}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className="win-btn h-[68px] flex-col justify-start gap-[3px] px-1 pt-1"
    style={{ width }}
  >
    {glyph ? (
      <span className="flex h-[26px] items-center text-[22px] leading-none">
        {glyph}
      </span>
    ) : (
      <Icon name={icon ?? 'Square'} size={24} className="text-[hsl(215_60%_38%)]" />
    )}
    <span className="flex flex-col items-center text-[10px] leading-[1.15]">
      {lines.map((l, i) => (
        <span key={i}>{l}</span>
      ))}
      {caret && <Icon name="ChevronDown" size={9} className="mt-[1px]" />}
    </span>
  </button>
);

/** Маленькая кнопка со значком и подписью в строку */
const SmallCmd = ({
  icon,
  label,
  caret,
  onClick,
  glyph,
}: {
  icon?: string;
  label: string;
  caret?: boolean;
  onClick?: () => void;
  glyph?: string;
}) => (
  <button
    type="button"
    title={label}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className="win-btn h-[20px] w-full shrink-0 justify-start gap-1.5 whitespace-nowrap px-1"
  >
    {glyph ? (
      <span className="w-[15px] shrink-0 text-center text-[12px] leading-none">
        {glyph}
      </span>
    ) : (
      <Icon
        name={icon ?? 'Square'}
        size={14}
        className="shrink-0 text-[hsl(215_60%_38%)]"
      />
    )}
    <span className="text-[11px] leading-none">{label}</span>
    {caret && <Icon name="ChevronDown" size={9} className="ml-auto shrink-0" />}
  </button>
);

const Stack = ({
  children,
  width = 132,
}: {
  children: React.ReactNode;
  width?: number;
}) => (
  <div
    className="flex shrink-0 flex-col justify-center gap-[2px]"
    style={{ width }}
  >
    {children}
  </div>
);

const RibbonInsert = (p: TabActions) => {
  const html = (markup: string) => p.onCommand('insertHTML', markup);

  const insertCoverPage = () =>
    html(
      '<div style="text-align:center;padding:120px 0"><h1 style="font-size:32px">Название документа</h1><p style="font-size:15px;color:#555">Подзаголовок</p><p style="margin-top:80px">Автор · ' +
        new Date().toLocaleDateString('ru-RU') +
        '</p></div><hr>',
    );

  const insertLink = () => p.onLink?.();

  const insertChart = () => p.onChart?.();

  const insertTextBox = () => p.onTextBox?.();

  const insertWordArt = () => p.onWordArt?.();

  const insertDropCap = () => p.onDropCap?.();

  const insertHeader = () => p.onHeaderFooter?.('header');
  const insertFooter = () => p.onHeaderFooter?.('footer');
  const insertPageNumber = () => p.onHeaderFooter?.('footer');

  const insertComment = () =>
    html('<span style="background:#fff2cc;border-bottom:1px dashed #bf9000">примечание</span>');

  const insertDate = () => p.onDateTime?.();

  const insertSignature = () => p.onQuickParts?.();

  const insertSymbol = () => p.onSymbol?.();

  const insertEquation = () => p.onEquationNew?.(true);

  return (
    <>
      <RibbonGroup title="Страницы">
        <BigCmd
          icon="FileType2"
          lines={['Титульная', 'страница']}
          caret
          onClick={insertCoverPage}
          width={60}
        />
        <BigCmd
          icon="File"
          lines={['Пустая', 'страница']}
          onClick={() => html('<hr><p><br></p>')}
          width={54}
        />
        <BigCmd
          icon="SeparatorHorizontal"
          lines={['Разрыв', 'страницы']}
          onClick={() => p.onBreak?.('page')}
          width={58}
        />
      </RibbonGroup>

      <RibbonGroup title="Таблицы">
        <BigCmd icon="Table" lines={['Таблица']} caret onClick={p.onInsertTable} />
      </RibbonGroup>

      <RibbonGroup title="Иллюстрации">
        <BigCmd icon="Image" lines={['Рисунки']} onClick={p.onInsertImage} />
        <BigCmd
          icon="Shapes"
          lines={['Фигуры']}
          caret
          onClick={() => p.onShapes?.()}
        />
        <BigCmd icon="Sparkles" lines={['Значки']} onClick={() => p.onCommand('insertText', '★')} />
        <BigCmd
          icon="Box"
          lines={['Трехмерные', 'модели']}
          caret
          onClick={() => p.onCommand('insertText', '◈')}
          width={64}
        />
        <BigCmd icon="Network" lines={['SmartArt']} onClick={insertChart} />
        <BigCmd icon="ChartColumn" lines={['Диаграмма']} onClick={insertChart} width={62} />
        <BigCmd icon="Camera" lines={['Снимок']} caret onClick={p.onInsertImage} />
      </RibbonGroup>

      <RibbonGroup title="Надстройки">
        <Stack width={146}>
          <SmallCmd icon="Store" label="Получить надстройки" />
          <SmallCmd icon="LayoutGrid" label="Мои надстройки" caret />
        </Stack>
        <BigCmd glyph="W" lines={['Википедия']} width={62} />
      </RibbonGroup>

      <RibbonGroup title="Мультимедиа">
        <BigCmd icon="Video" lines={['Видео из', 'Интернета']} width={62} onClick={insertLink} />
      </RibbonGroup>

      <RibbonGroup title="Ссылки">
        <BigCmd icon="Link" lines={['Ссылка']} onClick={insertLink} />
        <BigCmd
          icon="Bookmark"
          lines={['Закладка']}
          onClick={() => html('<a id="bookmark"></a>')}
          width={60}
        />
        <BigCmd
          icon="ArrowLeftRight"
          lines={['Перекрестная', 'ссылка']}
          onClick={insertLink}
          width={72}
        />
      </RibbonGroup>

      <RibbonGroup title="Примечания">
        <BigCmd icon="MessageSquarePlus" lines={['Примечание']} width={68} onClick={insertComment} />
      </RibbonGroup>

      <RibbonGroup title="Колонтитулы">
        <BigCmd icon="PanelTop" lines={['Верхний', 'колонтитул']} caret width={66} onClick={insertHeader} />
        <BigCmd icon="PanelBottom" lines={['Нижний', 'колонтитул']} caret width={66} onClick={insertFooter} />
        <BigCmd icon="Hash" lines={['Номер', 'страницы']} caret width={58} onClick={insertPageNumber} />
      </RibbonGroup>

      <RibbonGroup title="Текст">
        <BigCmd icon="TextCursorInput" lines={['Текстовое', 'поле']} caret width={60} onClick={insertTextBox} />
        <BigCmd
          icon="Newspaper"
          lines={['Экспресс-', 'блоки']}
          caret
          width={60}
          onClick={() => p.onQuickParts?.()}
        />
        <BigCmd glyph="𝓐" lines={['WordArt']} caret width={54} onClick={insertWordArt} />
        <BigCmd icon="ALargeSmall" lines={['Буквица']} caret width={54} onClick={insertDropCap} />
        <Stack>
          <SmallCmd icon="PenLine" label="Строки подписи" caret onClick={insertSignature} />
          <SmallCmd icon="CalendarDays" label="Дата и время" onClick={insertDate} />
          <SmallCmd
            icon="Package"
            label="Объект"
            caret
            onClick={() => p.onQuickParts?.()}
          />
        </Stack>
      </RibbonGroup>

      <RibbonGroup title="Символы">
        <BigCmd glyph="π" lines={['Уравнение']} caret width={62} onClick={insertEquation} />
        <BigCmd glyph="Ω" lines={['Символ']} caret onClick={insertSymbol} />
      </RibbonGroup>
    </>
  );
};

export default RibbonInsert;