export function PhoneMockup() {
  return (
    <svg
      viewBox="0 0 260 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[260px] h-auto drop-shadow-lg"
    >
      {/* Phone shell */}
      <rect
        x="2"
        y="2"
        width="256"
        height="516"
        rx="36"
        fill="#FFFFFF"
        stroke="#FFE8DE"
        strokeWidth="2"
      />

      {/* Notch */}
      <rect x="88" y="8" width="84" height="24" rx="12" fill="#F5E6DE" />

      {/* Status bar dots */}
      <circle cx="125" cy="20" r="4" fill="#A0AEC0" />
      <circle cx="138" cy="20" r="3" fill="#A0AEC0" />

      {/* Header bar */}
      <rect x="16" y="42" width="228" height="36" rx="8" fill="#FDF8F6" />
      <text
        x="130"
        y="65"
        textAnchor="middle"
        fill="#2D3748"
        fontSize="12"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        Sapir Analytics
      </text>

      {/* KPI Cards row */}
      {/* Card 1 */}
      <rect x="16" y="88" width="106" height="52" rx="8" fill="#FDF8F6" />
      <rect x="16" y="88" width="4" height="52" rx="2" fill="#DC4E59" />
      <text x="28" y="107" fill="#A0AEC0" fontSize="8" fontFamily="system-ui, sans-serif">
        מכירות
      </text>
      <text
        x="28"
        y="127"
        fill="#2D3748"
        fontSize="14"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        direction="ltr"
      >
        ₪1.2M
      </text>

      {/* Card 2 */}
      <rect x="132" y="88" width="112" height="52" rx="8" fill="#FDF8F6" />
      <rect x="132" y="88" width="4" height="52" rx="2" fill="#2EC4D5" />
      <text x="144" y="107" fill="#A0AEC0" fontSize="8" fontFamily="system-ui, sans-serif">
        איכות
      </text>
      <text
        x="144"
        y="127"
        fill="#2D3748"
        fontSize="14"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        direction="ltr"
      >
        92.4
      </text>

      {/* Scan area background */}
      <rect x="24" y="156" width="212" height="200" rx="12" fill="#FDF8F6" />

      {/* Scan corners - top left */}
      <path d="M32 172 L32 162 L50 162" stroke="#DC4E59" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Scan corners - top right */}
      <path d="M228 172 L228 162 L210 162" stroke="#DC4E59" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Scan corners - bottom left */}
      <path d="M32 340 L32 350 L50 350" stroke="#DC4E59" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Scan corners - bottom right */}
      <path d="M228 340 L228 350 L210 350" stroke="#DC4E59" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Animated scan line */}
      <rect
        x="36"
        y="170"
        width="188"
        height="2"
        rx="1"
        fill="#DC4E59"
        opacity="0.8"
        style={{
          animation: 'scanLine 2.5s ease-in-out infinite',
          position: 'relative' as const,
        }}
      >
        <animate
          attributeName="y"
          values="170;340;170"
          dur="2.5s"
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.42 0 0.58 1;0.42 0 0.58 1"
        />
        <animate
          attributeName="opacity"
          values="0;1;1;0;0;1;1;0"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </rect>

      {/* Bar chart inside scan area */}
      <rect x="44" y="250" width="60" height="14" rx="3" fill="rgba(220, 78, 89, 0.18)" />
      <rect x="44" y="250" width="42" height="14" rx="3" fill="#DC4E59" opacity="0.6" />

      <rect x="44" y="272" width="60" height="14" rx="3" fill="rgba(46, 196, 213, 0.18)" />
      <rect x="44" y="272" width="52" height="14" rx="3" fill="#2EC4D5" opacity="0.6" />

      <rect x="44" y="294" width="60" height="14" rx="3" fill="rgba(108, 92, 231, 0.18)" />
      <rect x="44" y="294" width="35" height="14" rx="3" fill="#6C5CE7" opacity="0.6" />

      {/* Bar labels */}
      <text x="114" y="261" fill="#4A5568" fontSize="8" fontFamily="system-ui, sans-serif">
        ירקות
      </text>
      <text x="114" y="283" fill="#4A5568" fontSize="8" fontFamily="system-ui, sans-serif">
        מאפים
      </text>
      <text x="114" y="305" fill="#4A5568" fontSize="8" fontFamily="system-ui, sans-serif">
        בשר
      </text>

      {/* Result card */}
      <rect x="24" y="370" width="212" height="64" rx="10" fill="#FFFFFF" stroke="#FFE8DE" strokeWidth="1.5" />
      <text x="220" y="394" textAnchor="end" fill="#2D3748" fontSize="12" fontWeight="600" fontFamily="system-ui, sans-serif">
        ציון סניף
      </text>
      <text x="56" y="394" fill="#DC4E59" fontSize="18" fontWeight="700" fontFamily="system-ui, sans-serif" direction="ltr">
        85
      </text>

      {/* Confidence progress bar */}
      <rect x="36" y="410" width="188" height="8" rx="4" fill="#FDF8F6" />
      <rect x="36" y="410" width="160" height="8" rx="4" fill="url(#progressGradient)" />

      {/* Bottom nav bar hint */}
      <rect x="16" y="450" width="228" height="44" rx="10" fill="#FDF8F6" />
      <circle cx="65" cy="472" r="8" fill="rgba(220, 78, 89, 0.15)" />
      <circle cx="130" cy="472" r="8" fill="rgba(46, 196, 213, 0.15)" />
      <circle cx="195" cy="472" r="8" fill="rgba(108, 92, 231, 0.15)" />

      {/* Gradient definitions */}
      <defs>
        <linearGradient id="progressGradient" x1="36" y1="414" x2="196" y2="414" gradientUnits="userSpaceOnUse">
          <stop stopColor="#DC4E59" />
          <stop offset="1" stopColor="#2EC4D5" />
        </linearGradient>
      </defs>
    </svg>
  )
}
