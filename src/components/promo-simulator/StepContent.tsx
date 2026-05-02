import { StepPlaceholder } from "./StepPlaceholder";
import { Step1Brief } from "./Step1Brief";
import { Step2Goal } from "./Step2Goal";
import { Step3PromoType } from "./Step3PromoType";
import { Step4Terms } from "./Step4Terms";
import { Step5Forecast } from "./Step5Forecast";
import { Step6Analysis } from "./Step6Analysis";
import { Step7Implementation } from "./Step7Implementation";
import { Step8Control } from "./Step8Control";
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
  5: 5,
  6: 6,
  7: 6,
  8: 7,
  9: 7,
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
  const showBeam = withBeam && state.step >= 4 && state.step <= 7;

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
      <Step4Terms
        terms={{
          promoType: state.promoType,
          conditionText: state.conditionText,
          benefitText: state.benefitText,
          discountPct: state.discountPct,
          unitPrice: state.unitPrice,
          unitCost: state.unitCost,
        }}
        metrics={metrics}
        onChange={setState}
      />
    ) : state.step === 5 ? (
      <Step5Forecast
        forecast={{
          baseUnits: state.baseUnits,
          unitPrice: state.unitPrice,
          unitCost: state.unitCost,
          upliftPct: state.upliftPct,
          stockUnits: state.stockUnits,
          discountPct: state.discountPct,
          durationWeeks: state.durationWeeks,
        }}
        metrics={metrics}
        onChange={setState}
      />
    ) : state.step === 6 ? (
      <Step6Analysis
        analysisNote={state.analysisNote}
        metrics={metrics}
        onChange={setState}
      />
    ) : state.step === 7 ? (
      <Step7Implementation
        impl={{
          signage: state.signage,
          shelf: state.shelf,
          training: state.training,
          cashierBrief: state.cashierBrief,
        }}
        onChange={setState}
      />
    ) : state.step === 8 ? (
      <Step8Control
        control={{
          controlPrice: state.controlPrice,
          controlStock: state.controlStock,
          controlDisplay: state.controlDisplay,
        }}
        metrics={metrics}
        readinessCount={
          [
            state.signage,
            state.shelf,
            state.training,
            state.cashierBrief,
          ].filter(Boolean).length
        }
        onChange={setState}
      />
    ) : state.step === 9 ? (
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
