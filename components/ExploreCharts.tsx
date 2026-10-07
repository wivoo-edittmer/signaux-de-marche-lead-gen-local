"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import { useI18n } from '@/lib/i18n'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChartSignal {
  zone_code: string
  zone_name: string
  zone_type: string
  naf_code: string
  naf_name: string
  time_period: string
  total_companies: number
  new_companies: number
  closed_companies: number
  net_growth: number
  growth_rate: number
  creation_rate: number
  potential_score: number
  potential_grade: string
}

export type FilterType = 'zone' | 'sector' | 'period' | 'grade'

export interface ChartFilterEvent {
  type: FilterType
  value: string
  label: string
}

interface ChartCardProps {
  title: string
  description: string
  children: React.ReactNode
  hasData: boolean
}

// ─── Colors (Mistral Charter) ───────────────────────────────────────────────

const BRAND_PRIMARY = '#FF7000'
const BRAND_LIGHT = '#F5D90A'
const BRAND_MEDIUM = '#FAA42B'
const BRAND_DARK = '#FF9E00'
const SUCCESS_700 = '#16A34A'
const SUCCESS_500 = '#22C55E'
const GRAY_500 = '#6B7280'
const GRAY_300 = '#D1D5DB'
const GRAY_200 = '#E5E7EB'

const GRADE_COLORS: Record<string, string> = {
  A: SUCCESS_700,
  B: SUCCESS_500,
  C: GRAY_500,
  D: BRAND_DARK,
  E: BRAND_PRIMARY,
}

// ─── Chart Card Wrapper ─────────────────────────────────────────────────────

function ChartCard({ title, description, children, hasData }: ChartCardProps) {
  const { t } = useI18n()

  return (
    <div className="bg-white rounded-xl shadow-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      {hasData ? (
        <div className="h-[260px]">{children}</div>
      ) : (
        <div className="h-[260px] flex items-center justify-center">
          <p className="text-sm text-gray-400">{t('explore_chart_no_data')}</p>
        </div>
      )}
    </div>
  )
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 text-sm">
      {label && <div className="font-semibold text-gray-900 mb-1">{label}</div>}
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color || entry.fill }}
          ></span>
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-semibold text-gray-900">
            {formatter ? formatter(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── 1. Bar Chart: Potential Score by Zone ──────────────────────────────────

interface PotentialByZoneProps {
  data: { zone_code: string; zone_name: string; avgScore: number; count: number }[]
  onFilter: (event: ChartFilterEvent) => void
  selectedZone: string
}

export function PotentialByZoneChart({ data, onFilter, selectedZone }: PotentialByZoneProps) {
  const { t } = useI18n()

  const chartData = data.slice(0, 10).map((d) => ({
    ...d,
    shortName: d.zone_name.length > 14 ? d.zone_name.substring(0, 14) + '…' : d.zone_name,
  }))

  return (
    <ChartCard
      title={t('explore_chart_potential_by_zone')}
      description={t('explore_chart_potential_by_zone_desc')}
      hasData={chartData.length > 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
          onClick={(state: any) => {
            if (state?.activePayload?.[0]?.payload) {
              const d = state.activePayload[0].payload
              onFilter({ type: 'zone', value: d.zone_code, label: d.zone_name })
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={GRAY_200} vertical={false} />
          <XAxis
            dataKey="shortName"
            tick={{ fontSize: 11, fill: GRAY_500 }}
            axisLine={{ stroke: GRAY_200 }}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis
            tick={{ fontSize: 11, fill: GRAY_500 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip
            content={<CustomTooltip formatter={(v: number) => `${Math.round(v)}/100`} />}
            cursor={{ fill: 'rgba(255, 112, 0, 0.05)' }}
          />
          <Bar
            dataKey="avgScore"
            name={t('explore_col_score')}
            radius={[4, 4, 0, 0]}
            cursor="pointer"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.zone_code === selectedZone ? BRAND_PRIMARY : BRAND_MEDIUM}
                stroke={entry.zone_code === selectedZone ? BRAND_PRIMARY : 'none'}
                strokeWidth={entry.zone_code === selectedZone ? 2 : 0}
              />
            ))}
            <LabelList
              dataKey="avgScore"
              position="top"
              formatter={(v: any) => Math.round(Number(v))}
              style={{ fontSize: 10, fill: GRAY_500, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ─── 2. Line Chart: Growth Rate Trend ───────────────────────────────────────

interface GrowthTrendProps {
  data: { period: string; avgGrowth: number; totalNew: number; totalClosed: number }[]
  onFilter: (event: ChartFilterEvent) => void
  selectedPeriod: string
}

export function GrowthTrendChart({ data, onFilter, selectedPeriod }: GrowthTrendProps) {
  const { t, locale } = useI18n()

  const formatPeriodLabel = (period: string) => {
    const match = period.match(/^(\d{4})-Q([1-4])$/)
    if (match) {
      const qKey = `explore_period_q${match[2]}` as any
      return `${match[1]} ${t(qKey)}`
    }
    return period
  }

  const chartData = data.map((d) => ({
    ...d,
    label: formatPeriodLabel(d.period),
  }))

  return (
    <ChartCard
      title={t('explore_chart_growth_trend')}
      description={t('explore_chart_growth_trend_desc')}
      hasData={chartData.length > 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
          onClick={(state: any) => {
            if (state?.activePayload?.[0]?.payload) {
              const d = state.activePayload[0].payload
              onFilter({ type: 'period', value: d.period, label: d.label })
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={GRAY_200} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: GRAY_500 }}
            axisLine={{ stroke: GRAY_200 }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: GRAY_500 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            content={<CustomTooltip formatter={(v: number) => `${v}%`} />}
            cursor={{ stroke: BRAND_PRIMARY, strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Line
            type="monotone"
            dataKey="avgGrowth"
            name={t('explore_col_growth')}
            stroke={BRAND_PRIMARY}
            strokeWidth={2.5}
            dot={(props: any) => {
              const isSelected = props.payload.period === selectedPeriod
              return (
                <circle
                  cx={props.cx}
                  cy={props.cy}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? BRAND_PRIMARY : '#fff'}
                  stroke={BRAND_PRIMARY}
                  strokeWidth={2}
                  style={{ cursor: 'pointer' }}
                />
              )
            }}
            activeDot={{ r: 6, fill: BRAND_PRIMARY, stroke: '#fff', strokeWidth: 2, cursor: 'pointer' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ─── 3. Donut Chart: Grade Distribution ─────────────────────────────────────

interface GradeDistributionProps {
  data: { grade: string; count: number }[]
  onFilter: (event: ChartFilterEvent) => void
  selectedGrade: string
}

export function GradeDistributionChart({ data, onFilter, selectedGrade }: GradeDistributionProps) {
  const { t, locale } = useI18n()

  const total = data.reduce((sum, d) => sum + d.count, 0)

  const chartData = data.map((d) => ({
    ...d,
    name: `${t('explore_grade')} ${d.grade}`,
    value: d.count,
    percentage: total > 0 ? Math.round((d.count / total) * 100) : 0,
  }))

  return (
    <ChartCard
      title={t('explore_chart_grade_distribution')}
      description={t('explore_chart_grade_distribution_desc')}
      hasData={chartData.length > 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            cursor="pointer"
            onClick={(entry: any) => {
              onFilter({ type: 'grade', value: entry.grade, label: `${t('explore_grade')} ${entry.grade}` })
            }}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={GRADE_COLORS[entry.grade] || GRAY_500}
                stroke={entry.grade === selectedGrade ? '#fff' : 'none'}
                strokeWidth={entry.grade === selectedGrade ? 3 : 0}
                style={{ opacity: selectedGrade && entry.grade !== selectedGrade ? 0.3 : 1 }}
              />
            ))}
            <LabelList
              formatter={(entry: any) => `${entry.grade} (${entry.percentage}%)`}
              style={{ fontSize: 11, fontWeight: 600, fill: '#374151' }}
              position="outside"
            />
          </Pie>
          <Tooltip
            content={({ active, payload }: any) => {
              if (!active || !payload?.[0]) return null
              const d = payload[0].payload
              return (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: GRADE_COLORS[d.grade] }}
                    ></span>
                    <span className="font-semibold text-gray-900">{d.name}</span>
                  </div>
                  <div className="text-gray-600 mt-1">
                    {d.value} {locale === 'fr' ? 'marchés' : 'markets'} ({d.percentage}%)
                  </div>
                </div>
              )
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ─── 4. Bar Chart: New Companies by Sector ──────────────────────────────────

interface NewBySectorProps {
  data: { naf_code: string; naf_name: string; totalNew: number }[]
  onFilter: (event: ChartFilterEvent) => void
  selectedSector: string
}

export function NewBySectorChart({ data, onFilter, selectedSector }: NewBySectorProps) {
  const { t } = useI18n()

  const chartData = data.slice(0, 8).map((d) => ({
    ...d,
    shortName: d.naf_name.length > 18 ? d.naf_name.substring(0, 18) + '…' : d.naf_name,
  }))

  return (
    <ChartCard
      title={t('explore_chart_new_by_sector')}
      description={t('explore_chart_new_by_sector_desc')}
      hasData={chartData.length > 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
          onClick={(state: any) => {
            if (state?.activePayload?.[0]?.payload) {
              const d = state.activePayload[0].payload
              onFilter({ type: 'sector', value: d.naf_code, label: d.naf_name })
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={GRAY_200} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: GRAY_500 }}
            axisLine={{ stroke: GRAY_200 }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="shortName"
            tick={{ fontSize: 11, fill: GRAY_500 }}
            axisLine={false}
            tickLine={false}
            width={110}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(34, 197, 94, 0.05)' }}
          />
          <Bar
            dataKey="totalNew"
            name={t('explore_col_new')}
            radius={[0, 4, 4, 0]}
            cursor="pointer"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.naf_code === selectedSector ? SUCCESS_700 : SUCCESS_500}
                stroke={entry.naf_code === selectedSector ? SUCCESS_700 : 'none'}
                strokeWidth={entry.naf_code === selectedSector ? 2 : 0}
              />
            ))}
            <LabelList
              dataKey="totalNew"
              position="right"
              style={{ fontSize: 10, fill: GRAY_500, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ─── 5. Area Chart: Total Companies Trend ───────────────────────────────────

interface CompaniesTrendProps {
  data: { period: string; totalCompanies: number }[]
  onFilter: (event: ChartFilterEvent) => void
  selectedPeriod: string
}

export function CompaniesTrendChart({ data, onFilter, selectedPeriod }: CompaniesTrendProps) {
  const { t } = useI18n()

  const formatPeriodLabel = (period: string) => {
    const match = period.match(/^(\d{4})-Q([1-4])$/)
    if (match) {
      const qKey = `explore_period_q${match[2]}` as any
      return `${match[1]} ${t(qKey)}`
    }
    return period
  }

  const chartData = data.map((d) => ({
    ...d,
    label: formatPeriodLabel(d.period),
  }))

  return (
    <ChartCard
      title={t('explore_chart_companies_trend')}
      description={t('explore_chart_companies_trend_desc')}
      hasData={chartData.length > 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
          onClick={(state: any) => {
            if (state?.activePayload?.[0]?.payload) {
              const d = state.activePayload[0].payload
              onFilter({ type: 'period', value: d.period, label: d.label })
            }
          }}
        >
          <defs>
            <linearGradient id="companiesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND_PRIMARY} stopOpacity={0.3} />
              <stop offset="100%" stopColor={BRAND_PRIMARY} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRAY_200} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: GRAY_500 }}
            axisLine={{ stroke: GRAY_200 }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: GRAY_500 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
          />
          <Tooltip
            content={<CustomTooltip formatter={(v: number) => v.toLocaleString()} />}
            cursor={{ stroke: BRAND_PRIMARY, strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Area
            type="monotone"
            dataKey="totalCompanies"
            name={t('explore_col_companies')}
            stroke={BRAND_PRIMARY}
            strokeWidth={2}
            fill="url(#companiesGradient)"
            dot={(props: any) => {
              const isSelected = props.payload.period === selectedPeriod
              return (
                <circle
                  cx={props.cx}
                  cy={props.cy}
                  r={isSelected ? 5 : 3}
                  fill={isSelected ? BRAND_PRIMARY : '#fff'}
                  stroke={BRAND_PRIMARY}
                  strokeWidth={2}
                  style={{ cursor: 'pointer' }}
                />
              )
            }}
            activeDot={{ r: 5, fill: BRAND_PRIMARY, stroke: '#fff', strokeWidth: 2, cursor: 'pointer' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ─── 6. Bar Chart: Net Growth by Zone ───────────────────────────────────────

interface NetGrowthByZoneProps {
  data: { zone_code: string; zone_name: string; netGrowth: number }[]
  onFilter: (event: ChartFilterEvent) => void
  selectedZone: string
}

export function NetGrowthByZoneChart({ data, onFilter, selectedZone }: NetGrowthByZoneProps) {
  const { t } = useI18n()

  const chartData = data.slice(0, 10).map((d) => ({
    ...d,
    shortName: d.zone_name.length > 14 ? d.zone_name.substring(0, 14) + '…' : d.zone_name,
  }))

  return (
    <ChartCard
      title={t('explore_chart_net_growth_by_zone')}
      description={t('explore_chart_net_growth_by_zone_desc')}
      hasData={chartData.length > 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
          onClick={(state: any) => {
            if (state?.activePayload?.[0]?.payload) {
              const d = state.activePayload[0].payload
              onFilter({ type: 'zone', value: d.zone_code, label: d.zone_name })
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={GRAY_200} vertical={false} />
          <XAxis
            dataKey="shortName"
            tick={{ fontSize: 11, fill: GRAY_500 }}
            axisLine={{ stroke: GRAY_200 }}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis
            tick={{ fontSize: 11, fill: GRAY_500 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip formatter={(v: number) => (v >= 0 ? `+${v}` : v)} />}
            cursor={{ fill: 'rgba(22, 163, 74, 0.05)' }}
          />
          <Bar
            dataKey="netGrowth"
            name={t('explore_col_net')}
            radius={[4, 4, 0, 0]}
            cursor="pointer"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.netGrowth >= 0 ? SUCCESS_500 : BRAND_PRIMARY}
                stroke={entry.zone_code === selectedZone ? (entry.netGrowth >= 0 ? SUCCESS_700 : BRAND_DARK) : 'none'}
                strokeWidth={entry.zone_code === selectedZone ? 2 : 0}
              />
            ))}
            <LabelList
              dataKey="netGrowth"
              position="top"
              formatter={(v: any) => (Number(v) >= 0 ? `+${v}` : v)}
              style={{ fontSize: 10, fill: GRAY_500, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
