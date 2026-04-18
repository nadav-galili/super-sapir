import { useMemo, useCallback } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { ArrowRight, ArrowLeft, RotateCcw, Home } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Stepper } from '@/components/promo-simulator/Stepper'
import { StepPlaceholder } from '@/components/promo-simulator/StepPlaceholder'
import { Step1Brief } from '@/components/promo-simulator/Step1Brief'
import { Step2Goal } from '@/components/promo-simulator/Step2Goal'
import { Step3PromoType } from '@/components/promo-simulator/Step3PromoType'
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

  return (
    <div className="min-h-screen bg-[#FDF8F6]">
      <Stepper current={state.step} onJump={jumpToStep} />
      <PageContainer>
        <motion.div
          key={state.step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {state.step === 1 ? (
            <Step1Brief state={state} onChange={setState} />
          ) : state.step === 2 ? (
            <Step2Goal state={state} onChange={setState} />
          ) : state.step === 3 ? (
            <Step3PromoType state={state} onChange={setState} />
          ) : (
            <StepPlaceholder
              stepNumber={stepMeta.id}
              title={stepMeta.title}
              sliceNumber={sliceNum}
            />
          )}
        </motion.div>

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
            <button
              type="button"
              onClick={goNext}
              disabled={state.step === 9}
              className="inline-flex items-center gap-2 rounded-[10px] px-6 py-2.5 text-[16px] font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #DC4E59, #E8777F)',
              }}
            >
              המשך
              <ArrowLeft className="w-4 h-4" />
            </button>
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
