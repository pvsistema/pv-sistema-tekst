interface Props {
  zoom: number;
  pageWidth: number;
  padding: number;
}

/** Горизонтальная линейка над листом, как в офисном редакторе */
const DocRuler = ({ zoom, pageWidth, padding }: Props) => {
  const scale = zoom / 100;
  const width = pageWidth * scale;
  const pad = padding * scale;
  const cm = 37.8 * scale;
  const marks = Math.floor((width - pad * 2) / cm);

  return (
    <div className="flex h-[18px] shrink-0 items-center justify-center border-b border-[hsl(var(--win-ribbon-border))] bg-[hsl(0_0%_96%)]">
      <div className="relative h-[13px]" style={{ width }}>
        <div className="absolute inset-0 rounded-[1px] bg-[hsl(0_0%_78%)]" />
        <div
          className="absolute inset-y-0 rounded-[1px] border border-[hsl(0_0%_66%)] bg-white"
          style={{ left: pad, right: pad }}
        />
        {Array.from({ length: marks }, (_, i) => (
          <span
            key={i}
            className="absolute top-[2px] text-[8px] leading-none text-[hsl(0_0%_35%)]"
            style={{ left: pad + (i + 1) * cm - 3 }}
          >
            {i + 1}
          </span>
        ))}
      </div>
    </div>
  );
};

export default DocRuler;
