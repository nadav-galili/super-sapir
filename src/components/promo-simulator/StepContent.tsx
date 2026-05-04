import { StepPlaceholder } from "./StepPlaceholder";
import { Step1Brief } from "./Step1Brief";
import { Step2Goal } from "./Step2Goal";
import { Step3PromoType } from "./Step3PromoType";
import { Step4Params } from "./Step4Params";
import { Step6Decision } from "./Step6Decision";
import { Step7Implementation } from "./Step7Implementation";
// import { Step8Control } from "./Step8Control"; // disabled for pitch — see taxonomy.ts STEPS
import { Step9Documentation } from "./Step9Documentation";
import { BorderBeam } from "@/components/ui/border-beam";
import type { BriefSlice, SimulatorState } from "@/lib/promo-simulator/state";
import type { PromoMetrics } from "@/lib/promo-simulator/calc";
import { STEPS } from "@/lib/promo-simulator/taxonomy";

const SLICE_BY_STEP: Record<number, number> = {
  1: 2,
  2: 3,
  3: 3,
  4: 4,
  5: 6,
  6: 6,
  // Step 7 is now Documentation (Control was commented out).
  7: 7,
};

interface StepContentProps {
  state: SimulatorState;
  setState: (update: Partial<SimulatorState>) => void;
  metrics: PromoMetrics;
  briefErrorKeys?: ReadonlySet<keyof BriefSlice>;
  /** Wrap step 4–7 in an animated BorderBeam (default true). */
  withBeam?: boolean;
}

/**
 * Renders the active step. Shared by all three simulator variants
 * (default, editorial, terminal) so step internals stay in lockstep.
 */
export function StepContent({
  state,
  setState,
  metrics,
  briefErrorKeys,
  withBeam = true,
}: StepContentProps) {
  const stepMeta = STEPS[state.step - 1];
  const sliceNum = SLICE_BY_STEP[state.step];
  const showBeam = withBeam && state.step >= 4 && state.step <= 6;

  const raw =
    state.step === 1 ? (
      <Step1Brief
        brief={{
          group: state.group,
          department: state.department,
          subcategory: state.subcategory,
          supplier: state.supplier,
          series: state.series,
          category: state.category,
          segment: state.segment,
          product: state.product,
          salesArena: state.salesArena,
          retailer: state.retailer,
          startDate: state.startDate,
          durationWeeks: state.durationWeeks,
          categoryManager: state.categoryManager,
        }}
        onChange={setState}
        errorKeys={briefErrorKeys}
      />
    ) : state.step === 2 ? (
      <Step2Goal goal={state.goal} onChange={setState} />
    ) : state.step === 3 ? (
      <Step3PromoType
        goal={state.goal}
        promoType={state.promoType}
        onChange={setState}
      />
    ) : state.step === 4 ? (
      <Step4Params state={state} metrics={metrics} onChange={setState} />
    ) : state.step === 5 ? (
      <Step6Decision state={state} metrics={metrics} onChange={setState} />
    ) : state.step === 6 ? (
      <Step7Implementation
        impl={{
          signage: state.signage,
          shelf: state.shelf,
          training: state.training,
          cashierBrief: state.cashierBrief,
        }}
        onChange={setState}
      />
    ) : state.step === 7 ? (
      // Step 7 is now Documentation (Control is commented out for the
      // pitch). To restore Control: re-add `{ id: 7, title: "בקרה" }` in
      // taxonomy.ts STEPS, bump Documentation back to id 8, restore the
      // Step8Control branch (see git history), and update the goNext
      // max bound in usePromoSimulator.ts.
      <Step9Documentation state={state} metrics={metrics} onChange={setState} />
    ) : (
      <StepPlaceholder
        stepNumber={stepMeta.id}
        title={stepMeta.title}
        sliceNumber={sliceNum}
      />
    );

  if (!showBeam) return raw;
  return (
    <div className="relative rounded-[16px]">
      <BorderBeam
        size={220}
        duration={10}
        borderWidth={1.5}
        colorFrom="#DC4E59"
        colorTo="#E8777F"
      />
      {raw}
    </div>
  );
}
