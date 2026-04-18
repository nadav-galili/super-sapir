import { useMemo, useCallback } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, ArrowLeft, RotateCcw, Home } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Stepper } from '@/components/promo-simulator/Stepper'
import { StepPlaceholder } from '@/components/promo-simulator/StepPlaceholder'
import { Step1Brief } from '@/components/promo-simulator/Step1Brief'
import { Step2Goal } from '@/components/promo-simulator/Step2Goal'
import { Step3PromoType } from '@/components/promo-simulator/Step3PromoType'
import { Step4Terms } from '@/components/promo-simulator/Step4Terms'
import { Step5Forecast } from '@/components/promo-simulator/Step5Forecast'
import { Step6Implementation } from '@/components/promo-simulator/Step6Implementation'
import { Step7Control } from '@/components/promo-simulator/Step7Control'
import { Step8Analysis } from '@/components/promo-simulator/Step8Analysis'
import { Step9Documentation } from '@/components/promo-simulator/Step9Documentation'
import { SuccessScreen } from '@/components/promo-simulator/SuccessScreen'
import { LiveKPIPanel } from '@/components/promo-simulator/LiveKPIPanel'
import { AINarrative } from '@/components/promo-simulator/AINarrative'
import { BorderBeam } from '@/components/ui/border-beam'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import {
  createDefaultState,
  decodeState,
  encodeState,
  validateSimulatorSearch,
  type SimulatorSearch,
  type SimulatorState,
} from '@/lib/promo-simulator/state'
import { STEPS, type StepId } from '@/lib/promo-simulator/taxonomy'
import { getCategorySummaries } from '@/data/mock-categories'

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
}

function PromoSimulatorPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()

  const defaults = useMemo(() => {
    const cats = getCategorySummaries()
    const topCategory = cats.sort((a, b) => b.sales - a.sales)[0]?.name ?? ''
    return createDefaultState({ defaultCategory: topCategory })
  }, [])

  const state = useMemo(() => decodeState(search, defaults), [search, defaults])

  const setState = useCallback(
    (update: Partial<SimulatorState>) => {
      const next = { ...state, ...update }
      const params = encodeState(next, defaults)
      navigate({
        to: '/category-manager/promo-simulator',
        search: params,
        replace: true,
      })
    },
    [state, defaults, navigate],
  )

  const jumpToStep = useCallback(
    (step: StepId) => {
      setState({ step })
    },
    [setState],
  )

  const goBack = useCallback(() => {
    if (state.step > 1) setState({ step: (state.step - 1) as StepId })
  }, [state.step, setState])

  const goNext = useCallback(() => {
    if (state.step < 9) setState({ step: (state.step + 1) as StepId })
  }, [state.step, setState])

  const restart = useCallback(() => {
    navigate({
      to: '/category-manager/promo-simulator',
      search: {},
      replace: true,
    })
  }, [navigate])

  const finish = useCallback(() => {
    setState({ completed: true })
  }, [setState])

  const resetStep = useCallback(() => {
    const fresh = createDefaultState({ defaultCategory: defaults.category })
    const keep: Partial<SimulatorState> = { step: state.step }
    // Reset only the fields scoped to the current step. We reset all fields
    // except step and anything the user hasn't reached yet — safe default
    // behavior is to replace the entire state with defaults, preserving step.
    setState({ ...fresh, ...keep })
  }, [state.step, defaults.category, setState])

  const stepMeta = STEPS[state.step - 1]
  const sliceNum = SLICE_BY_STEP[state.step]
  const showLiveKpi = state.step >= 4 && state.step <= 7
  const showNarrative = state.step >= 2 && state.step <= 5
  const showStepBeam = state.step >= 4 && state.step <= 7

  const rawStepContent =
    state.step === 1 ? (
      <Step1Brief state={state} onChange={setState} />
    ) : state.step === 2 ? (
      <Step2Goal state={state} onChange={setState} />
    ) : state.step === 3 ? (
      <Step3PromoType state={state} onChange={setState} />
    ) : state.step === 4 ? (
      <Step4Terms state={state} onChange={setState} />
    ) : state.step === 5 ? (
      <Step5Forecast state={state} onChange={setState} />
    ) : state.step === 6 ? (
      <Step6Implementation state={state} onChange={setState} />
    ) : state.step === 7 ? (
      <Step7Control state={state} onChange={setState} />
    ) : state.step === 8 ? (
      <Step8Analysis state={state} onChange={setState} />
    ) : state.step === 9 ? (
      <Step9Documentation state={state} onChange={setState} />
    ) : (
      <StepPlaceholder
        stepNumber={stepMeta.id}
        title={stepMeta.title}
        sliceNumber={sliceNum}
      />
    )

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
  )

  if (state.completed) {
    return (
      <div className="min-h-screen bg-[#FDF8F6]">
        <PageContainer>
          <SuccessScreen state={state} onRestart={restart} />
        </PageContainer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDF8F6]">
      <Stepper current={state.step} onJump={jumpToStep} />
      <PageContainer>
        <AnimatePresence mode="wait">
          <motion.div
            key={state.step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {showLiveKpi ? (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-4 items-start">
                <div className="space-y-4">
                  {stepContent}
                  {showNarrative && <AINarrative state={state} />}
                </div>
                <LiveKPIPanel state={state} />
              </div>
            ) : (
              <div className="space-y-4">
                {stepContent}
                {showNarrative && <AINarrative state={state} />}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-2 rounded-[10px] border border-[#FFE8DE] bg-white px-4 py-2 text-[16px] font-medium text-[#4A5568] transition-colors hover:bg-[#FDF8F6]"
            >
              <Home className="w-4 h-4" />
              לתחילת הסימולטור
            </button>
            <button
              type="button"
              onClick={resetStep}
              className="inline-flex items-center gap-2 rounded-[10px] border border-[#FFE8DE] bg-white px-4 py-2 text-[16px] font-medium text-[#4A5568] transition-colors hover:bg-[#FDF8F6]"
            >
              <RotateCcw className="w-4 h-4" />
              איפוס השלב
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goBack}
              disabled={state.step === 1}
              className="inline-flex items-center gap-2 rounded-[10px] border border-[#FFE8DE] bg-white px-5 py-2.5 text-[16px] font-medium text-[#4A5568] transition-colors hover:bg-[#FDF8F6] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-4 h-4" />
              חזרה
            </button>
            <ShimmerButton
              type="button"
              onClick={state.step === 9 ? finish : goNext}
              shimmerColor="rgba(255,255,255,0.35)"
            >
              {state.step === 9 ? 'סיום' : 'המשך'}
              <ArrowLeft className="w-4 h-4" />
            </ShimmerButton>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}

export const Route = createFileRoute('/category-manager/promo-simulator')({
  component: PromoSimulatorPage,
  validateSearch: (search: Record<string, unknown>): SimulatorSearch =>
    validateSimulatorSearch(search),
})
