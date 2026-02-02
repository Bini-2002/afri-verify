import AppLayout from './layout/AppLayout.jsx'
import { Truck, DocumentText1, DollarSquare, Document } from 'iconsax-react'

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

function Donut() {
  return (
    <div className="relative h-44 w-44">
      <div
        className="h-44 w-44 rounded-full"
        style={{
          background:
            'conic-gradient(#ef4444 0 10%, #60a5fa 10% 40%, #22c55e 40% 100%)',
        }}
      />

      <div className="absolute inset-0 m-auto h-28 w-28 rounded-full bg-white shadow-sm ring-1 ring-slate-200" />

      {/* Percent labels around the ring (to match the design screenshot) */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2">
        <span className="inline-flex items-center justify-center rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-red-600 shadow-sm ring-1 ring-slate-200">
          10%
        </span>
      </div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2">
        <span className="inline-flex items-center justify-center rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-sky-600 shadow-sm ring-1 ring-slate-200">
          30%
        </span>
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2">
        <span className="inline-flex items-center justify-center rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-green-600 shadow-sm ring-1 ring-slate-200">
          60%
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
  return (
    <AppLayout active="dashboard" title="My Dashboard">
      <div className="rounded-2xl bg-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={'Total Active\nShipments'} value="120,456.66" Icon={Truck} />
          <StatCard title={'Pending Application\nChecks'} value="120,456.66" Icon={DocumentText1} />
          <StatCard title={'Certified Trade\nValue'} value="120,456.66" Icon={DollarSquare} />
          <StatCard title={'Document\nAwaiting\nAction'} value="120,456.66" Icon={Document} />
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
                  <Donut />
                </div>

                {/* Legend + explanation (center) */}
                <div className="flex-1 max-w-[520px]">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <LegendRow color="#22c55e" label="Eligible" />
                      <span className="text-sm font-semibold text-green-600">60%</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <LegendRow color="#60a5fa" label="Pending" />
                      <span className="text-sm font-semibold text-sky-600">30%</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <LegendRow color="#ef4444" label="Action Required" />
                      <span className="text-sm font-semibold text-red-600">10%</span>
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
                {Array.from({ length: 6 }).map((_, rowIndex) => (
                  <div key={rowIndex} className="contents">
                    {Array.from({ length: 7 }).map((__, colIndex) => (
                      <div
                        key={colIndex}
                        className={
                          'h-10 border-r border-t border-slate-300 last:border-r-0 ' +
                          (colIndex === 0 || colIndex === 2 || colIndex === 4 || colIndex === 6
                            ? 'bg-sky-50'
                            : 'bg-sky-100/70')
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-amber-50 px-5 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-300 hover:bg-amber-100"
              >
                Start New Application
              </button>
              <button
                type="button"
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
