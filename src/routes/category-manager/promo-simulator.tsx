import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Home,
  AlertCircle,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Stepper } from "@/components/promo-simulator/Stepper";
import { StepPlaceholder } from "@/components/promo-simulator/StepPlaceholder";
import { Step1Brief } from "@/components/promo-simulator/Step1Brief";
import { Step2Goal } from "@/components/promo-simulator/Step2Goal";
import { Step3PromoType } from "@/components/promo-simulator/Step3PromoType";
import { Step4Terms } from "@/components/promo-simulator/Step4Terms";
import { Step5Forecast } from "@/components/promo-simulator/Step5Forecast";
import { Step6Analysis } from "@/components/promo-simulator/Step6Analysis";
import { Step7Implementation } from "@/components/promo-simulator/Step7Implementation";
import { Step8Control } from "@/components/promo-simulator/Step8Control";
import { Step9Documentation } from "@/components/promo-simulator/Step9Documentation";
import { SuccessScreen } from "@/components/promo-simulator/SuccessScreen";
import { LiveKPIPanel } from "@/components/promo-simulator/LiveKPIPanel";
import { AINarrative } from "@/components/promo-simulator/AINarrative";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import {
  validateSimulatorSearch,
  type BriefSlice,
  type SimulatorSearch,
} from "@/lib/promo-simulator/state";
import { STEPS, type StepId } from "@/lib/promo-simulator/taxonomy";
import { usePromoSimulator } from "@/hooks/usePromoSimulator";
import {
  PromoTaxonomyProvider,
  DEFAULT_PROMO_TAXONOMY,
} from "@/contexts/PromoTaxonomyContext";

const SLICE_BY_STEP: Record<StepId, number> = {
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

function PromoSimulatorPage() {
  const search = Route.useSearch();
  const {
    state,
    setState,
    metrics,
    narrative,
    jumpToStep,
    goBack,
    goNext,
    restart,
    resetStep,
    finish,
    missingFields,
    currentStepValid,
  } = usePromoSimulator(search);

  // "Attempted advance" reveals per-field error rings. Reset on step change
  // so each new step starts with a clean slate. Uses React's recommended
  // "store previous value during render" pattern instead of an effect.
  const [attempted, setAttempted] = useState(false);
  const [prevStep, setPrevStep] = useState(state.step);
  if (prevStep !== state.step) {
    setPrevStep(state.step);
    setAttempted(false);
  }

  const briefErrorKeys =
    attempted && state.step === 1
      ? new Set(missingFields.map((f) => f.key as keyof BriefSlice))
      : undefined;

  const handleNext = () => {
    if (state.step === 9) {
      finish();
      return;
    }
    if (!currentStepValid) {
      setAttempted(true);
      return;
    }
    goNext();
  };

  const handleJump = (step: StepId) => {
    // If the jump is blocked (forward past earliest incomplete), reveal
    // the current step's field errors so the user understands why.
    if (step > state.step && !currentStepValid) {
      setAttempted(true);
    }
    jumpToStep(step);
  };

  const stepMeta = STEPS[state.step - 1];
  const sliceNum = SLICE_BY_STEP[state.step];
  const showLiveKpi = state.step >= 4 && state.step <= 7;
  const showNarrative = state.step >= 2 && state.step <= 5;
  const showStepBeam = state.step >= 4 && state.step <= 7;

  const rawStepContent =
    state.step === 1 ? (
      <Step1Brief
        brief={{
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

  const stepContent = showStepBeam ? (
    <div className="relative rounded-[16px]">
      <BorderBeam
        size={220}
        duration={10}
        borderWidth={1.5}
        colorFrom="#DC4E59"
        colorTo="#E8777F"
      />
      {rawStepContent}
    </div>
  ) : (
    rawStepContent
  );

  if (state.completed) {
    return (
      <PromoTaxonomyProvider value={DEFAULT_PROMO_TAXONOMY}>
        <div className="min-h-screen bg-[#FAF8F5]">
          <PageContainer>
            <SuccessScreen state={state} onRestart={restart} />
          </PageContainer>
        </div>
      </PromoTaxonomyProvider>
    );
  }

  const nextDisabled = state.step < 9 && !currentStepValid;
  const missingLabels = missingFields.map((f) => f.label).join(", ");

  return (
    <PromoTaxonomyProvider value={DEFAULT_PROMO_TAXONOMY}>
      <div className="min-h-screen bg-[#FAF8F5]">
        <PageContainer>
          <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-6 items-start">
            <aside className="lg:sticky lg:top-4 self-start">
              <Stepper current={state.step} onJump={handleJump} />
            </aside>

            <div className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={state.step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {showLiveKpi ? (
                    <div className="grid grid-cols-1 xl:grid-cols-[1fr,320px] gap-4 items-start">
                      <div className="space-y-4">
                        {stepContent}
                        {showNarrative && (
                          <AINarrative paragraphs={narrative} />
                        )}
                      </div>
                      <LiveKPIPanel metrics={metrics} />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stepContent}
                      {showNarrative && <AINarrative paragraphs={narrative} />}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={restart}
                    className="inline-flex items-center gap-2 rounded-[10px] border border-[#E7E0D8] bg-white px-4 py-2 text-[16px] font-medium text-[#4A5568] transition-colors hover:bg-[#FAF8F5]"
                  >
                    <Home className="w-4 h-4" />
                    לתחילת הסימולטור
                  </button>
                  <button
                    type="button"
                    onClick={resetStep}
                    className="inline-flex items-center gap-2 rounded-[10px] border border-[#E7E0D8] bg-white px-4 py-2 text-[16px] font-medium text-[#4A5568] transition-colors hover:bg-[#FAF8F5]"
                  >
                    <RotateCcw className="w-4 h-4" />
                    איפוס השלב
                  </button>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={goBack}
                      disabled={state.step === 1}
                      className="inline-flex items-center gap-2 rounded-[10px] border border-[#E7E0D8] bg-white px-5 py-2.5 text-[16px] font-medium text-[#4A5568] transition-colors hover:bg-[#FAF8F5] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ArrowRight className="w-4 h-4" />
                      חזרה
                    </button>
                    {nextDisabled ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        aria-disabled="true"
                        className="inline-flex items-center gap-2 rounded-[10px] border border-[#E7E0D8] bg-white px-5 py-2.5 text-[16px] font-medium text-[#A0AEC0] cursor-not-allowed opacity-60"
                      >
                        המשך
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    ) : (
                      <ShimmerButton
                        type="button"
                        onClick={handleNext}
                        shimmerColor="rgba(255,255,255,0.35)"
                      >
                        {state.step === 9 ? "סיום" : "המשך"}
                        <ArrowLeft className="w-4 h-4" />
                      </ShimmerButton>
                    )}
                  </div>
                  {nextDisabled && missingLabels && (
                    <div
                      className="flex items-center gap-1.5 text-[15px] text-[#F43F5E]"
                      role="status"
                      aria-live="polite"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>חסר למילוי: {missingLabels}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </div>
    </PromoTaxonomyProvider>
  );
}

export const Route = createFileRoute("/category-manager/promo-simulator")({
  component: PromoSimulatorPage,
  validateSearch: (search: Record<string, unknown>): SimulatorSearch =>
    validateSimulatorSearch(search),
});
