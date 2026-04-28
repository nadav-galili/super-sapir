import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { STEPS, type StepId } from "@/lib/promo-simulator/taxonomy";

interface StepperProps {
  current: StepId;
  onJump: (step: StepId) => void;
}

export function Stepper({ current, onJump }: StepperProps) {
  const progressPct = ((current - 1) / (STEPS.length - 1)) * 100;
  const reduceMotion = useReducedMotion();

  return (
    <div className="rounded-[16px] border border-[#E7E0D8] bg-white/95 backdrop-blur-sm p-4 shadow-sm">
      <div className="relative">
        {/* Vertical track. In RTL the circles sit on the right of each row, so
            the track aligns to the right side of the column. */}
        <div className="absolute right-[23px] top-6 bottom-6 w-[3px] bg-[#E7E0D8] rounded-full" />
        <motion.div
          className="absolute right-[23px] top-6 w-[3px] rounded-full"
          style={{ background: "linear-gradient(180deg, #DC4E59, #E8777F)" }}
          initial={{ height: 0 }}
          animate={{ height: `calc(${progressPct}% * (100% - 48px) / 100%)` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />

        <ol className="relative flex flex-col gap-4">
          {STEPS.map((s) => {
            const state =
              s.id === current ? "active" : s.id < current ? "done" : "todo";
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onJump(s.id as StepId)}
                  className="group flex items-center gap-3 w-full text-right focus:outline-none"
                >
                  <span
                    className="relative flex items-center justify-center w-[48px] h-[48px] shrink-0 rounded-full border-2 text-[16px] font-semibold font-mono transition-colors"
                    style={{
                      background:
                        state === "active"
                          ? "linear-gradient(135deg, #DC4E59, #E8777F)"
                          : state === "done"
                            ? "#10B981"
                            : "#FFFFFF",
                      color:
                        state === "active" || state === "done"
                          ? "#FFFFFF"
                          : "#A0AEC0",
                      borderColor:
                        state === "active"
                          ? "#DC4E59"
                          : state === "done"
                            ? "#10B981"
                            : "#E7E0D8",
                    }}
                  >
                    {state === "done" ? (
                      <motion.span
                        key={`done-${s.id}`}
                        initial={
                          reduceMotion ? false : { scale: 0, opacity: 0 }
                        }
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 18,
                        }}
                        className="flex items-center justify-center"
                      >
                        <Check className="w-5 h-5" strokeWidth={3} />
                      </motion.span>
                    ) : (
                      s.id
                    )}
                    {state === "active" && !reduceMotion && (
                      <motion.span
                        className="absolute -inset-1 rounded-full border-2 opacity-0"
                        style={{ borderColor: "#DC4E59" }}
                        animate={{
                          opacity: [0, 0.4, 0],
                          scale: [0.95, 1.08, 0.95],
                        }}
                        transition={{
                          duration: 2.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </span>
                  <span
                    className={`text-[16px] font-medium leading-tight flex-1 ${
                      state === "active"
                        ? "text-[#2D3748]"
                        : state === "done"
                          ? "text-[#4A5568]"
                          : "text-[#A0AEC0]"
                    }`}
                  >
                    {s.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
