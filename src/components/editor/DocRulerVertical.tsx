interface Props {
  zoom: number;
  /** Высота листа в пикселях */
  pageHeight: number;
  /** Верхнее и нижнее поля в пикселях */
  paddingTop: number;
  paddingBottom: number;
  /** Отступ сверху до начала листа — линейка встаёт вровень с ним */
  offsetTop?: number;
}

/**
 * Вертикальная линейка слева от листа: показывает верхнее и нижнее
 * поля и деления в сантиметрах, как в Word.
 */
const DocRulerVertical = ({
  zoom,
  pageHeight,
  paddingTop,
  paddingBottom,
  offsetTop = 16,
}: Props) => {
  const scale = zoom / 100;
  const height = pageHeight * scale;
  const padTop = paddingTop * scale;
  const padBottom = paddingBottom * scale;
  const cm = 37.8 * scale;

  /* деления считаем по полосе набора, как на горизонтальной линейке */
  const marks = Math.floor((height - padTop - padBottom) / cm);

  return (
    <div
      className="w-[20px] shrink-0 border-r border-[hsl(var(--win-ribbon-border))] bg-[hsl(0_0%_96%)]"
      style={{ paddingTop: offsetTop * scale }}
    >
      <div className="relative w-[15px] mx-auto" style={{ height }}>
        <div className="absolute inset-0 rounded-[1px] bg-[hsl(0_0%_78%)]" />

        {/* белая часть — рабочая область между полями */}
        <div
          className="absolute inset-x-0 rounded-[1px] border border-[hsl(0_0%_66%)] bg-white"
          style={{ top: padTop, bottom: padBottom }}
        />

        {Array.from({ length: Math.max(0, marks) }, (_, i) => (
          <span
            key={i}
            className="pointer-events-none absolute left-[2px] text-[8px] leading-none text-[hsl(0_0%_35%)]"
            style={{ top: padTop + (i + 1) * cm - 4 }}
          >
            {i + 1}
          </span>
        ))}
      </div>
    </div>
  );
};

export default DocRulerVertical;
