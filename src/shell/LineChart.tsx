/* Small accessible SVG line chart. Points may use dates or numbers on the x-axis. */
export interface Series { label: string; color: string; points: { x: number | Date; y: number }[] }

export function LineChart({ series, yMin, yMax, yLabel, height = 220, dateLabel }: { series: Series[]; yMin?: number; yMax?: number; yLabel: string; height?: number; dateLabel?: (d: Date) => string }) {
  const pts = series.flatMap(s => s.points);
  if (!pts.length) return null;
  const W = 640, H = height, L = 44, R = 12, T = 14, B = 28;
  const xs = pts.map(p => +p.x), ys = pts.map(p => p.y);
  let x0 = Math.min(...xs), x1 = Math.max(...xs); if (x0 === x1) { x0 -= 1; x1 += 1; }
  let y0 = yMin ?? Math.min(...ys), y1 = yMax ?? Math.max(...ys); if (y0 === y1) { y0 -= 1; y1 += 1; }
  const X = (x: number) => L + (x - x0) / (x1 - x0) * (W - L - R);
  const Y = (y: number) => H - B - (y - y0) / (y1 - y0) * (H - T - B);
  const isDate = pts[0].x instanceof Date;
  const lab = (v: number) => isDate ? (dateLabel ? dateLabel(new Date(v)) : new Date(v).toLocaleDateString()) : String(v);
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${yLabel}: ${series.map(s => `${s.label} ${s.points.map(p => p.y).join(", ")}`).join("; ")}`}>
        {[0, 1, 2, 3, 4].map(i => { const v = y0 + (y1 - y0) * i / 4; return (
          <g key={i}><line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke="var(--color-line)" strokeWidth={0.7} />
            <text x={L - 6} y={Y(v) + 4} textAnchor="end" fontSize={11} fill="var(--color-muted)">{Math.round(v * 10) / 10}</text></g>); })}
        <text x={L} y={H - 8} fontSize={11} fill="var(--color-muted)">{lab(x0)}</text>
        <text x={W - R} y={H - 8} textAnchor="end" fontSize={11} fill="var(--color-muted)">{lab(x1)}</text>
        {series.map(s => { const sp = [...s.points].sort((a, b) => +a.x - +b.x); return (
          <g key={s.label}>
            <path d={sp.map((p, i) => `${i ? "L" : "M"}${X(+p.x)} ${Y(p.y)}`).join(" ")} fill="none" stroke={s.color} strokeWidth={2} />
            {sp.map((p, i) => <circle key={i} cx={X(+p.x)} cy={Y(p.y)} r={3.5} fill="var(--color-surface)" stroke={s.color} strokeWidth={2} />)}
          </g>); })}
      </svg>
      {series.length > 1 && <figcaption className="mt-1 flex flex-wrap gap-4 text-[0.85rem]">{series.map(s => <span key={s.label} className="inline-flex items-center gap-1.5"><span className="inline-block h-[3px] w-3" style={{ background: s.color }} />{s.label}</span>)}</figcaption>}
    </figure>
  );
}
