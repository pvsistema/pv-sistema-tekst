import { RibbonGroup, SmallBtn, BigBtn, VStack } from './RibbonControls';

export interface TabActions {
  onCommand: (command: string, value?: string) => void;
  onInsertTable: () => void;
  onInsertImage: () => void;
  onPrint: () => void;
  onNew: () => void;
  onZoom: (v: number) => void;
  zoom: number;
}

export const RibbonDesign = (p: TabActions) => (
  <>
    <RibbonGroup title="Форматирование документа">
      <BigBtn icon="Palette" label="Темы" onClick={() => p.onCommand('removeFormat')} />
      <BigBtn icon="SwatchBook" label="Цвета" onClick={() => p.onCommand('foreColor', '#1f3864')} />
      <BigBtn icon="Type" label="Шрифты" onClick={() => p.onCommand('fontName', 'Georgia')} />
    </RibbonGroup>
    <RibbonGroup title="Фон страницы">
      <BigBtn icon="Droplets" label="Подложка" onClick={() => p.onCommand('hiliteColor', '#f2f2f2')} />
      <BigBtn icon="Square" label="Границы страниц" onClick={() => p.onCommand('justifyLeft')} />
    </RibbonGroup>
  </>
);

export const RibbonLayout = (p: TabActions) => (
  <>
    <RibbonGroup title="Параметры страницы">
      <BigBtn icon="Scan" label="Поля" onClick={() => p.onCommand('justifyLeft')} />
      <BigBtn icon="RectangleVertical" label="Ориентация" onClick={() => p.onCommand('justifyLeft')} />
      <BigBtn icon="FileText" label="Размер A4" onClick={() => p.onCommand('justifyLeft')} />
      <BigBtn icon="Columns3" label="Колонки" onClick={() => p.onCommand('justifyFull')} />
    </RibbonGroup>
    <RibbonGroup title="Абзац">
      <VStack>
        <SmallBtn icon="IndentIncrease" title="Отступ слева" label="Отступ слева" onClick={() => p.onCommand('indent')} />
        <SmallBtn icon="IndentDecrease" title="Отступ справа" label="Отступ справа" onClick={() => p.onCommand('outdent')} />
      </VStack>
    </RibbonGroup>
  </>
);

export const RibbonLinks = (p: TabActions) => (
  <>
    <RibbonGroup title="Оглавление">
      <BigBtn icon="ListTree" label="Оглавление" onClick={() => p.onCommand('insertOrderedList')} />
    </RibbonGroup>
    <RibbonGroup title="Сноски">
      <VStack>
        <SmallBtn icon="Superscript" title="Вставить сноску" label="Вставить сноску" onClick={() => p.onCommand('superscript')} />
        <SmallBtn icon="BookMarked" title="Концевая сноска" label="Концевая сноска" onClick={() => p.onCommand('subscript')} />
      </VStack>
    </RibbonGroup>
    <RibbonGroup title="Названия">
      <BigBtn icon="Tag" label="Вставить название" onClick={() => p.onCommand('italic')} />
    </RibbonGroup>
  </>
);

export const RibbonMailings = (p: TabActions) => (
  <>
    <RibbonGroup title="Создание">
      <BigBtn icon="Mail" label="Конверты" onClick={p.onPrint} />
      <BigBtn icon="StickyNote" label="Наклейки" onClick={p.onPrint} />
    </RibbonGroup>
    <RibbonGroup title="Начало слияния">
      <BigBtn icon="Users" label="Выбрать получателей" onClick={() => p.onCommand('justifyLeft')} />
    </RibbonGroup>
  </>
);

export const RibbonReview = (p: TabActions) => (
  <>
    <RibbonGroup title="Правописание">
      <BigBtn icon="SpellCheck" label="Орфография" onClick={() => p.onCommand('justifyLeft')} />
      <BigBtn icon="BookOpen" label="Тезаурус" onClick={() => p.onCommand('justifyLeft')} />
    </RibbonGroup>
    <RibbonGroup title="Примечания">
      <BigBtn icon="MessageSquarePlus" label="Создать примечание" onClick={() => p.onCommand('hiliteColor', '#fff2cc')} />
    </RibbonGroup>
    <RibbonGroup title="Язык">
      <VStack>
        <SmallBtn icon="Languages" title="Язык" label="Язык: русский" onClick={() => p.onCommand('justifyLeft')} />
      </VStack>
    </RibbonGroup>
  </>
);

export const RibbonView = (p: TabActions) => (
  <>
    <RibbonGroup title="Режимы просмотра">
      <BigBtn icon="FileText" label="Разметка страницы" onClick={() => p.onZoom(100)} />
      <BigBtn icon="Monitor" label="Веб-документ" onClick={() => p.onZoom(120)} />
    </RibbonGroup>
    <RibbonGroup title="Масштаб">
      <BigBtn icon="ZoomIn" label="Увеличить" onClick={() => p.onZoom(Math.min(200, p.zoom + 10))} />
      <BigBtn icon="ZoomOut" label="Уменьшить" onClick={() => p.onZoom(Math.max(50, p.zoom - 10))} />
      <BigBtn icon="Maximize" label="100%" onClick={() => p.onZoom(100)} />
    </RibbonGroup>
  </>
);

export const RibbonHelp = (p: TabActions) => (
  <>
    <RibbonGroup title="Справка">
      <BigBtn icon="CircleHelp" label="Справка" onClick={() => p.onCommand('justifyLeft')} />
      <BigBtn icon="Lightbulb" label="Обучение" onClick={() => p.onCommand('justifyLeft')} />
    </RibbonGroup>
  </>
);