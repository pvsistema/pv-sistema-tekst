/** Вид диаграммы */
export type ChartKind =
  | 'column'
  | 'bar'
  | 'line'
  | 'line-markers'
  | 'pie'
  | 'doughnut'
  | 'area'
  | 'scatter';

export const CHART_KINDS: {
  value: ChartKind;
  label: string;
  icon: string;
  hint: string;
}[] = [
  {
    value: 'column',
    label: 'Гистограмма',
    icon: 'ChartColumn',
    hint: 'Сравнение значений по категориям',
  },
  {
    value: 'bar',
    label: 'Линейчатая',
    icon: 'ChartBarBig',
    hint: 'Столбцы лежат горизонтально',
  },
  {
    value: 'line',
    label: 'График',
    icon: 'ChartLine',
    hint: 'Изменение величины во времени',
  },
  {
    value: 'line-markers',
    label: 'График с маркерами',
    icon: 'ChartSpline',
    hint: 'График с точками на изломах',
  },
  {
    value: 'pie',
    label: 'Круговая',
    icon: 'ChartPie',
    hint: 'Доли одной величины',
  },
  {
    value: 'doughnut',
    label: 'Кольцевая',
    icon: 'CircleDot',
    hint: 'Доли с отверстием в середине',
  },
  {
    value: 'area',
    label: 'С областями',
    icon: 'AreaChart',
    hint: 'График с заливкой под линией',
  },
  {
    value: 'scatter',
    label: 'Точечная',
    icon: 'ScatterChart',
    hint: 'Связь двух величин',
  },
];

/**
 * Данные диаграммы в терминах урока: серия — строка таблицы,
 * категория — столбец, легенда — набор имён серий.
 */
export interface ChartData {
  /** Имена категорий — заголовки столбцов */
  categories: string[];
  /** Серии: имя строки и её значения */
  series: { name: string; values: number[] }[];
}

export interface ChartSetup {
  kind: ChartKind;
  data: ChartData;
  title: string;
  /** Показывать набор имён серий */
  legend: boolean;
  /** Подписи значений на самой диаграмме */
  dataLabels: boolean;
  /** Линии сетки по горизонтали */
  gridLines: boolean;
  width: number;
  height: number;
  /** Набор цветов */
  palette: string[];
}

export const PALETTES: { label: string; colors: string[] }[] = [
  {
    label: 'Стандартная',
    colors: ['#4472c4', '#ed7d31', '#a5a5a5', '#ffc000', '#5b9bd5', '#70ad47'],
  },
  {
    label: 'Синяя',
    colors: ['#2f5496', '#4472c4', '#8faadc', '#b4c7e7', '#d9e2f3', '#1f3864'],
  },
  {
    label: 'Тёплая',
    colors: ['#c55a11', '#ed7d31', '#f4b183', '#ffd966', '#ffc000', '#843c0c'],
  },
  {
    label: 'Зелёная',
    colors: ['#507e32', '#70ad47', '#a9d08e', '#c6e0b4', '#e2efd9', '#375623'],
  },
  {
    label: 'Серая',
    colors: ['#404040', '#7f7f7f', '#a5a5a5', '#bfbfbf', '#d9d9d9', '#262626'],
  },
];

/** Данные по умолчанию — как в примере урока */
export const DEFAULT_DATA: ChartData = {
  categories: ['1 кв.', '2 кв.', '3 кв.', '4 кв.'],
  series: [
    { name: 'Ряд 1', values: [4.3, 2.5, 3.5, 4.5] },
    { name: 'Ряд 2', values: [2.4, 4.4, 1.8, 2.8] },
    { name: 'Ряд 3', values: [2, 2, 3, 5] },
  ],
};

export const DEFAULT_CHART: ChartSetup = {
  kind: 'column',
  data: DEFAULT_DATA,
  title: 'Название диаграммы',
  legend: true,
  dataLabels: false,
  gridLines: true,
  width: 460,
  height: 280,
  palette: PALETTES[0].colors,
};

/** Границы значений с запасом, чтобы столбцы не упирались в край */
const bounds = (data: ChartData) => {
  const all = data.series.flatMap((s) => s.values);
  const max = Math.max(0, ...all);
  const min = Math.min(0, ...all);

  /* округляем вверх до круглого числа */
  const step = niceStep((max - min) / 5 || 1);
  const top = Math.ceil(max / step) * step;
  const bottom = Math.floor(min / step) * step;

  return { top: top || step, bottom, step };
};

/** Подбирает «круглый» шаг сетки: 1, 2, 5, 10, 20… */
const niceStep = (raw: number): number => {
  const power = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / power;

  if (norm <= 1) return power;
  if (norm <= 2) return 2 * power;
  if (norm <= 5) return 5 * power;
  return 10 * power;
};

/** Убирает лишние нули: 2.50 → 2,5 */
const num = (v: number): string =>
  String(Math.round(v * 100) / 100).replace('.', ',');

/** Рисует диаграмму как SVG — он печатается и сохраняется вместе с текстом */
export const chartSvg = (s: ChartSetup): string => {
  const { width: W, height: H } = s;

  const padTop = s.title ? 34 : 14;
  const padBottom = 34;
  const padLeft = 44;
  const padRight = 14;

  const legendH = s.legend ? 22 : 0;
  const plotW = W - padLeft - padRight;
  const plotH = H - padTop - padBottom - legendH;

  const parts: string[] = [];

  parts.push(
    `<rect x="0" y="0" width="${W}" height="${H}" fill="#fff" stroke="#d9d9d9"/>`,
  );

  if (s.title) {
    parts.push(
      `<text x="${W / 2}" y="21" text-anchor="middle" font-size="13" ` +
        `font-family="Calibri, Arial" fill="#404040">${esc(s.title)}</text>`,
    );
  }

  const round = s.kind === 'pie' || s.kind === 'doughnut';

  if (round) {
    parts.push(pieBody(s, padLeft, padTop, plotW, plotH));
  } else if (s.kind === 'bar') {
    /* линейчатая — та же гистограмма, но столбцы лежат горизонтально */
    parts.push(barBody(s, padLeft + 26, padTop, plotW - 26, plotH));
  } else {
    parts.push(axisBody(s, padLeft, padTop, plotW, plotH));
  }

  if (s.legend) {
    parts.push(legendBody(s, W, H - legendH + 4));
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" ` +
    `viewBox="0 0 ${W} ${H}" class="pv-chart-svg">${parts.join('')}</svg>`
  );
};

/** Диаграммы с осями: столбцы, линии, области, точки */
const axisBody = (
  s: ChartSetup,
  x0: number,
  y0: number,
  w: number,
  h: number,
): string => {
  const { top, bottom, step } = bounds(s.data);
  const range = top - bottom || 1;

  const yOf = (v: number) => y0 + h - ((v - bottom) / range) * h;
  const parts: string[] = [];

  /* сетка и подписи оси значений */
  for (let v = bottom; v <= top + 0.0001; v += step) {
    const y = yOf(v);

    if (s.gridLines) {
      parts.push(
        `<line x1="${x0}" y1="${y}" x2="${x0 + w}" y2="${y}" ` +
          `stroke="#e6e6e6" stroke-width="1"/>`,
      );
    }

    parts.push(
      `<text x="${x0 - 6}" y="${y + 4}" text-anchor="end" font-size="10" ` +
        `font-family="Calibri, Arial" fill="#7f7f7f">${num(v)}</text>`,
    );
  }

  /* ось категорий */
  const zeroY = yOf(Math.max(bottom, Math.min(0, top)));
  parts.push(
    `<line x1="${x0}" y1="${zeroY}" x2="${x0 + w}" y2="${zeroY}" ` +
      `stroke="#a6a6a6" stroke-width="1"/>`,
  );

  const cats = s.data.categories.length || 1;
  const slot = w / cats;

  /* подписи категорий */
  s.data.categories.forEach((c, i) => {
    parts.push(
      `<text x="${x0 + slot * i + slot / 2}" y="${y0 + h + 15}" ` +
        `text-anchor="middle" font-size="10" font-family="Calibri, Arial" ` +
        `fill="#595959">${esc(c)}</text>`,
    );
  });

  const series = s.data.series;

  if (s.kind === 'column') {
    const groupW = slot * 0.7;
    const barW = groupW / Math.max(1, series.length);

    series.forEach((ser, si) => {
      ser.values.forEach((v, ci) => {
        const left = x0 + slot * ci + (slot - groupW) / 2 + barW * si;
        const y = yOf(Math.max(v, 0));
        const height = Math.abs(yOf(v) - zeroY);

        parts.push(
          `<rect x="${left.toFixed(1)}" y="${y.toFixed(1)}" ` +
            `width="${Math.max(1, barW - 1).toFixed(1)}" ` +
            `height="${Math.max(0, height).toFixed(1)}" ` +
            `fill="${s.palette[si % s.palette.length]}"/>`,
        );

        if (s.dataLabels) {
          parts.push(
            `<text x="${(left + barW / 2).toFixed(1)}" y="${(y - 3).toFixed(1)}" ` +
              `text-anchor="middle" font-size="9" font-family="Calibri, Arial" ` +
              `fill="#595959">${num(v)}</text>`,
          );
        }
      });
    });

    return parts.join('');
  }

  /* линии, области и точки строятся по одним и тем же точкам */
  series.forEach((ser, si) => {
    const color = s.palette[si % s.palette.length];

    const points = ser.values.map((v, ci) => ({
      x: x0 + slot * ci + slot / 2,
      y: yOf(v),
      v,
    }));

    const line = points
      .map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ');

    if (s.kind === 'area') {
      parts.push(
        `<path d="${line} L${points[points.length - 1]?.x.toFixed(1)},${zeroY} ` +
          `L${points[0]?.x.toFixed(1)},${zeroY} Z" fill="${color}" ` +
          `fill-opacity="0.35"/>`,
      );
    }

    if (s.kind !== 'scatter') {
      parts.push(
        `<path d="${line}" fill="none" stroke="${color}" stroke-width="2" ` +
          `stroke-linejoin="round"/>`,
      );
    }

    if (s.kind === 'line-markers' || s.kind === 'scatter') {
      points.forEach((p) => {
        parts.push(
          `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" ` +
            `fill="${color}" stroke="#fff" stroke-width="1"/>`,
        );
      });
    }

    if (s.dataLabels) {
      points.forEach((p) => {
        parts.push(
          `<text x="${p.x.toFixed(1)}" y="${(p.y - 7).toFixed(1)}" ` +
            `text-anchor="middle" font-size="9" font-family="Calibri, Arial" ` +
            `fill="#595959">${num(p.v)}</text>`,
        );
      });
    }
  });

  return parts.join('');
};

/** Линейчатая: значения откладываются вправо, категории идут вниз */
const barBody = (
  s: ChartSetup,
  x0: number,
  y0: number,
  w: number,
  h: number,
): string => {
  const { top, bottom, step } = bounds(s.data);
  const range = top - bottom || 1;

  const xOf = (v: number) => x0 + ((v - bottom) / range) * w;
  const parts: string[] = [];

  /* сетка и подписи оси значений — теперь снизу */
  for (let v = bottom; v <= top + 0.0001; v += step) {
    const x = xOf(v);

    if (s.gridLines) {
      parts.push(
        `<line x1="${x.toFixed(1)}" y1="${y0}" x2="${x.toFixed(1)}" ` +
          `y2="${y0 + h}" stroke="#e6e6e6" stroke-width="1"/>`,
      );
    }

    parts.push(
      `<text x="${x.toFixed(1)}" y="${y0 + h + 15}" text-anchor="middle" ` +
        `font-size="10" font-family="Calibri, Arial" fill="#7f7f7f">` +
        `${num(v)}</text>`,
    );
  }

  const zeroX = xOf(Math.max(bottom, Math.min(0, top)));
  parts.push(
    `<line x1="${zeroX.toFixed(1)}" y1="${y0}" x2="${zeroX.toFixed(1)}" ` +
      `y2="${y0 + h}" stroke="#a6a6a6" stroke-width="1"/>`,
  );

  const cats = s.data.categories.length || 1;
  const slot = h / cats;
  const groupH = slot * 0.7;
  const barH = groupH / Math.max(1, s.data.series.length);

  s.data.categories.forEach((c, i) => {
    parts.push(
      `<text x="${x0 - 6}" y="${(y0 + slot * i + slot / 2 + 4).toFixed(1)}" ` +
        `text-anchor="end" font-size="10" font-family="Calibri, Arial" ` +
        `fill="#595959">${esc(c)}</text>`,
    );
  });

  s.data.series.forEach((ser, si) => {
    ser.values.forEach((v, ci) => {
      const topY = y0 + slot * ci + (slot - groupH) / 2 + barH * si;
      const left = xOf(Math.min(v, 0));
      const width = Math.abs(xOf(v) - zeroX);

      parts.push(
        `<rect x="${left.toFixed(1)}" y="${topY.toFixed(1)}" ` +
          `width="${Math.max(0, width).toFixed(1)}" ` +
          `height="${Math.max(1, barH - 1).toFixed(1)}" ` +
          `fill="${s.palette[si % s.palette.length]}"/>`,
      );

      if (s.dataLabels) {
        parts.push(
          `<text x="${(left + width + 4).toFixed(1)}" ` +
            `y="${(topY + barH / 2 + 3).toFixed(1)}" font-size="9" ` +
            `font-family="Calibri, Arial" fill="#595959">${num(v)}</text>`,
        );
      }
    });
  });

  return parts.join('');
};

/** Круговая и кольцевая: доли первой серии */
const pieBody = (
  s: ChartSetup,
  x0: number,
  y0: number,
  w: number,
  h: number,
): string => {
  const values = s.data.series[0]?.values ?? [];
  const total = values.reduce((a, b) => a + Math.abs(b), 0);

  if (!total) return '';

  const cx = x0 + w / 2;
  const cy = y0 + h / 2;
  const r = Math.min(w, h) / 2 - 6;
  const inner = s.kind === 'doughnut' ? r * 0.55 : 0;

  const parts: string[] = [];
  let angle = -Math.PI / 2;

  values.forEach((v, i) => {
    const share = Math.abs(v) / total;
    const sweep = share * Math.PI * 2;
    const end = angle + sweep;

    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const big = sweep > Math.PI ? 1 : 0;

    const color = s.palette[i % s.palette.length];

    if (inner) {
      const ix1 = cx + inner * Math.cos(end);
      const iy1 = cy + inner * Math.sin(end);
      const ix2 = cx + inner * Math.cos(angle);
      const iy2 = cy + inner * Math.sin(angle);

      parts.push(
        `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} ` +
          `A${r},${r} 0 ${big} 1 ${x2.toFixed(1)},${y2.toFixed(1)} ` +
          `L${ix1.toFixed(1)},${iy1.toFixed(1)} ` +
          `A${inner},${inner} 0 ${big} 0 ${ix2.toFixed(1)},${iy2.toFixed(1)} Z" ` +
          `fill="${color}" stroke="#fff" stroke-width="1"/>`,
      );
    } else {
      parts.push(
        `<path d="M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} ` +
          `A${r},${r} 0 ${big} 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z" ` +
          `fill="${color}" stroke="#fff" stroke-width="1"/>`,
      );
    }

    if (s.dataLabels && share > 0.03) {
      const mid = angle + sweep / 2;
      const lr = inner ? (r + inner) / 2 : r * 0.65;

      parts.push(
        `<text x="${(cx + lr * Math.cos(mid)).toFixed(1)}" ` +
          `y="${(cy + lr * Math.sin(mid) + 4).toFixed(1)}" text-anchor="middle" ` +
          `font-size="10" font-family="Calibri, Arial" fill="#fff">` +
          `${Math.round(share * 100)}%</text>`,
      );
    }

    angle = end;
  });

  return parts.join('');
};

/** Набор имён серий внизу диаграммы */
const legendBody = (s: ChartSetup, W: number, y: number): string => {
  const round = s.kind === 'pie' || s.kind === 'doughnut';

  /* у круговой в легенде стоят категории, а не серии */
  const names = round
    ? s.data.categories
    : s.data.series.map((x) => x.name);

  const itemW = Math.min(120, W / Math.max(1, names.length));
  const totalW = itemW * names.length;
  let x = (W - totalW) / 2;

  return names
    .map((name, i) => {
      const color = s.palette[i % s.palette.length];
      const box =
        `<rect x="${x.toFixed(1)}" y="${y}" width="9" height="9" ` +
        `fill="${color}" rx="1"/>` +
        `<text x="${(x + 13).toFixed(1)}" y="${y + 8}" font-size="10" ` +
        `font-family="Calibri, Arial" fill="#595959">${esc(cut(name))}</text>`;

      x += itemW;
      return box;
    })
    .join('');
};

const cut = (s: string) => (s.length > 14 ? `${s.slice(0, 13)}…` : s);

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Разметка диаграммы для вставки в документ */
export const chartHtml = (s: ChartSetup): string =>
  `<span class="pv-object pv-chart" data-object="chart" data-wrap="inline" ` +
  `data-chart="${escAttr(JSON.stringify(s))}" ` +
  `style="width:${s.width}px;height:${s.height}px;display:inline-block;` +
  `vertical-align:middle;margin:6px 4px">${chartSvg(s)}` +
  `<span class="pv-object-handle" contenteditable="false"></span></span>`;

const escAttr = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Читает настройки из вставленной диаграммы */
export const readChart = (el: Element): ChartSetup | null => {
  const raw = el.getAttribute('data-chart');
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ChartSetup;
  } catch {
    return null;
  }
};

/** Разбирает вставленный текст таблицы — данные из буфера обмена */
export const parseTableText = (text: string): ChartData | null => {
  const rows = text
    .trim()
    .split(/\r?\n/)
    .map((r) => r.split(/\t|;/).map((c) => c.trim()))
    .filter((r) => r.length > 1);

  if (rows.length < 2) return null;

  const categories = rows[0].slice(1);

  const series = rows.slice(1).map((r) => ({
    name: r[0] || 'Ряд',
    values: r
      .slice(1)
      .map((v) => Number(v.replace(',', '.')) || 0)
      .slice(0, categories.length),
  }));

  return { categories, series };
};
