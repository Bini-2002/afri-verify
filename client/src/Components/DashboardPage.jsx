import AppLayout from './layout/AppLayout.jsx'
import { Truck, DocumentText1, DollarSquare, Document } from 'iconsax-react'

function StatCard({ title, value, Icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-amber-50 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <div className="text-xs font-semibold text-slate-700">{title}</div>
          <div className="mt-2 text-lg font-semibold text-slate-900">{value}</div>
        </div>
        <div className="h-10 w-10 rounded-lg bg-white shadow-sm ring-1 ring-slate-200 flex items-center justify-center">
          <Icon size={20} variant="Bold" className="text-slate-700" />
        </div>
      </div>
    </div>
  )
}

function Donut() {
  return (
    <div className="relative h-40 w-40">
      <div
        className="h-40 w-40 rounded-full"
        style={{
          background:
            'conic-gradient(#22c55e 0 60%, #60a5fa 60% 90%, #ef4444 90% 100%)',
        }}
      />
      <div className="absolute inset-0 m-auto h-24 w-24 rounded-full bg-white shadow-sm ring-1 ring-slate-200" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-xs font-semibold text-slate-600">10%</div>
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
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Active\nShipments" value="120,456.66" Icon={Truck} />
          <StatCard title="Pending Application\nChecks" value="120,456.66" Icon={DocumentText1} />
          <StatCard title="Certified Trade\nValue" value="120,456.66" Icon={DollarSquare} />
          <StatCard title="Document\nAwaiting\nAction" value="120,456.66" Icon={Document} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
          <div className="px-6 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="text-xl font-semibold text-slate-800">
                Shipment Status Overview
              </div>

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-8">
                <Donut />
                <div className="space-y-3">
                  <LegendRow color="#22c55e" label="Eligible" />
                  <LegendRow color="#60a5fa" label="Pending" />
                  <LegendRow color="#ef4444" label="Action Required" />
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[280px]">
              <div className="text-right text-lg font-semibold text-slate-800">
                Explore
              </div>
              <div className="mt-3 space-y-3">
                {['Eligible Shipping', 'Pending Shipping', 'Rejected Shipping'].map(
                  (label) => (
                    <button
                      key={label}
                      type="button"
                      className="w-full rounded-full bg-sky-100 px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-sky-200 hover:bg-sky-200"
                    >
                      {label}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="mt-2 text-lg font-semibold text-slate-800">
              Recent Activities
            </div>
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="grid grid-cols-7 bg-amber-50 text-xs font-semibold text-slate-700">
                {[
                  'Shipment\nReference',
                  'Route',
                  'Protocol Used',
                  'Value Added',
                  'Data Added',
                  'Application\nStatus',
                  'Action',
                ].map((h) => (
                  <div key={h} className="px-3 py-3 border-r border-slate-200 last:border-r-0">
                    {h}
                  </div>
                ))}
              </div>
              <div className="h-44 bg-sky-50" />
            </div>

            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-amber-50 px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-amber-100"
              >
                Start New Application
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-amber-50 px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-amber-100"
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
