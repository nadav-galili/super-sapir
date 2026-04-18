import { forwardRef, type ButtonHTMLAttributes, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  shimmerDuration?: string
  background?: string
}

export const ShimmerButton = forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  function ShimmerButton(
    {
      shimmerColor = 'rgba(255,255,255,0.6)',
      shimmerDuration = '2.6s',
      background = 'linear-gradient(135deg, #DC4E59, #E8777F)',
      className,
      children,
      style,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        {...props}
        style={
          {
            '--shimmer-color': shimmerColor,
            '--shimmer-duration': shimmerDuration,
            background,
            ...style,
          } as CSSProperties
        }
        className={cn(
          'group relative inline-flex items-center justify-center overflow-hidden',
          'rounded-[10px] px-6 py-2.5 text-[16px] font-semibold text-white shadow-md',
          'transition-transform hover:-translate-y-0.5',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC4E59]/40 focus-visible:ring-offset-2',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0',
          'motion-reduce:hover:translate-y-0',
          className,
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 -translate-x-full',
            'bg-gradient-to-r from-transparent via-[var(--shimmer-color)] to-transparent',
            'animate-shimmer-sweep motion-reduce:hidden',
          )}
        />
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      </button>
    )
  },
)
