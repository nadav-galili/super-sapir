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
  BookOpen,
} from "lucide-react";
import { StepperTerminal } from "@/components/promo-simulator/StepperTerminal";
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

const COLOR_INK = "#0A0A0A";
const COLOR_BONE = "#EFEFE9";
const COLOR_LIME = "#B5F23F";
const MONO_STACK = "'Fira Code', SFMono-Regular, Menlo, monospace";

// Subtle dotted-grid background for the bone canvas.
const DOTTED_GRID =
  "radial-gradient(rgba(10,10,10,0.10) 1px, transparent 1px) 0 0 / 16px 16px";

function PromoSimulatorTerminalPage() {
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
  } = usePromoSimulator(search, "/category-manager/promo-simulator-terminal");

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
        <div
          className="min-h-screen"
          style={{ backgroundColor: COLOR_BONE, backgroundImage: DOTTED_GRID }}
        >
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
        style={{
          backgroundColor: COLOR_BONE,
          backgroundImage: DOTTED_GRID,
          color: COLOR_INK,
          fontFamily: MONO_STACK,
        }}
      >
        <header
          className="border-b-2 px-4 sm:px-8 py-4 flex items-center justify-between gap-4 flex-wrap"
          style={{ borderColor: COLOR_INK, backgroundColor: COLOR_BONE }}
        >
          <div className="flex items-center gap-3 text-[14px] uppercase tracking-[0.18em]">
            <span
              className="inline-block h-3 w-3"
              style={{ backgroundColor: COLOR_LIME }}
              aria-hidden
            />
            <span>PROMO//OPERATOR · SESSION_01</span>
          </div>
          <AltStrip kind="terminal" search={search} />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6 px-4 sm:px-8 py-6 items-start">
          <aside className="lg:sticky lg:top-4 self-start">
            <StepperTerminal current={state.step} onJump={handleJump} />
          </aside>

          <main className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={state.step}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                <div className="mb-3 flex items-center gap-2 text-[12px] uppercase tracking-[0.2em]">
                  <span style={{ color: "rgba(10,10,10,0.55)" }}>
                    [{String(state.step).padStart(2, "0")}/09]
                  </span>
                  <span
                    className="inline-block h-px flex-1"
                    style={{ backgroundColor: "rgba(10,10,10,0.3)" }}
                  />
                  <span>STDOUT</span>
                </div>
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
              className="flex items-center justify-between gap-4 flex-wrap pt-4 border-t-2"
              style={{ borderColor: COLOR_INK }}
            >
              <div className="flex items-center gap-3">
                <BrutalButton
                  onClick={restart}
                  icon={<Home className="w-4 h-4" />}
                >
                  RESTART
                </BrutalButton>
                <BrutalButton
                  onClick={resetStep}
                  icon={<RotateCcw className="w-4 h-4" />}
                >
                  RESET STEP
                </BrutalButton>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-3">
                  <BrutalButton
                    onClick={goBack}
                    disabled={state.step === 1}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    PREV
                  </BrutalButton>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-disabled={nextDisabled}
                    className="inline-flex items-center gap-2 rounded-none px-5 py-2 text-[14px] uppercase tracking-[0.14em] transition-shadow disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      fontFamily: MONO_STACK,
                      backgroundColor: nextDisabled ? COLOR_BONE : COLOR_LIME,
                      color: COLOR_INK,
                      border: `2px solid ${COLOR_INK}`,
                      boxShadow: nextDisabled
                        ? "none"
                        : `4px 4px 0 ${COLOR_INK}`,
                    }}
                  >
                    {state.step === 9 ? "COMMIT" : "NEXT"}
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
                {nextDisabled && missingLabels && (
                  <div
                    className="flex items-center gap-1.5 text-[13px]"
                    role="status"
                    aria-live="polite"
                    style={{ color: "#B91C1C" }}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>STDERR · missing: {missingLabels}</span>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </PromoTaxonomyProvider>
  );
}

function BrutalButton({
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
      className="inline-flex items-center gap-2 rounded-none px-3 py-2 text-[13px] uppercase tracking-[0.12em] transition-shadow hover:enabled:shadow-[3px_3px_0_#0A0A0A] disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        fontFamily: MONO_STACK,
        backgroundColor: "white",
        color: COLOR_INK,
        border: `2px solid ${COLOR_INK}`,
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
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <Layout className="w-4 h-4" />
        DEFAULT
      </Link>
      {kind !== "editorial" && (
        <Link
          to="/category-manager/promo-simulator-editorial"
          search={search}
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] hover:bg-[rgba(182,139,47,0.06)]"
          style={{
            borderColor: "rgba(31,26,20,0.18)",
            color: "#1F1A14",
            fontFamily:
              "'David Libre', 'Frank Ruhl Libre', Georgia, 'Times New Roman', serif",
          }}
        >
          <BookOpen className="w-4 h-4" />
          עיצוב עיתונאי
        </Link>
      )}
    </div>
  );
}

export const Route = createFileRoute(
  "/category-manager/promo-simulator-terminal"
)({
  component: PromoSimulatorTerminalPage,
  validateSearch: (search: Record<string, unknown>): SimulatorSearch =>
    validateSimulatorSearch(search),
});
