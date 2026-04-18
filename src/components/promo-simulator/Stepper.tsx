import { motion, useReducedMotion } from 'motion/react'
import { Check } from 'lucide-react'
import { STEPS, type StepId } from '@/lib/promo-simulator/taxonomy'

interface StepperProps {
  current: StepId
  onJump: (step: StepId) => void
}

export function Stepper({ current, onJump }: StepperProps) {
  const progressPct = ((current - 1) / (STEPS.length - 1)) * 100
  const reduceMotion = useReducedMotion()

  return (
    <div className="sticky top-0 z-20 bg-[#FDF8F6]/95 backdrop-blur-sm border-b border-[#FFE8DE] py-4">
      <div className="relative px-4 sm:px-6">
        {/* Track line (full width behind circles). In RTL we visually go right->left. */}
        <div className="absolute top-[28px] inset-x-8 h-[3px] bg-[#FFE8DE] rounded-full" />
        <motion.div
          className="absolute top-[28px] right-8 h-[3px] rounded-full"
          style={{ background: 'linear-gradient(270deg, #DC4E59, #E8777F)' }}
          initial={{ width: 0 }}
          animate={{ width: `calc(${progressPct}% * (100% - 64px) / 100%)` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        <ol className="relative flex items-start justify-between gap-1">
          {STEPS.map((s) => {
            const state =
              s.id === current ? 'active' : s.id < current ? 'done' : 'todo'
            return (
              <li
                key={s.id}
                className="flex flex-col items-center gap-2 flex-1 min-w-0"
              >
                <button
                  type="button"
                  onClick={() => onJump(s.id as StepId)}
                  className="group flex flex-col items-center gap-2 focus:outline-none"
                >
                  <span
                    className="relative flex items-center justify-center w-[56px] h-[56px] rounded-full border-2 text-[18px] font-semibold font-mono transition-colors"
                    style={{
                      background:
                        state === 'active'
                          ? 'linear-gradient(135deg, #DC4E59, #E8777F)'
                          : state === 'done'
                            ? '#10B981'
                            : '#FFFFFF',
                      color:
                        state === 'active' || state === 'done'
                          ? '#FFFFFF'
                          : '#A0AEC0',
                      borderColor:
                        state === 'active'
                          ? '#DC4E59'
                          : state === 'done'
                            ? '#10B981'
                            : '#FFE8DE',
                    }}
                  >
                    {state === 'done' ? (
                      <motion.span
                        key={`done-${s.id}`}
                        initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 260,
                          damping: 18,
                        }}
                        className="flex items-center justify-center"
                      >
                        <Check className="w-6 h-6" strokeWidth={3} />
                      </motion.span>
                    ) : (
                      s.id
                    )}
                    {state === 'active' && !reduceMotion && (
                      <motion.span
                        className="absolute -inset-1 rounded-full border-2 opacity-0"
                        style={{ borderColor: '#DC4E59' }}
                        animate={{ opacity: [0, 0.4, 0], scale: [0.95, 1.08, 0.95] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                  </span>
                  <span
                    className={`text-[15px] font-medium text-center leading-tight max-w-[10ch] ${
                      state === 'active'
                        ? 'text-[#2D3748]'
                        : state === 'done'
                          ? 'text-[#4A5568]'
                          : 'text-[#A0AEC0]'
                    }`}
                  >
                    {s.title}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
