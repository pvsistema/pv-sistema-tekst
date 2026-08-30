import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import type { AppOptions } from '@/hooks/use-app-options';

interface Props {
  open: boolean;
  onClose: () => void;
  options: AppOptions;
  onApply: (o: AppOptions) => void;
  onReset: () => void;
}

const SECTIONS = [
  'Общие',
  'Отображение',
  'Правописание',
  'Сохранение',
  'Язык',
  'Специальные возможности',
  'Дополнительно',
  '—',
  'Настроить ленту',
  'Панель быстрого доступа',
  'Надстройки',
  'Центр управления безопасностью',
] as const;

/* ── элементы формы в стиле Windows ── */

const GroupBar = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-2 mt-4 border border-[hsl(0_0%_85%)] bg-[hsl(0_0%_96%)] px-2 py-[3px] text-[12px] font-semibold text-[hsl(0_0%_25%)] first:mt-0">
    {children}
  </div>
);

const CheckRow = ({
  label,
  checked,
  onChange,
  info,
  indent = 0,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  info?: boolean;
  indent?: number;
}) => (
  <label
    className="flex cursor-pointer items-center gap-2 py-[3px] text-[12px] text-[hsl(0_0%_15%)]"
    style={{ paddingLeft: 12 + indent }}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-[13px] w-[13px] accent-[hsl(var(--win-title))]"
    />
    <span>{label}</span>
    {info && <Icon name="Info" size={12} className="text-[hsl(210_60%_50%)]" />}
  </label>
);

const RadioRow = ({
  label,
  checked,
  onChange,
  indent = 0,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  indent?: number;
}) => (
  <label
    className="flex cursor-pointer items-center gap-2 py-[3px] text-[12px] text-[hsl(0_0%_15%)]"
    style={{ paddingLeft: 12 + indent }}
  >
    <input
      type="radio"
      checked={checked}
      onChange={onChange}
      className="h-[13px] w-[13px] accent-[hsl(var(--win-title))]"
    />
    <span>{label}</span>
  </label>
);

const FieldRow = ({
  label,
  children,
  width = 160,
}: {
  label: string;
  children: React.ReactNode;
  width?: number;
}) => (
  <div className="flex items-center gap-2 py-[3px] pl-3 text-[12px]">
    <span style={{ minWidth: width }}>{label}</span>
    {children}
  </div>
);

const TextBox = ({
  value,
  onChange,
  width = 210,
}: {
  value: string;
  onChange: (v: string) => void;
  width?: number;
}) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{ width }}
    className="h-[22px] border border-[hsl(0_0%_70%)] px-1 text-[12px] outline-none focus:border-[hsl(var(--win-title))]"
  />
);

const Select = ({
  value,
  onChange,
  items,
  width = 200,
}: {
  value: string;
  onChange: (v: string) => void;
  items: string[];
  width?: number;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{ width }}
    className="h-[22px] border border-[hsl(0_0%_70%)] bg-white px-1 text-[12px] outline-none focus:border-[hsl(var(--win-title))]"
  >
    {items.map((i) => (
      <option key={i}>{i}</option>
    ))}
  </select>
);

const WinButton = ({
  children,
  onClick,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`h-[24px] min-w-[86px] border px-3 text-[12px] transition-colors ${
      primary
        ? 'border-[hsl(var(--win-title))] bg-[hsl(var(--win-title))] text-white hover:brightness-110'
        : 'border-[hsl(0_0%_70%)] bg-[hsl(0_0%_96%)] hover:bg-[hsl(0_0%_92%)]'
    }`}
  >
    {children}
  </button>
);

const THEME_LABEL: Record<AppOptions['officeTheme'], string> = {
  colored: 'Разные цвета',
  'dark-grey': 'Темно-серый',
  black: 'Черный',
  white: 'Белый',
};

const OptionsDialog = (p: Props) => {
  const [section, setSection] = useState<string>('Общие');
  const [draft, setDraft] = useState<AppOptions>(p.options);

  useEffect(() => {
    if (p.open) setDraft(p.options);
  }, [p.open, p.options]);

  if (!p.open) return null;

  const set = <K extends keyof AppOptions>(k: K, v: AppOptions[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/25">
      <div className="flex h-[92%] max-h-[720px] w-[92%] max-w-[1080px] flex-col border border-[hsl(0_0%_60%)] bg-white shadow-2xl">
        {/* заголовок окна */}
        <div className="flex h-[38px] shrink-0 items-center border-b border-[hsl(0_0%_88%)] px-4">
          <span className="text-[15px] text-[hsl(0_0%_15%)]">
            Параметры ПВ-Система Текст
          </span>
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              title="Справка"
              className="text-[hsl(0_0%_35%)] hover:text-[hsl(0_0%_10%)]"
            >
              <Icon name="CircleHelp" size={16} />
            </button>
            <button
              type="button"
              onClick={p.onClose}
              title="Закрыть"
              className="text-[hsl(0_0%_35%)] hover:text-[hsl(0_0%_10%)]"
            >
              <Icon name="X" size={18} />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 gap-3 p-3">
          {/* список разделов */}
          <div className="w-[210px] shrink-0 overflow-auto border border-[hsl(0_0%_85%)] py-1">
            {SECTIONS.map((s, i) =>
              s === '—' ? (
                <div key={i} className="my-1 mx-2 h-px bg-[hsl(0_0%_88%)]" />
              ) : (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSection(s)}
                  className={`block w-full px-3 py-[5px] text-left text-[12px] ${
                    section === s
                      ? 'bg-[hsl(0_0%_88%)] font-semibold text-[hsl(0_0%_10%)]'
                      : 'hover:bg-[hsl(var(--win-hover))]'
                  }`}
                >
                  {s}
                </button>
              ),
            )}
          </div>

          {/* содержимое раздела */}
          <div className="min-h-0 flex-1 overflow-auto border border-[hsl(0_0%_85%)] px-4 py-3">
            {section === 'Общие' && (
              <>
                <div className="mb-3 flex items-center gap-2">
                  <Icon name="Settings2" size={22} className="text-[hsl(var(--win-title))]" />
                  <span className="text-[14px] text-[hsl(0_0%_20%)]">
                    Основные параметры для работы с редактором
                  </span>
                </div>

                <GroupBar>Параметры пользовательского интерфейса</GroupBar>
                <div className="pl-3 text-[12px] text-[hsl(0_0%_15%)]">
                  При использовании нескольких дисплеев:
                </div>
                <RadioRow
                  label="Обеспечить наилучший вид"
                  checked={!draft.alwaysUseValues}
                  onChange={() => set('alwaysUseValues', false)}
                  indent={12}
                />
                <RadioRow
                  label="Обеспечить наилучшую совместимость"
                  checked={draft.alwaysUseValues}
                  onChange={() => set('alwaysUseValues', true)}
                  indent={12}
                />
                <CheckRow
                  label="Показывать мини-панель инструментов при выделении"
                  checked={draft.miniToolbar}
                  onChange={(v) => set('miniToolbar', v)}
                  info
                />
                <CheckRow
                  label="Включить динамический просмотр"
                  checked={draft.livePreview}
                  onChange={(v) => set('livePreview', v)}
                  info
                />
                <CheckRow
                  label="Обновлять содержимое документа во время перетаскивания"
                  checked={draft.updateOnDrag}
                  onChange={(v) => set('updateOnDrag', v)}
                  info
                />
                <CheckRow
                  label="Автоматически сворачивать ленту"
                  checked={draft.collapseRibbon}
                  onChange={(v) => set('collapseRibbon', v)}
                  info
                />
                <FieldRow label="Стиль всплывающих подсказок:" width={170}>
                  <Select
                    value={draft.tipStyle}
                    onChange={(v) => set('tipStyle', v)}
                    items={[
                      'Показывать расширенные всплывающие подсказки',
                      'Не показывать расширенные подсказки',
                      'Не показывать всплывающие подсказки',
                    ]}
                    width={320}
                  />
                </FieldRow>

                <GroupBar>Личная настройка</GroupBar>
                <FieldRow label="Имя пользователя:">
                  <TextBox
                    value={draft.userName}
                    onChange={(v) => set('userName', v)}
                  />
                </FieldRow>
                <FieldRow label="Инициалы:">
                  <TextBox
                    value={draft.initials}
                    onChange={(v) => set('initials', v)}
                    width={60}
                  />
                </FieldRow>
                <CheckRow
                  label="Всегда использовать эти значения независимо от состояния входа"
                  checked={draft.alwaysUseValues}
                  onChange={(v) => set('alwaysUseValues', v)}
                />
                <FieldRow label="Тема оформления:">
                  <Select
                    value={THEME_LABEL[draft.officeTheme]}
                    onChange={(v) =>
                      set(
                        'officeTheme',
                        (Object.keys(THEME_LABEL) as AppOptions['officeTheme'][]).find(
                          (k) => THEME_LABEL[k] === v,
                        ) ?? 'colored',
                      )
                    }
                    items={Object.values(THEME_LABEL)}
                    width={150}
                  />
                </FieldRow>

                <GroupBar>Параметры запуска</GroupBar>
                <CheckRow
                  label="Показывать начальный экран при запуске этого приложения"
                  checked={draft.showStartScreen}
                  onChange={(v) => set('showStartScreen', v)}
                />

                <GroupBar>Параметры совместной работы</GroupBar>
                <FieldRow
                  label="Автоматически передавать внесенные изменения:"
                  width={300}
                >
                  <Select
                    value={draft.shareChanges}
                    onChange={(v) => set('shareChanges', v)}
                    items={['Спрашивать', 'Всегда', 'Никогда']}
                    width={140}
                  />
                </FieldRow>
                <CheckRow
                  label="Отображать имена на флагах присутствия"
                  checked={draft.showPresenceNames}
                  onChange={(v) => set('showPresenceNames', v)}
                />
              </>
            )}

            {section === 'Отображение' && (
              <>
                <GroupBar>Всегда показывать эти знаки форматирования на экране</GroupBar>
                <CheckRow
                  label="Показывать все знаки форматирования"
                  checked={draft.showFormatMarks}
                  onChange={(v) => set('showFormatMarks', v)}
                />
                <CheckRow
                  label="Показывать закладки"
                  checked={draft.showBookmarks}
                  onChange={(v) => set('showBookmarks', v)}
                />

                <GroupBar>Параметры печати</GroupBar>
                <CheckRow
                  label="Печать фоновых цветов и рисунков"
                  checked={draft.printBackground}
                  onChange={(v) => set('printBackground', v)}
                />
                <CheckRow
                  label="Печать рисунков, созданных в редакторе"
                  checked={draft.printDrawings}
                  onChange={(v) => set('printDrawings', v)}
                />
              </>
            )}

            {section === 'Правописание' && (
              <>
                <GroupBar>При исправлении правописания в этом документе</GroupBar>
                <CheckRow
                  label="Автоматически проверять орфографию"
                  checked={draft.checkSpelling}
                  onChange={(v) => set('checkSpelling', v)}
                />
                <CheckRow
                  label="Скрыть орфографические ошибки"
                  checked={draft.hideSpellErrors}
                  onChange={(v) => set('hideSpellErrors', v)}
                />

                <GroupBar>Параметры автозамены</GroupBar>
                <CheckRow
                  label="Делать первые буквы предложений прописными"
                  checked={draft.autoCapitalize}
                  onChange={(v) => set('autoCapitalize', v)}
                />
                <CheckRow
                  label="Заменять прямые кавычки парными"
                  checked={draft.autoQuotes}
                  onChange={(v) => set('autoQuotes', v)}
                />
              </>
            )}

            {section === 'Сохранение' && (
              <>
                <GroupBar>Сохранение документов</GroupBar>
                <FieldRow label="Сохранять файлы в формате:" width={200}>
                  <Select
                    value={draft.saveFormat}
                    onChange={(v) => set('saveFormat', v)}
                    items={['Документ Word (.doc)', 'Веб-страница (.html)']}
                    width={220}
                  />
                </FieldRow>
                <CheckRow
                  label="Автосохранение каждые"
                  checked={draft.autoSave}
                  onChange={(v) => set('autoSave', v)}
                />
                <FieldRow label="Интервал, минут:" width={200}>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={draft.autoSaveMinutes}
                    onChange={(e) =>
                      set('autoSaveMinutes', Math.max(1, Number(e.target.value)))
                    }
                    className="h-[22px] w-[60px] border border-[hsl(0_0%_70%)] px-1 text-[12px] outline-none"
                  />
                </FieldRow>
              </>
            )}

            {section === 'Язык' && (
              <>
                <GroupBar>Выбор языков редактирования</GroupBar>
                <FieldRow label="Язык проверки правописания:" width={200}>
                  <Select
                    value={draft.editLanguage}
                    onChange={(v) => set('editLanguage', v)}
                    items={[
                      'Русский (Россия)',
                      'Английский (США)',
                      'Немецкий (Германия)',
                    ]}
                  />
                </FieldRow>
              </>
            )}

            {section === 'Специальные возможности' && (
              <>
                <GroupBar>Обратная связь приложения</GroupBar>
                <CheckRow
                  label="Показывать строку состояния"
                  checked={draft.showStatusBar}
                  onChange={(v) => set('showStatusBar', v)}
                />
              </>
            )}

            {section === 'Дополнительно' && (
              <>
                <GroupBar>Параметры правки</GroupBar>
                <CheckRow
                  label="Заменять выделенный фрагмент при вводе"
                  checked={draft.typingReplaces}
                  onChange={(v) => set('typingReplaces', v)}
                />
                <CheckRow
                  label="Разрешить перетаскивание текста"
                  checked={draft.dragDropText}
                  onChange={(v) => set('dragDropText', v)}
                />
                <CheckRow
                  label="CTRL + щелчок для выбора гиперссылки"
                  checked={draft.ctrlClickLink}
                  onChange={(v) => set('ctrlClickLink', v)}
                />

                <GroupBar>Экран</GroupBar>
                <FieldRow label="Число документов в списке последних файлов:" width={300}>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={draft.recentCount}
                    onChange={(e) =>
                      set('recentCount', Math.max(1, Number(e.target.value)))
                    }
                    className="h-[22px] w-[60px] border border-[hsl(0_0%_70%)] px-1 text-[12px] outline-none"
                  />
                </FieldRow>
              </>
            )}

            {section === 'Настроить ленту' && (
              <>
                <GroupBar>Настройка ленты</GroupBar>
                <p className="px-3 py-2 text-[12px] leading-relaxed text-[hsl(0_0%_35%)]">
                  Состав вкладок ленты соответствует стандартной конфигурации:
                  Главная, Вставка, Конструктор, Макет, Ссылки, Рецензирование,
                  Вид, Справка.
                </p>
                <CheckRow
                  label="Автоматически сворачивать ленту"
                  checked={draft.collapseRibbon}
                  onChange={(v) => set('collapseRibbon', v)}
                />
              </>
            )}

            {section === 'Панель быстрого доступа' && (
              <>
                <GroupBar>Панель быстрого доступа</GroupBar>
                <p className="px-3 py-2 text-[12px] text-[hsl(0_0%_35%)]">
                  На панели закреплены: Сохранить, Отменить, Повторить.
                </p>
              </>
            )}

            {section === 'Надстройки' && (
              <>
                <GroupBar>Надстройки</GroupBar>
                <p className="px-3 py-2 text-[12px] text-[hsl(0_0%_35%)]">
                  Активных надстроек нет.
                </p>
              </>
            )}

            {section === 'Центр управления безопасностью' && (
              <>
                <GroupBar>Безопасность и конфиденциальность</GroupBar>
                <p className="px-3 py-2 text-[12px] leading-relaxed text-[hsl(0_0%_35%)]">
                  Документы хранятся локально в браузере и не передаются на
                  сторонние серверы.
                </p>
              </>
            )}
          </div>
        </div>

        {/* кнопки окна */}
        <div className="flex shrink-0 items-center gap-2 border-t border-[hsl(0_0%_88%)] px-4 py-2">
          <WinButton onClick={p.onReset}>По умолчанию</WinButton>
          <div className="ml-auto flex gap-2">
            <WinButton primary onClick={() => p.onApply(draft)}>
              ОК
            </WinButton>
            <WinButton onClick={p.onClose}>Отмена</WinButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionsDialog;