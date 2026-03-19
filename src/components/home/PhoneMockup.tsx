export function PhoneMockup() {
  const W = 320
  const H = 580
  const SCREEN_X = 8
  const SCREEN_Y = 44
  const SCREEN_W = W - 16
  const SCREEN_H = H - 56
  const CX = W / 2

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[320px] h-auto drop-shadow-xl"
    >
      <defs>
        <clipPath id="screenClip">
          <rect x={SCREEN_X} y={SCREEN_Y} width={SCREEN_W} height={SCREEN_H} rx="28" />
        </clipPath>
      </defs>

      {/* Phone shell */}
      <rect x="2" y="2" width={W - 4} height={H - 4} rx="40" fill="#FFFFFF" stroke="#FFE8DE" strokeWidth="2.5" />

      {/* Screenshot clipped to screen */}
      <image
        href="/mockup-screen.png"
        x={SCREEN_X}
        y={SCREEN_Y}
        width={SCREEN_W}
        height={SCREEN_H}
        clipPath="url(#screenClip)"
        preserveAspectRatio="xMidYMin slice"
      />

      {/* Notch overlay */}
      <rect x={CX - 40} y="2" width="80" height="32" rx="16" fill="#FFFFFF" />
      <rect x={CX - 36} y="6" width="72" height="24" rx="12" fill="#F5E6DE" />
      <circle cx={CX} cy="18" r="5" fill="#E8D0C8" />

      {/* Home indicator */}
      <rect x={CX - 30} y={H - 18} width="60" height="4" rx="2" fill="rgba(255,255,255,0.7)" />
    </svg>
  )
}
