import { useEffect, useState } from 'react';

export interface AppOptions {
  /* Общие */
  miniToolbar: boolean;
  livePreview: boolean;
  updateOnDrag: boolean;
  collapseRibbon: boolean;
  tipStyle: string;
  userName: string;
  initials: string;
  alwaysUseValues: boolean;
  officeTheme: 'colored' | 'dark-grey' | 'black' | 'white';
  showStartScreen: boolean;
  shareChanges: string;
  showPresenceNames: boolean;
  /* Отображение */
  showFormatMarks: boolean;
  showBookmarks: boolean;
  printBackground: boolean;
  printDrawings: boolean;
  /* Правописание */
  checkSpelling: boolean;
  hideSpellErrors: boolean;
  autoCapitalize: boolean;
  autoQuotes: boolean;
  /* Сохранение */
  autoSave: boolean;
  autoSaveMinutes: number;
  saveFormat: string;
  /* Язык */
  editLanguage: string;
  /* Дополнительно */
  typingReplaces: boolean;
  dragDropText: boolean;
  ctrlClickLink: boolean;
  recentCount: number;
  showStatusBar: boolean;
}

export const DEFAULT_OPTIONS: AppOptions = {
  miniToolbar: true,
  livePreview: true,
  updateOnDrag: true,
  collapseRibbon: false,
  tipStyle: 'Показывать расширенные всплывающие подсказки',
  userName: 'Пользователь',
  initials: 'П',
  alwaysUseValues: false,
  officeTheme: 'colored',
  showStartScreen: true,
  shareChanges: 'Спрашивать',
  showPresenceNames: false,
  showFormatMarks: false,
  showBookmarks: false,
  printBackground: true,
  printDrawings: true,
  checkSpelling: true,
  hideSpellErrors: false,
  autoCapitalize: true,
  autoQuotes: true,
  autoSave: true,
  autoSaveMinutes: 10,
  saveFormat: 'Документ Word (.doc)',
  editLanguage: 'Русский (Россия)',
  typingReplaces: true,
  dragDropText: true,
  ctrlClickLink: true,
  recentCount: 10,
  showStatusBar: true,
};

const KEY = 'pv-tekst-options';

const load = (): AppOptions => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_OPTIONS, ...JSON.parse(raw) };
  } catch {
    /* хранилище недоступно */
  }
  return DEFAULT_OPTIONS;
};

export const useAppOptions = () => {
  const [options, setOptions] = useState<AppOptions>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(options));
    } catch {
      /* пропускаем */
    }
  }, [options]);

  /* тема Office меняет цвет заголовка и ленты */
  useEffect(() => {
    const root = document.documentElement;
    const themes: Record<AppOptions['officeTheme'], [string, string]> = {
      colored: ['215 78% 33%', '0 0% 100%'],
      'dark-grey': ['0 0% 27%', '0 0% 100%'],
      black: ['0 0% 12%', '0 0% 100%'],
      white: ['0 0% 96%', '0 0% 15%'],
    };
    const [bg, fg] = themes[options.officeTheme];
    root.style.setProperty('--win-title', bg);
    root.style.setProperty('--win-title-text', fg);
  }, [options.officeTheme]);

  const set = <K extends keyof AppOptions>(key: K, value: AppOptions[K]) =>
    setOptions((o) => ({ ...o, [key]: value }));

  const reset = () => setOptions(DEFAULT_OPTIONS);

  return { options, setOptions, set, reset };
};
