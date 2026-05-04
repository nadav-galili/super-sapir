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
import { StepContent } from "@/components/promo-simulator/StepContent";
import { SuccessScreen } from "@/components/promo-simulator/SuccessScreen";
import { LiveKPIPanel } from "@/components/promo-simulator/LiveKPIPanel";
import { AINarrative } from "@/components/promo-simulator/AINarrative";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import {
  validateSimulatorSearch,
  type BriefSlice,
  type SimulatorSearch,
} from "@/lib/promo-simulator/state";
import { type StepId } from "@/lib/promo-simulator/taxonomy";
import { usePromoSimulator } from "@/hooks/usePromoSimulator";
import {
  PromoTaxonomyProvider,
  DEFAULT_PROMO_TAXONOMY,
} from "@/contexts/PromoTaxonomyContext";

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
    if (state.step === 7) {
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

  // Steps 4–6 each surface their own decision-supporting context inline
  // (verdict strip on 4, evidence panel on 5, readiness pill on 6) — no
  // need for a duplicate "KPI חי" side rail. Disabled across the wizard.
  const showLiveKpi = false;
  const showNarrative = state.step >= 2 && state.step <= 4;

  const stepContent = (
    <StepContent
      state={state}
      setState={setState}
      metrics={metrics}
      briefErrorKeys={briefErrorKeys}
    />
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

  const nextDisabled = state.step < 8 && !currentStepValid;
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
                        className="inline-flex items-center gap-2 rounded-[10px] border border-[#E7E0D8] bg-white px-5 py-2.5 text-[16px] font-medium text-[#788390] cursor-not-allowed opacity-60"
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
                        {state.step === 7 ? "סיום" : "המשך"}
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
