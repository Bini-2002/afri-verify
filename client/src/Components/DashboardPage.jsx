import AppLayout from './layout/AppLayout.jsx'
import { Truck, DocumentText1, DollarSquare, Document } from 'iconsax-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/auth.js'

function StatCard({ title, value, Icon }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-slate-300 bg-amber-50 shadow-sm">
      <div className="absolute left-0 top-0 h-full w-2 bg-slate-900" aria-hidden="true" />
      <div className="px-4 py-3 h-[110px] flex flex-col justify-between">
        <div className="min-h-[48px] text-xs font-semibold text-slate-800 whitespace-pre-line leading-snug">
          {title}
        </div>

        <div className="flex items-center justify-between">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white shadow-sm ring-1 ring-slate-200">
            <Icon size={18} variant="Bold" color="#0f172a" />
          </div>
          <div className="text-lg font-semibold text-slate-900 leading-none">{value}</div>
        </div>
      </div>
    </div>
  )
}

function Donut({ eligiblePercent = 0, pendingPercent = 0, actionRequiredPercent = 0 }) {
  const e = Math.max(0, Math.min(100, Number(eligiblePercent) || 0))
  const p = Math.max(0, Math.min(100, Number(pendingPercent) || 0))
  const a = Math.max(0, Math.min(100, Number(actionRequiredPercent) || 0))
  const total = e + p + a
  const ne = total > 0 ? (e / total) * 100 : 0
  const np = total > 0 ? (p / total) * 100 : 0
  const na = total > 0 ? (a / total) * 100 : 0

  return (
    <div className="relative h-44 w-44">
      <div
        className="h-44 w-44 rounded-full"
        style={{
          background: `conic-gradient(#ef4444 0 ${na}%, #60a5fa ${na}% ${na + np}%, #22c55e ${na + np}% 100%)`,
        }}
      />

      <div className="absolute inset-0 m-auto h-28 w-28 rounded-full bg-white shadow-sm ring-1 ring-slate-200" />

      {/* Percent labels around the ring (to match the design screenshot) */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2">
        <span className="inline-flex items-center justify-center rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-red-600 shadow-sm ring-1 ring-slate-200">
          {Math.round(na)}%
        </span>
      </div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2">
        <span className="inline-flex items-center justify-center rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-sky-600 shadow-sm ring-1 ring-slate-200">
          {Math.round(np)}%
        </span>
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2">
        <span className="inline-flex items-center justify-center rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-green-600 shadow-sm ring-1 ring-slate-200">
          {Math.round(ne)}%
        </span>
      </div>
    </div>
  )
}

function LegendRow({ color, label }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-3 w-8 rounded-full" style={{ background: color }} />
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const s = await apiFetch('/dashboard/summary')
        if (!cancelled) setSummary(s)
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const fmt = useMemo(() => new Intl.NumberFormat(undefined), [])
  const fmtMoney = useMemo(
    () => new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [],
  )

  const stats = {
    totalActiveShipments: summary?.total_active_shipments ?? 0,
    pendingApplicationChecks: summary?.pending_application_checks ?? 0,
    certifiedTradeValue: summary?.certified_trade_value ?? 0,
    documentsAwaitingAction: summary?.documents_awaiting_action ?? 0,
  }

  const overview = summary?.status_overview || {
    eligible_percent: 0,
    pending_percent: 0,
    action_required_percent: 0,
  }

  const activities = Array.isArray(summary?.recent_activities) ? summary.recent_activities : []

  return (
    <AppLayout active="dashboard" title="My Dashboard">
      {error ? (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl bg-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={'Total Active\nShipments'}
            value={loading ? '…' : fmt.format(stats.totalActiveShipments)}
            Icon={Truck}
          />
          <StatCard
            title={'Pending Application\nChecks'}
            value={loading ? '…' : fmt.format(stats.pendingApplicationChecks)}
            Icon={DocumentText1}
          />
          <StatCard
            title={'Certified Trade\nValue'}
            value={loading ? '…' : fmtMoney.format(stats.certifiedTradeValue)}
            Icon={DollarSquare}
          />
          <StatCard
            title={'Document\nAwaiting\nAction'}
            value={loading ? '…' : fmt.format(stats.documentsAwaitingAction)}
            Icon={Document}
          />
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 shadow-sm ring-1 ring-slate-200">
          <div className="px-6 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <div className="text-2xl font-semibold text-slate-800">
                Shipment Status Overview
              </div>

              <div className="mt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Donut */}
                <div className="shrink-0 flex justify-center lg:justify-start w-full lg:w-[220px]">
                  <Donut
                    eligiblePercent={overview.eligible_percent}
                    pendingPercent={overview.pending_percent}
                    actionRequiredPercent={overview.action_required_percent}
                  />
                </div>

                {/* Legend + explanation (center) */}
                <div className="flex-1 max-w-[520px]">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <LegendRow color="#22c55e" label="Eligible" />
                      <span className="text-sm font-semibold text-green-600">
                        {Math.round(overview.eligible_percent || 0)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <LegendRow color="#60a5fa" label="Pending" />
                      <span className="text-sm font-semibold text-sky-600">
                        {Math.round(overview.pending_percent || 0)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <LegendRow color="#ef4444" label="Action Required" />
                      <span className="text-sm font-semibold text-red-600">
                        {Math.round(overview.action_required_percent || 0)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-slate-600 leading-relaxed">
                    Eligible shipments are ready to proceed. Pending shipments require review.
                    Action Required indicates missing steps or documents.
                  </div>
                </div>

                {/* Explore */}
                <div className="w-full lg:w-[300px] shrink-0">
                  <div className="text-right text-xl font-semibold text-slate-800">
                    Explore
                  </div>
                  <div className="mt-3 space-y-3">
                    {['Eligible Shipping', 'Pending Shipping', 'Rejected Shipping'].map(
                      (label) => (
                        <button
                          key={label}
                          type="button"
                          className="w-full rounded-full bg-sky-100 px-6 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-sky-200"
                        >
                          {label}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="mt-2 text-xl font-semibold text-slate-800">
              Recent Activities
            </div>

            <div className="mt-3 overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
              <div className="grid grid-cols-7 bg-amber-100 text-xs font-semibold text-slate-800">
                {[
                  'Shipment\nReference',
                  'Route',
                  'Protocol Used',
                  'Value Added',
                  'Data Added',
                  'Application\nStatus',
                  'Action',
                ].map((h) => (
                  <div
                    key={h}
                    className="px-3 py-3 border-r border-slate-300 last:border-r-0 whitespace-pre-line"
                  >
                    {h}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {(loading ? Array.from({ length: 6 }).map((_, i) => ({ _loading: true, key: i })) : activities).map(
                  (row, rowIndex) => (
                    <div key={row?.assessment_id || row?.key || rowIndex} className="contents">
                      {row?._loading ? (
                        Array.from({ length: 7 }).map((__, colIndex) => (
                          <div
                            key={colIndex}
                            className={
                              'h-10 border-r border-t border-slate-300 last:border-r-0 ' +
                              (colIndex === 0 || colIndex === 2 || colIndex === 4 || colIndex === 6
                                ? 'bg-sky-50'
                                : 'bg-sky-100/70')
                            }
                          />
                        ))
                      ) : (
                        <>
                          <div className="h-10 px-3 border-r border-t border-slate-300 bg-sky-50 text-xs font-semibold text-slate-800 flex items-center">
                            {row.shipment_reference}
                          </div>
                          <div className="h-10 px-3 border-r border-t border-slate-300 bg-sky-100/70 text-xs font-semibold text-slate-800 flex items-center">
                            {row.route}
                          </div>
                          <div className="h-10 px-3 border-r border-t border-slate-300 bg-sky-50 text-xs font-semibold text-slate-800 flex items-center">
                            {row.protocol_used}
                          </div>
                          <div className="h-10 px-3 border-r border-t border-slate-300 bg-sky-100/70 text-xs font-semibold text-slate-800 flex items-center">
                            {row.value_added_percent}%
                          </div>
                          <div className="h-10 px-3 border-r border-t border-slate-300 bg-sky-50 text-[11px] font-semibold text-slate-700 flex items-center">
                            {new Date(row.data_added_at).toLocaleString()}
                          </div>
                          <div className="h-10 px-3 border-r border-t border-slate-300 bg-sky-100/70 text-xs font-semibold text-slate-800 flex items-center">
                            {String(row.application_status || '').replace(/_/g, ' ')}
                          </div>
                          <div className="h-10 px-3 border-t border-slate-300 bg-sky-50 text-xs font-semibold text-slate-800 flex items-center">
                            <button
                              type="button"
                              onClick={() => navigate(`/app/trade-action?assessmentId=${encodeURIComponent(row.assessment_id)}`)}
                              className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-sky-200"
                            >
                              View
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/app/roo')}
                className="inline-flex items-center justify-center rounded-full bg-amber-50 px-5 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-300 hover:bg-amber-100"
              >
                Start New Application
              </button>
              <button
                type="button"
                onClick={() => navigate('/app/trade-action')}
                className="inline-flex items-center justify-center rounded-full bg-amber-50 px-5 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-300 hover:bg-amber-100"
              >
                Upload Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
