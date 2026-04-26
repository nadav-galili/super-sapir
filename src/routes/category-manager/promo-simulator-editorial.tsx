import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Home,
  AlertCircle,
  Layout,
  Terminal,
} from "lucide-react";
import { StepperEditorial } from "@/components/promo-simulator/StepperEditorial";
import { StepContent } from "@/components/promo-simulator/StepContent";
import { SuccessScreen } from "@/components/promo-simulator/SuccessScreen";
import { LiveKPIPanel } from "@/components/promo-simulator/LiveKPIPanel";
import { AINarrative } from "@/components/promo-simulator/AINarrative";
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

const COLOR_GOLD = "#B68B2F";
const COLOR_INK = "#1F1A14";
const COLOR_PAPER = "#F4ECD8";
const COLOR_HAIRLINE = "rgba(31, 26, 20, 0.18)";
const SERIF_STACK =
  "'David Libre', 'Frank Ruhl Libre', Georgia, 'Times New Roman', serif";

function PromoSimulatorEditorialPage() {
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
  } = usePromoSimulator(search, "/category-manager/promo-simulator-editorial");

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
    if (step > state.step && !currentStepValid) setAttempted(true);
    jumpToStep(step);
  };

  const showLiveKpi = state.step >= 4 && state.step <= 7;
  const showNarrative = state.step >= 2 && state.step <= 5;

  if (state.completed) {
    return (
      <PromoTaxonomyProvider value={DEFAULT_PROMO_TAXONOMY}>
        <div className="min-h-screen" style={{ backgroundColor: COLOR_PAPER }}>
          <SuccessScreen state={state} onRestart={restart} />
        </div>
      </PromoTaxonomyProvider>
    );
  }

  const nextDisabled = state.step < 9 && !currentStepValid;
  const missingLabels = missingFields.map((f) => f.label).join(", ");

  return (
    <PromoTaxonomyProvider value={DEFAULT_PROMO_TAXONOMY}>
      <div
        className="min-h-screen"
        style={{ backgroundColor: COLOR_PAPER, color: COLOR_INK }}
      >
        {/* Masthead */}
        <header className="border-b" style={{ borderColor: COLOR_HAIRLINE }}>
          <div className="px-6 sm:px-10 py-6 flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div
                className="text-[12px] uppercase tracking-[0.32em]"
                style={{ color: COLOR_GOLD }}
              >
                Vol. I · גליון מבצעים
              </div>
              <h1
                className="mt-1 text-[44px] leading-none"
                style={{ fontFamily: SERIF_STACK, color: COLOR_INK }}
              >
                סימולטור המבצעים — מהדורה עיתונאית
              </h1>
              <p className="mt-2 text-[15px] text-[rgba(31,26,20,0.62)]">
                תשעה פרקים מהבריף עד התיעוד — כתבה אחת, החלטה אחת.
              </p>
            </div>
            <AltStrip kind="editorial" search={search} />
          </div>
          <StepperEditorial current={state.step} onJump={handleJump} />
        </header>

        <main className="px-6 sm:px-10 py-8 space-y-8 max-w-[1200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ fontFamily: SERIF_STACK }}
            >
              {showLiveKpi ? (
                <div className="grid grid-cols-1 xl:grid-cols-[1fr,320px] gap-6 items-start">
                  <div className="space-y-6">
                    <StepContent
                      state={state}
                      setState={setState}
                      metrics={metrics}
                      briefErrorKeys={briefErrorKeys}
                      withBeam={false}
                    />
                    {showNarrative && <AINarrative paragraphs={narrative} />}
                  </div>
                  <LiveKPIPanel metrics={metrics} />
                </div>
              ) : (
                <div className="space-y-6">
                  <StepContent
                    state={state}
                    setState={setState}
                    metrics={metrics}
                    briefErrorKeys={briefErrorKeys}
                    withBeam={false}
                  />
                  {showNarrative && <AINarrative paragraphs={narrative} />}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div
            className="flex items-center justify-between gap-4 flex-wrap pt-6 border-t"
            style={{ borderColor: COLOR_HAIRLINE }}
          >
            <div className="flex items-center gap-3">
              <PillButton onClick={restart} icon={<Home className="w-4 h-4" />}>
                לפתיחה
              </PillButton>
              <PillButton
                onClick={resetStep}
                icon={<RotateCcw className="w-4 h-4" />}
              >
                איפוס פרק
              </PillButton>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3">
                <PillButton
                  onClick={goBack}
                  disabled={state.step === 1}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  הקודם
                </PillButton>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-disabled={nextDisabled}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[15px] uppercase tracking-[0.16em] transition-colors disabled:opacity-50"
                  style={{
                    fontFamily: SERIF_STACK,
                    backgroundColor: nextDisabled ? "transparent" : COLOR_INK,
                    color: nextDisabled ? "rgba(31,26,20,0.45)" : COLOR_PAPER,
                    border: `1.5px solid ${COLOR_INK}`,
                    cursor: nextDisabled ? "not-allowed" : "pointer",
                  }}
                >
                  {state.step === 9 ? "סיום" : "הבא"}
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
              {nextDisabled && missingLabels && (
                <div
                  className="flex items-center gap-1.5 text-[14px]"
                  role="status"
                  aria-live="polite"
                  style={{ color: "#B91C1C" }}
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>חסר: {missingLabels}</span>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </PromoTaxonomyProvider>
  );
}

function PillButton({
  children,
  onClick,
  disabled,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[14px] uppercase tracking-[0.14em] transition-colors hover:bg-[rgba(31,26,20,0.04)] disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        fontFamily: SERIF_STACK,
        color: COLOR_INK,
        border: `1px solid ${COLOR_HAIRLINE}`,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function AltStrip({
  kind,
  search,
}: {
  kind: "editorial" | "terminal";
  search: SimulatorSearch;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Link
        to="/category-manager/promo-simulator"
        search={search}
        className="inline-flex items-center gap-2 rounded-[10px] border border-[#E7E0D8] bg-white px-3 py-1.5 text-[13px] font-medium text-[#4A5568] hover:border-[#DC4E59] hover:text-[#DC4E59]"
      >
        <Layout className="w-4 h-4" />
        ברירת מחדל
      </Link>
      {kind !== "terminal" && (
        <Link
          to="/category-manager/promo-simulator-terminal"
          search={search}
          className="inline-flex items-center gap-2 rounded-none border-2 border-[#0A0A0A] bg-white px-3 py-1.5 text-[13px] font-mono text-[#0A0A0A] hover:shadow-[3px_3px_0_#0A0A0A] transition-shadow"
        >
          <Terminal className="w-4 h-4" />
          TERMINAL
        </Link>
      )}
    </div>
  );
}

export const Route = createFileRoute(
  "/category-manager/promo-simulator-editorial"
)({
  component: PromoSimulatorEditorialPage,
  validateSearch: (search: Record<string, unknown>): SimulatorSearch =>
    validateSimulatorSearch(search),
});
