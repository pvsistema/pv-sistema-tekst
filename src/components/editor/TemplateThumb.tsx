import type { DocTemplate } from './fileTemplates';

const Line = ({ w, c = '#c9c9c9' }: { w: number; c?: string }) => (
  <span
    className="block h-[2px] rounded-full"
    style={{ width: `${w}%`, background: c }}
  />
);

/** Миниатюра шаблона: имитация листа A4 в галерее «Создать» */
const TemplateThumb = ({ kind }: { kind: DocTemplate['thumb'] }) => {
  const base =
    'relative flex h-full w-full flex-col overflow-hidden bg-white p-[7px]';

  if (kind === 'blank') return <div className={base} />;

  if (kind === 'welcome')
    return (
      <div className={`${base} justify-between`}>
        <span className="text-[7px] font-semibold text-[#2f5496]">Обзор</span>
        <span className="-mx-[7px] -mb-[7px] flex h-[16px] items-center justify-end bg-[#2f5496] px-1">
          <span className="flex h-[9px] w-[9px] items-center justify-center rounded-full bg-white text-[6px] text-[#2f5496]">
            →
          </span>
        </span>
      </div>
    );

  if (kind === 'single')
    return (
      <div className={base}>
        <span className="mb-1 text-[8px] font-semibold text-[#404040]">Аа</span>
      </div>
    );

  if (kind === 'toc')
    return (
      <div className={`${base} justify-between p-0`}>
        <div className="bg-[#2f5496] px-[7px] py-[6px]">
          <span className="block text-[4px] leading-[1.4] text-white/80">
            Условия защиты первого
          </span>
          <span className="block text-[6px] font-semibold text-white">
            Оглавление
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-[2px] px-[7px] pt-[5px]">
          <Line w={80} />
          <Line w={70} />
          <Line w={86} />
        </div>
        <span className="mb-[5px] ml-auto mr-[6px] flex h-[10px] w-[10px] items-center justify-center rounded-full bg-[#2f5496] text-[6px] text-white">
          →
        </span>
      </div>
    );

  if (kind === 'resume' || kind === 'chrono')
    return (
      <div className={base}>
        <div className="mb-[3px] flex items-center gap-[3px]">
          <span className="h-[11px] w-[11px] rounded-full bg-[#8ea9c1]" />
          <span className="flex flex-col gap-[1px]">
            <span className="text-[4px] font-bold leading-none text-[#1f3864]">
              ИВАНОВ
            </span>
            <Line w={100} c="#d5dce4" />
          </span>
        </div>
        <div className="flex flex-1 gap-[3px]">
          <div className="flex w-[38%] flex-col gap-[2px]">
            <Line w={100} c="#d5dce4" />
            <Line w={80} />
            <Line w={90} />
            <Line w={60} />
          </div>
          <div className="flex flex-1 flex-col gap-[2px]">
            <Line w={100} c="#8ea9c1" />
            <Line w={95} />
            <Line w={88} />
            <Line w={92} />
            <Line w={70} />
          </div>
        </div>
      </div>
    );

  if (kind === 'chrono2')
    return (
      <div className={base}>
        <span className="mb-[2px] text-[4px] font-bold text-[#c00000]">
          СОВРЕМЕННОЕ ПИСЬМО
        </span>
        <span className="mb-[3px] block h-[1px] w-full bg-[#c00000]" />
        <div className="flex flex-1 flex-col gap-[2px]">
          {[100, 96, 90, 98, 84, 70].map((w, i) => (
            <Line key={i} w={w} />
          ))}
        </div>
      </div>
    );

  if (kind === 'letter')
    return (
      <div className={base}>
        <div className="mb-[3px] flex items-start gap-[3px]">
          <span className="h-[10px] w-[8px] bg-[#b4b4b4]" />
          <span className="flex flex-1 flex-col gap-[1px] pt-[1px]">
            <Line w={90} c="#7f7f7f" />
            <Line w={60} />
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-[2px]">
          {[100, 92, 96, 88, 74].map((w, i) => (
            <Line key={i} w={w} />
          ))}
        </div>
      </div>
    );

  return (
    <div className={base}>
      <div className="mb-[3px] flex items-center gap-[3px]">
        <span className="flex h-[13px] w-[13px] items-center justify-center rounded-full bg-[#2f5496]">
          <span className="h-[6px] w-[6px] rounded-full bg-white/70" />
        </span>
        <span className="flex flex-1 flex-col gap-[1px]">
          <Line w={80} c="#2f5496" />
          <Line w={55} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-[2px]">
        {[100, 94, 90, 96, 72].map((w, i) => (
          <Line key={i} w={w} />
        ))}
      </div>
      <span className="-mx-[7px] -mb-[7px] mt-[3px] h-[7px] bg-[#2f5496]" />
    </div>
  );
};

export default TemplateThumb;
