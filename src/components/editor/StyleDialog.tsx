import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { DocStyle } from '@/lib/doc-styles';
import { fullFormat } from '@/lib/doc-styles';

interface Props {
  open: boolean;
  /** Стиль для правки; пусто — создаём новый */
  initial: DocStyle | null;
  onClose: () => void;
  onSave: (style: DocStyle) => void;
  onDelete?: (id: string) => void;
}

const FONTS = [
  'Calibri',
  'Calibri Light',
  'Times New Roman',
  'Arial',
  'Georgia',
  'Courier New',
  'Verdana',
  'Cambria',
];

const SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48];

const inputCls =
  'h-[26px] rounded-[2px] border border-slate-300 bg-white px-1.5 text-[12px] outline-none focus:border-primary';

const Field = ({
  label,
  children,
  width,
}: {
  label: string;
  children: React.ReactNode;
  width?: number;
}) => (
  <div className="flex flex-col gap-1" style={width ? { width } : undefined}>
    <span className="text-[11px] text-slate-600">{label}</span>
    {children}
  </div>
);

/** Кнопка-переключатель начертания */
const Toggle = ({
  icon,
  on,
  onClick,
  title,
}: {
  icon: string;
  on: boolean;
  onClick: () => void;
  title: string;
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`flex h-[26px] w-[28px] items-center justify-center rounded-[2px] border ${
      on
        ? 'border-[hsl(var(--win-title))] bg-[hsl(var(--win-hover))]'
        : 'border-slate-300 bg-white'
    }`}
  >
    <Icon name={icon} size={14} />
  </button>
);

/** Окно создания и изменения стиля */
const StyleDialog = ({ open, initial, onClose, onSave, onDelete }: Props) => {
  const [style, setStyle] = useState<DocStyle | null>(initial);

  useEffect(() => {
    if (!open) return;

    setStyle(
      initial ?? {
        id: `style-${Date.now()}`,
        name: 'Стиль 1',
        kind: 'paragraph',
        level: 0,
        tag: 'p',
        builtin: false,
        char: {},
        para: {},
      },
    );
  }, [open, initial]);

  if (!open || !style) return null;

  const { char, para } = fullFormat(style);
  const isNew = !initial;

  const patchChar = (v: Partial<typeof char>) =>
    setStyle((s) => (s ? { ...s, char: { ...s.char, ...v } } : s));

  const patchPara = (v: Partial<typeof para>) =>
    setStyle((s) => (s ? { ...s, para: { ...s.para, ...v } } : s));

  return (
    <div
      className="fixed inset-0 z-[115] flex items-center justify-center bg-slate-900/30"
      onMouseDown={onClose}
    >
      <div
        className="w-[540px] rounded-md bg-[hsl(var(--win-ribbon))] shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          className="flex h-8 items-center justify-between px-3 text-[12px]"
          style={{
            background: 'hsl(var(--win-title))',
            color: 'hsl(var(--win-title-text))',
          }}
        >
          <span>{isNew ? 'Создание стиля' : 'Изменение стиля'}</span>
          <button type="button" onClick={onClose} className="px-1">
            ✕
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="flex gap-3">
            <Field label="Имя стиля" width={250}>
              <input
                value={style.name}
                onChange={(e) =>
                  setStyle((s) => (s ? { ...s, name: e.target.value } : s))
                }
                className={inputCls}
              />
            </Field>

            <Field label="Стиль" width={150}>
              <select
                value={style.kind}
                disabled={style.builtin}
                onChange={(e) =>
                  setStyle((s) =>
                    s
                      ? {
                          ...s,
                          kind: e.target.value as DocStyle['kind'],
                          tag: e.target.value === 'character' ? 'span' : s.tag,
                        }
                      : s,
                  )
                }
                className={`${inputCls} disabled:bg-slate-100`}
              >
                <option value="paragraph">абзаца</option>
                <option value="character">знака</option>
              </select>
            </Field>

            {style.kind === 'paragraph' && (
              <Field label="Уровень" width={100}>
                <select
                  value={style.level}
                  onChange={(e) => {
                    const level = Number(e.target.value) as DocStyle['level'];
                    setStyle((s) =>
                      s
                        ? {
                            ...s,
                            level,
                            tag: level ? `h${level}` : 'p',
                          }
                        : s,
                    );
                  }}
                  className={inputCls}
                >
                  <option value={0}>Основной</option>
                  <option value={1}>Заголовок 1</option>
                  <option value={2}>Заголовок 2</option>
                  <option value={3}>Заголовок 3</option>
                </select>
              </Field>
            )}
          </div>

          <div className="flex items-end gap-3">
            <Field label="Шрифт" width={170}>
              <select
                value={char.family}
                onChange={(e) => patchChar({ family: e.target.value })}
                className={inputCls}
              >
                {FONTS.map((f) => (
                  <option key={f} value={f} style={{ fontFamily: f }}>
                    {f}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Размер" width={80}>
              <select
                value={char.size}
                onChange={(e) => patchChar({ size: Number(e.target.value) })}
                className={inputCls}
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>

            <div className="flex gap-1">
              <Toggle
                icon="Bold"
                title="Полужирный"
                on={!!char.bold}
                onClick={() => patchChar({ bold: !char.bold })}
              />
              <Toggle
                icon="Italic"
                title="Курсив"
                on={!!char.italic}
                onClick={() => patchChar({ italic: !char.italic })}
              />
              <Toggle
                icon="Underline"
                title="Подчёркнутый"
                on={char.underline !== 'none'}
                onClick={() =>
                  patchChar({
                    underline: char.underline === 'none' ? 'single' : 'none',
                  })
                }
              />
            </div>

            <Field label="Цвет" width={70}>
              <input
                type="color"
                value={char.color}
                onChange={(e) => patchChar({ color: e.target.value })}
                className="h-[26px] w-full cursor-pointer rounded-[2px] border border-slate-300 bg-white"
              />
            </Field>
          </div>

          {style.kind === 'paragraph' && (
            <div className="flex gap-3">
              <Field label="Выравнивание" width={140}>
                <select
                  value={para.align}
                  onChange={(e) =>
                    patchPara({ align: e.target.value as typeof para.align })
                  }
                  className={inputCls}
                >
                  <option value="left">По левому краю</option>
                  <option value="center">По центру</option>
                  <option value="right">По правому краю</option>
                  <option value="justify">По ширине</option>
                </select>
              </Field>

              <Field label="Перед, пт" width={85}>
                <input
                  type="number"
                  min={0}
                  step={2}
                  value={para.spaceBefore}
                  onChange={(e) =>
                    patchPara({ spaceBefore: Number(e.target.value) })
                  }
                  className={inputCls}
                />
              </Field>

              <Field label="После, пт" width={85}>
                <input
                  type="number"
                  min={0}
                  step={2}
                  value={para.spaceAfter}
                  onChange={(e) =>
                    patchPara({ spaceAfter: Number(e.target.value) })
                  }
                  className={inputCls}
                />
              </Field>

              <Field label="Отступ 1-й строки, см" width={150}>
                <input
                  type="number"
                  step={0.25}
                  value={para.firstLine}
                  onChange={(e) =>
                    patchPara({ firstLine: Number(e.target.value) })
                  }
                  className={inputCls}
                />
              </Field>
            </div>
          )}

          <div>
            <p className="mb-1 text-[11px] text-slate-600">Образец</p>
            <div className="flex h-[76px] items-center rounded-[2px] border border-slate-300 bg-white px-3">
              <p
                className="w-full truncate"
                style={{
                  fontFamily: char.family,
                  fontSize: Math.min(26, char.size * 1.34),
                  fontWeight: char.bold ? 700 : 400,
                  fontStyle: char.italic ? 'italic' : 'normal',
                  color: char.color,
                  textDecorationLine:
                    char.underline !== 'none' ? 'underline' : undefined,
                  textAlign: para.align,
                }}
              >
                {style.name || 'Образец стиля'} — съешь ещё этих булок
              </p>
            </div>
          </div>

          {style.level > 0 && (
            <p className="text-[11px] text-slate-500">
              Абзацы с этим стилем попадут в оглавление на уровне{' '}
              {style.level}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-300 px-4 py-3">
          {!isNew && !style.builtin && onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="mr-auto text-destructive"
              onClick={() => onDelete(style.id)}
            >
              Удалить стиль
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button size="sm" onClick={() => onSave(style)}>
            ОК
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StyleDialog;
