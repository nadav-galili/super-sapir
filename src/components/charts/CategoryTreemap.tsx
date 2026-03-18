import { Treemap, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'motion/react'
import { useNavigate } from '@tanstack/react-router'
import { formatCurrencyShort } from '@/lib/format'
import { getGrowthColor } from '@/lib/colors'
import type { CategorySummary } from '@/data/mock-categories'

interface CategoryTreemapProps {
  data: CategorySummary[]
}

interface TreemapContentProps {
  x: number
  y: number
  width: number
  height: number
  name: string
  yoyChange: number
  id: string
}

function CustomContent(props: TreemapContentProps) {
  const { x, y, width, height, name, yoyChange, id } = props
  const navigate = useNavigate()

  if (width < 40 || height < 30) return null

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={getGrowthColor(yoyChange)}
        stroke="#fff"
        strokeWidth={2}
        rx={4}
        style={{ cursor: 'pointer' }}
        onClick={() => navigate({ to: '/category-manager/$categoryId', params: { categoryId: id } })}
      />
      {width > 60 && height > 40 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 6}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
            fontWeight="bold"
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 12}
            textAnchor="middle"
            fill="#fff"
            fontSize={10}
            opacity={0.8}
          >
            {yoyChange > 0 ? '+' : ''}{yoyChange}%
          </text>
        </>
      )}
    </g>
  )
}

export function CategoryTreemap({ data }: CategoryTreemapProps) {
  const treemapData = data.map(d => ({
    name: d.name,
    size: d.sales,
    yoyChange: d.yoyChange,
    id: d.id,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">מפת קטגוריות - גודל = נתח מכירות, צבע = צמיחה שנתית</CardTitle>
        </CardHeader>
        <CardContent>
          <div dir="ltr" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                content={<CustomContent x={0} y={0} width={0} height={0} name="" yoyChange={0} id="" />}
                animationDuration={1000}
              >
                <Tooltip
                  formatter={(value) => [formatCurrencyShort(value as number), 'מכירות']}
                  contentStyle={{ direction: 'rtl', borderRadius: '8px' }}
                />
              </Treemap>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
