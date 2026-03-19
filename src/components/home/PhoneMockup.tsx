export function PhoneMockup() {
  // Phone dimensions
  const W = 280
  const H = 560
  const PAD = 16 // inner padding from phone edges
  const SCREEN_X = 8
  const SCREEN_Y = 44
  const SCREEN_W = W - 16
  const SCREEN_H = H - 56
  const CX = W / 2 // center x

  // Content area
  const cx = SCREEN_X + PAD // content left
  const cw = SCREEN_W - PAD * 2 // content width
  const cr = cx + cw // content right

  // Chart data — 12 months of sales
  const salesData = [7.5, 5.2, 8.8, 9.1, 7.0, 6.8, 7.2, 8.0, 9.5, 10.2, 8.5, 7.8]
  const targetData = [8.0, 7.5, 8.2, 8.5, 7.8, 7.5, 7.8, 8.2, 9.0, 9.5, 9.0, 8.5]
  const months = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ']

  const chartX = cx + 4
  const chartY = 268
  const chartW = cw - 8
  const chartH = 130
  const maxVal = 12

  function toPoint(i: number, val: number) {
    const x = chartX + (i / (salesData.length - 1)) * chartW
    const y = chartY + chartH - (val / maxVal) * chartH
    return { x, y }
  }

  const salesPath = salesData
    .map((v, i) => {
      const { x, y } = toPoint(i, v)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  const salesAreaPath =
    salesPath +
    ` L${(chartX + chartW).toFixed(1)},${(chartY + chartH).toFixed(1)}` +
    ` L${chartX.toFixed(1)},${(chartY + chartH).toFixed(1)} Z`

  const targetPath = targetData
    .map((v, i) => {
      const { x, y } = toPoint(i, v)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[280px] h-auto drop-shadow-xl"
    >
      <defs>
        <clipPath id="screenClip">
          <rect x={SCREEN_X} y={SCREEN_Y} width={SCREEN_W} height={SCREEN_H} rx="28" />
        </clipPath>
        <linearGradient id="topStripe" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#DC4E59" />
          <stop offset="1" stopColor="#2EC4D5" />
        </linearGradient>
        <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#DC4E59" stopOpacity="0.18" />
          <stop offset="1" stopColor="#DC4E59" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="progBar" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#DC4E59" />
          <stop offset="1" stopColor="#2EC4D5" />
        </linearGradient>
      </defs>

      {/* ── Phone shell ── */}
      <rect x="2" y="2" width={W - 4} height={H - 4} rx="40" fill="#FFFFFF" stroke="#FFE8DE" strokeWidth="2.5" />

      {/* ── Screen content ── */}
      <g clipPath="url(#screenClip)">
        <rect x={SCREEN_X} y={SCREEN_Y} width={SCREEN_W} height={SCREEN_H} fill="#FDF8F6" />

        {/* Status bar */}
        <rect x={SCREEN_X} y={SCREEN_Y} width={SCREEN_W} height="22" fill="#FFFFFF" />
        <text x={CX} y={SCREEN_Y + 15} textAnchor="middle" fill="#A0AEC0" fontSize="8" fontFamily="system-ui, sans-serif">
          9:41
        </text>

        {/* ═══════════════════════════════════════════
            Element 1: Branch Info Bar
            ═══════════════════════════════════════════ */}
        <rect x={cx} y="70" width={cw} height="90" rx="12" fill="#FFFFFF" stroke="#FFE8DE" strokeWidth="1" />
        {/* Top gradient stripe */}
        <rect x={cx} y="70" width={cw} height="4" rx="2" fill="url(#topStripe)" />

        {/* Branch name + number */}
        <text x={cr - 10} y="92" textAnchor="end" fill="#2D3748" fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif">
          סניף חדרה #44
        </text>
        {/* Manager info */}
        <text x={cr - 10} y="106" textAnchor="end" fill="#A0AEC0" fontSize="7.5" fontFamily="system-ui, sans-serif">
          מנהל: מרטין רוח · אזור: גיא רייף
        </text>

        {/* Badges row */}
        {/* Grade A badge */}
        <rect x={cx + 6} y="116" width="48" height="18" rx="9" fill="#DC4E59" />
        <text x={cx + 30} y="128.5" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="600" fontFamily="system-ui, sans-serif">
          דירוג A
        </text>
        {/* Internet active badge */}
        <rect x={cx + 60} y="116" width="58" height="18" rx="9" fill="#2EC4D5" opacity="0.15" />
        <text x={cx + 89} y="128.5" textAnchor="middle" fill="#2EC4D5" fontSize="8" fontWeight="600" fontFamily="system-ui, sans-serif">
          אינטרנט פעיל
        </text>
        {/* Area badge */}
        <rect x={cx + 124} y="116" width="48" height="18" rx="9" fill="#F5E6DE" />
        <text x={cx + 148} y="128.5" textAnchor="middle" fill="#4A5568" fontSize="7.5" fontWeight="500" fontFamily="system-ui, sans-serif">
          3,080 מ״ר
        </text>

        {/* Location icon */}
        <circle cx={cx + 14} cy="88" r="8" fill="rgba(220,78,89,0.12)" />
        <circle cx={cx + 14} cy="86" r="3" fill="#DC4E59" />
        <path d={`M${cx + 14} 90 L${cx + 14} 93`} stroke="#DC4E59" strokeWidth="1.5" strokeLinecap="round" />

        {/* ═══════════════════════════════════════════
            3 KPI cards row
            ═══════════════════════════════════════════ */}
        {[
          { label: 'מכירות', value: '₪9.2M', trend: '+4.2%', trendUp: true, color: '#DC4E59' },
          { label: 'סל ממוצע', value: '₪185', trend: '+1.8%', trendUp: true, color: '#2EC4D5' },
          { label: 'ציון איכות', value: '92.4', trend: '+2.1', trendUp: true, color: '#6C5CE7' },
        ].map((kpi, i) => {
          const cardW = (cw - 12) / 3
          const cardX = cx + i * (cardW + 6)
          return (
            <g key={kpi.label}>
              <rect x={cardX} y="170" width={cardW} height="58" rx="8" fill="#FFFFFF" stroke="#FFE8DE" strokeWidth="0.75" />
              {/* Right accent bar */}
              <rect x={cardX + cardW - 3} y="176" width="2.5" height="46" rx="1.25" fill={kpi.color} opacity="0.5" />
              <text x={cardX + cardW - 10} y="186" textAnchor="end" fill="#A0AEC0" fontSize="7" fontFamily="system-ui, sans-serif">
                {kpi.label}
              </text>
              <text x={cardX + cardW - 10} y="201" textAnchor="end" fill="#2D3748" fontSize="13" fontWeight="700" fontFamily="monospace, system-ui">
                {kpi.value}
              </text>
              {/* Trend pill */}
              <rect x={cardX + 5} y="210" width="30" height="12" rx="6" fill={kpi.trendUp ? 'rgba(46,196,213,0.12)' : 'rgba(220,78,89,0.12)'} />
              <text x={cardX + 20} y="219" textAnchor="middle" fill={kpi.trendUp ? '#2EC4D5' : '#DC4E59'} fontSize="6.5" fontWeight="600" fontFamily="system-ui, sans-serif">
                {kpi.trend}
              </text>
            </g>
          )
        })}

        {/* ═══════════════════════════════════════════
            Element 2: Sales Trend Chart
            ═══════════════════════════════════════════ */}
        <rect x={cx} y="240" width={cw} height="185" rx="12" fill="#FFFFFF" stroke="#FFE8DE" strokeWidth="1" />

        {/* Chart title */}
        <text x={cr - 10} y="260" textAnchor="end" fill="#2D3748" fontSize="9" fontWeight="600" fontFamily="system-ui, sans-serif">
          מגמת מכירות — 2025 מול 2024
        </text>
        {/* Chart icon */}
        <circle cx={cx + 14} cy="256" r="7" fill="rgba(46,196,213,0.12)" />
        <text x={cx + 14} y="259.5" textAnchor="middle" fill="#2EC4D5" fontSize="8" fontFamily="system-ui, sans-serif">
          ↗
        </text>

        {/* Y-axis labels */}
        {[0, 3, 6, 9, 12].map((v) => {
          const y = chartY + chartH - (v / maxVal) * chartH
          return (
            <g key={v}>
              <text x={chartX - 2} y={y + 3} textAnchor="end" fill="#A0AEC0" fontSize="6" fontFamily="system-ui, sans-serif">
                {v}M
              </text>
              <line x1={chartX} y1={y} x2={chartX + chartW} y2={y} stroke="#F5E6DE" strokeWidth="0.5" />
            </g>
          )
        })}

        {/* Area fill */}
        <path d={salesAreaPath} fill="url(#salesFill)" />
        {/* Sales line (2025) */}
        <path d={salesPath} stroke="#DC4E59" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Target line (2024) — dashed */}
        <path d={targetPath} stroke="#A0AEC0" strokeWidth="1" fill="none" strokeDasharray="3 2" />

        {/* Data points on sales line */}
        {salesData.map((v, i) => {
          const { x, y } = toPoint(i, v)
          return <circle key={i} cx={x} cy={y} r="2" fill="#DC4E59" />
        })}

        {/* X-axis month labels */}
        {months.map((m, i) => {
          const x = chartX + (i / (months.length - 1)) * chartW
          return (
            <text key={m} x={x} y={chartY + chartH + 12} textAnchor="middle" fill="#A0AEC0" fontSize="5.5" fontFamily="system-ui, sans-serif">
              {m}
            </text>
          )
        })}

        {/* Legend */}
        <line x1={cx + 50} y1="416" x2={cx + 62} y2="416" stroke="#DC4E59" strokeWidth="1.5" />
        <text x={cx + 48} y="419" textAnchor="end" fill="#4A5568" fontSize="6.5" fontFamily="system-ui, sans-serif">
          2025
        </text>
        <line x1={cx + 90} y1="416" x2={cx + 102} y2="416" stroke="#A0AEC0" strokeWidth="1" strokeDasharray="3 2" />
        <text x={cx + 88} y="419" textAnchor="end" fill="#4A5568" fontSize="6.5" fontFamily="system-ui, sans-serif">
          2024
        </text>

        {/* ═══════════════════════════════════════════
            Bottom tab bar
            ═══════════════════════════════════════════ */}
        <rect x={SCREEN_X} y={SCREEN_Y + SCREEN_H - 36} width={SCREEN_W} height="36" fill="#FFFFFF" />
        <line x1={SCREEN_X} y1={SCREEN_Y + SCREEN_H - 36} x2={SCREEN_X + SCREEN_W} y2={SCREEN_Y + SCREEN_H - 36} stroke="#FFE8DE" strokeWidth="0.5" />
        {[
          { x: CX - 60, color: '#DC4E59', active: true },
          { x: CX - 20, color: '#A0AEC0', active: false },
          { x: CX + 20, color: '#A0AEC0', active: false },
          { x: CX + 60, color: '#A0AEC0', active: false },
        ].map((tab) => (
          <g key={tab.x}>
            <rect x={tab.x - 10} y={SCREEN_Y + SCREEN_H - 28} width="20" height="3" rx="1.5" fill={tab.active ? tab.color : 'transparent'} />
            <circle cx={tab.x} cy={SCREEN_Y + SCREEN_H - 17} r="4" fill={tab.active ? 'rgba(220,78,89,0.15)' : '#F5E6DE'} />
            <circle cx={tab.x} cy={SCREEN_Y + SCREEN_H - 17} r="1.8" fill={tab.color} />
          </g>
        ))}
      </g>

      {/* ── Notch ── */}
      <rect x="100" y="2" width="80" height="32" rx="16" fill="#FFFFFF" />
      <rect x="104" y="6" width="72" height="24" rx="12" fill="#F5E6DE" />
      <circle cx={CX} cy="18" r="5" fill="#E8D0C8" />

      {/* ── Home indicator ── */}
      <rect x="110" y={H - 18} width="60" height="4" rx="2" fill="#E8D0C8" />
    </svg>
  )
}
