import { APP_NAME } from '@/lib/branding'

interface BrandLogoProps {
  size?: number
  showName?: boolean
  compact?: boolean
  className?: string
}

export function BrandLogo({
  size = 32,
  showName = true,
  compact = false,
  className = '',
}: BrandLogoProps) {
  const iconSize = compact ? Math.round(size * 0.9) : size

  return (
    <div className={`flex items-center gap-2 overflow-hidden ${className}`}>
      <div
        className="flex shrink-0 items-center justify-center rounded-[10px] border border-[#1f2937] p-1 shadow-sm"
        style={{
          width: size,
          height: size,
          background: 'radial-gradient(circle at 30% 25%, #23262f 0%, #17181d 55%, #101216 100%)',
          boxShadow: 'rgba(16, 18, 22, 0.22) 0px 10px 24px',
        }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 64 64"
          width={iconSize}
          height={iconSize}
          className="block"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="rs-cap" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2EC4D5" />
              <stop offset="100%" stopColor="#53D7E5" />
            </linearGradient>
            <linearGradient id="rs-shield" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E84AE5" />
              <stop offset="100%" stopColor="#8A3FFC" />
            </linearGradient>
          </defs>

          <path
            d="M10 18 32 8l22 10-22 10Z"
            fill="none"
            stroke="url(#rs-cap)"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path d="M18 22v8" stroke="url(#rs-cap)" strokeWidth="4" strokeLinecap="round" />
          <path d="M42 20h10v10" stroke="#F6D32D" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="52" cy="33" r="2.8" fill="#F6D32D" />

          <path
            d="M16 32c8-2 24-2 32 0v16c0 2-7 7-16 11-9-4-16-9-16-11Z"
            fill="none"
            stroke="url(#rs-shield)"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M24 39v14l8-5 8 5V39"
            fill="none"
            stroke="url(#rs-shield)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m30 39 8 5-8 5Z"
            fill="#F6D32D"
            stroke="#F6D32D"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showName && (
        <div className="min-w-0">
          <p className="truncate font-bold leading-none text-[#2D3748]">
            {APP_NAME}
          </p>
          {!compact && (
            <p className="mt-1 truncate text-[11px] text-[#A0AEC0]">
              Retail Intelligence Platform
            </p>
          )}
        </div>
      )}
    </div>
  )
}
