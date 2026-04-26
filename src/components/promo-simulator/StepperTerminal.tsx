import { motion, useReducedMotion } from "motion/react";
import { STEPS, type StepId } from "@/lib/promo-simulator/taxonomy";

interface StepperTerminalProps {
  current: StepId;
  onJump: (step: StepId) => void;
}

const COLOR_LIME = "#B5F23F";
const COLOR_INK = "#0A0A0A";

/**
 * Terminal Stepper — brutalist developer-console treatment.
 * Vertical left rail, monospace, [NN] bracket notation, lime-on-black active.
 */
export function StepperTerminal({ current, onJump }: StepperTerminalProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="rounded-none border-2 bg-white p-4"
      style={{
        borderColor: COLOR_INK,
        boxShadow: `4px 4px 0 ${COLOR_INK}`,
        fontFamily: "'Fira Code', SFMono-Regular, Menlo, monospace",
      }}
    >
      <div
        className="mb-3 flex items-center justify-between border-b-2 pb-2 text-[13px] uppercase tracking-widest"
        style={{ borderColor: COLOR_INK }}
      >
        <span style={{ color: COLOR_INK }}>$ promo --plan</span>
        <span style={{ color: "rgba(10,10,10,0.5)" }}>v0.1</span>
      </div>
      <ol className="flex flex-col gap-1">
        {STEPS.map((s) => {
          const state =
            s.id === current ? "active" : s.id < current ? "done" : "todo";
          const bg =
            state === "active"
              ? COLOR_INK
              : state === "done"
                ? "rgba(10,10,10,0.04)"
                : "transparent";
          const fg =
            state === "active"
              ? COLOR_LIME
              : state === "done"
                ? COLOR_INK
                : "rgba(10,10,10,0.55)";
          const marker =
            state === "active" ? "▸" : state === "done" ? "✓" : " ";
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onJump(s.id as StepId)}
                className="group relative flex w-full items-center gap-3 px-3 py-2 text-right text-[14px] transition-colors focus:outline-none"
                style={{ background: bg, color: fg }}
              >
                <span
                  className="inline-flex w-5 justify-center text-[14px]"
                  aria-hidden
                >
                  {marker}
                </span>
                <span className="text-[14px] tabular-nums">
                  [{String(s.id).padStart(2, "0")}]
                </span>
                <span className="flex-1 truncate uppercase tracking-[0.05em]">
                  {s.title}
                </span>
                {state === "active" && !reduceMotion && (
                  <motion.span
                    aria-hidden
                    className="absolute right-1 inline-block h-[14px] w-[7px]"
                    style={{ backgroundColor: COLOR_LIME }}
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.1, repeat: Infinity }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
