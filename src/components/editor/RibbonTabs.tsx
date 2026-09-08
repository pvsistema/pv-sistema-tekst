import { RibbonGroup, BigBtn } from './RibbonControls';

export interface TabActions {
  onCommand: (command: string, value?: string) => void;
  onInsertTable: () => void;
  onInsertImage: () => void;
  onPrint: () => void;
  onNew: () => void;
  onZoom: (v: number) => void;
  zoom: number;
  /** Открыть окно колонтитулов */
  onHeaderFooter?: (part: 'header' | 'footer') => void;
  /** Вставить разрыв страницы, колонки или раздела */
  onBreak?: (kind: import('@/lib/breaks').BreakKind) => void;
  /** Графика: галерея фигур, надпись, фигурный текст */
  onShapes?: () => void;
  onTextBox?: () => void;
  onWordArt?: () => void;
  onWrap?: (wrap: import('@/lib/shapes').WrapMode) => void;
  onOrder?: (dir: 'front' | 'back') => void;
  /** Вставка символов, даты и готовых блоков */
  onSymbol?: () => void;
  onDateTime?: () => void;
  onQuickParts?: () => void;
  /** Вставка новой формулы */
  onEquationNew?: (display: boolean) => void;
}

export const RibbonHelp = (p: TabActions) => (
  <>
    <RibbonGroup title="Справка">
      <BigBtn icon="CircleHelp" label="Справка" onClick={() => p.onCommand('justifyLeft')} />
      <BigBtn icon="Lightbulb" label="Обучение" onClick={() => p.onCommand('justifyLeft')} />
    </RibbonGroup>
  </>
);