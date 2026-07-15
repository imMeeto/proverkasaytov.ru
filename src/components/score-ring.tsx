// Балл-кольцо отчёта (ПС-05 §3). Цвет по светофору: ≥80 зелёный, 50–79 жёлтый, <50 красный.
export function ScoreRing({ score, size = 168 }: { score: number | null; size?: number }) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = score == null ? 0 : Math.max(0, Math.min(100, score));
  const dash = (pct / 100) * circumference;

  const color =
    score == null
      ? 'var(--color-fog-veil)'
      : score >= 80
        ? 'var(--color-verdict-green)'
        : score >= 50
          ? 'var(--color-verdict-yellow)'
          : 'var(--color-verdict-red)';

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(186,215,247,0.12)"
          strokeWidth={stroke}
        />
        {score != null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            style={{ transition: 'stroke-dasharray 0.9s ease' }}
          />
        )}
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className="text-heading-lg leading-none"
          style={{ color, fontFamily: 'var(--font-aeonikpro)' }}
        >
          {score == null ? '—' : score}
        </span>
        <span className="text-caption text-fog-veil mt-1">из 100</span>
      </div>
    </div>
  );
}
