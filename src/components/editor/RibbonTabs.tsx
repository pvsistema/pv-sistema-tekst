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