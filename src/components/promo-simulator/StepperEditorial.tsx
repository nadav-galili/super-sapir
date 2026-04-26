import { motion, useReducedMotion } from "motion/react";
import { STEPS, type StepId } from "@/lib/promo-simulator/taxonomy";

interface StepperEditorialProps {
  current: StepId;
  onJump: (step: StepId) => void;
}

const COLOR_GOLD = "#B68B2F";
const COLOR_INK = "#1F1A14";
const COLOR_HAIRLINE = "rgba(31, 26, 20, 0.18)";

/**
 * Editorial Stepper — newspaper Table-of-Contents treatment.
 * Horizontal row of large gold numerals over hairline ink rules.
 * No circles, no progress fill — just typographic hierarchy.
 */
export function StepperEditorial({ current, onJump }: StepperEditorialProps) {
  const reduceMotion = useReducedMotion();

  return (
    <nav
      aria-label="שלבי הסימולטור"
      className="border-y"
      style={{ borderColor: COLOR_HAIRLINE }}
    >
      <ol className="grid grid-cols-3 md:grid-cols-9 gap-0">
        {STEPS.map((s, idx) => {
          const state =
            s.id === current ? "active" : s.id < current ? "done" : "todo";
          const isLast = idx === STEPS.length - 1;
          return (
            <li
              key={s.id}
              className={`relative ${!isLast ? "md:border-l" : ""}`}
              style={{ borderColor: COLOR_HAIRLINE }}
            >
              <button
                type="button"
                onClick={() => onJump(s.id as StepId)}
                className="group flex w-full flex-col items-start gap-1 px-3 py-3 text-right transition-colors hover:bg-[rgba(182,139,47,0.06)] focus:outline-none focus:bg-[rgba(182,139,47,0.08)]"
              >
                <span
                  className="font-serif text-[44px] leading-none tracking-tight"
                  style={{
                    color:
                      state === "active"
                        ? COLOR_GOLD
                        : state === "done"
                          ? COLOR_INK
                          : "rgba(31, 26, 20, 0.32)",
                    fontFamily:
                      "'David Libre', 'Frank Ruhl Libre', Georgia, 'Times New Roman', serif",
                  }}
                >
                  {String(s.id).padStart(2, "0")}
                </span>
                <span
                  className="text-[14px] uppercase tracking-[0.18em]"
                  style={{
                    color:
                      state === "todo" ? "rgba(31, 26, 20, 0.5)" : COLOR_INK,
                    fontFeatureSettings: "'ss01' 1",
                  }}
                >
                  {s.title}
                </span>
                {state === "active" && !reduceMotion && (
                  <motion.span
                    aria-hidden
                    className="absolute bottom-0 right-0 h-[3px]"
                    style={{ backgroundColor: COLOR_GOLD }}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  />
                )}
                {state === "done" && (
                  <span
                    aria-hidden
                    className="absolute bottom-0 right-0 h-[2px] w-full"
                    style={{ backgroundColor: COLOR_INK, opacity: 0.5 }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
