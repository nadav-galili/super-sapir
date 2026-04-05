import { useMemo } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyShort } from '@/lib/format'
import { SupplierLogo } from '@/components/dashboard/SupplierLogo'
import { getTopSuppliers } from '@/data/mock-suppliers'

export function SuppliersTable() {
  const suppliers = useMemo(() => getTopSuppliers(), [])
  const maxSales = suppliers[0]?.sales ?? 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-[#F6B93B]" />
            <CardTitle className="text-lg text-[#2D3748]">10 ספקים מובילים</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[500px] text-sm">
              <thead>
                <tr className="border-b border-[#FFF0EA]">
                  <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">#</th>
                  <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">ספק</th>
                  <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">מכירות ₪</th>
                  <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">עמידה ביעד</th>
                  <th className="px-3 py-2 text-right font-medium text-[#A0AEC0]">רווח גולמי %</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((sup, i) => {
                  const targetPct = sup.targetSales > 0 ? (sup.sales / sup.targetSales) * 100 : 100
                  const hitTarget = targetPct >= 100
                  const barPct = (sup.sales / maxSales) * 100

                  return (
                    <motion.tr
                      key={sup.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-[#FFF0EA] hover:bg-[#FDF8F6] transition-colors"
                    >
                      <td className="px-3 py-2.5 text-[13px] text-[#A0AEC0] font-mono">{i + 1}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <SupplierLogo name={sup.name} />
                          <span className="font-medium text-[#2D3748] text-[13px] whitespace-nowrap">{sup.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 min-w-[120px]">
                        <span className="font-semibold font-mono text-[13px]" dir="ltr">
                          {formatCurrencyShort(sup.sales)}
                        </span>
                        <div className="mt-1 h-1.5 w-full bg-[#FFF0EA] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-[#F6B93B]"
                            initial={{ width: 0 }}
                            animate={{ width: `${barPct}%` }}
                            transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease: 'easeOut' }}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`font-semibold font-mono text-[13px] ${hitTarget ? 'text-[#2EC4D5]' : 'text-[#DC4E59]'}`}
                          dir="ltr"
                        >
                          {targetPct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="font-mono text-[13px]" dir="ltr">{sup.grossProfitPercent}%</span>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
