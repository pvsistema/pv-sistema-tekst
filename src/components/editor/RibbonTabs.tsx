import { RibbonGroup, BigBtn } from './RibbonControls';

export interface TabActions {
  onCommand: (command: string, value?: string) => void;
  onInsertTable: () => void;
  onInsertImage: () => void;
  onPrint: () => void;
  onNew: () => void;
  onZoom: (v: number) => void;
  zoom: number;
}

export const RibbonHelp = (p: TabActions) => (
  <>
    <RibbonGroup title="Справка">
      <BigBtn icon="CircleHelp" label="Справка" onClick={() => p.onCommand('justifyLeft')} />
      <BigBtn icon="Lightbulb" label="Обучение" onClick={() => p.onCommand('justifyLeft')} />
    </RibbonGroup>
  </>
);