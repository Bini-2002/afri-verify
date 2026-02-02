import AppLayout from './layout/AppLayout.jsx'
import { AddSquare, SearchNormal1 } from 'iconsax-react'

function SelectLike({ label }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-amber-100"
    >
      {label}
      <span className="text-slate-500">▾</span>
    </button>
  )
}

export default function DocumentRepositoryPage() {
  return (
    <AppLayout active="docs" title="Document Repository">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-xl font-semibold text-slate-900">
                Document Repository
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-700">My Document</div>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-50 px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-amber-100"
            >
              <AddSquare size={18} variant="Bold" className="text-slate-700" />
              Upload New Document
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <SelectLike label="Filter By Type" />
              <SelectLike label="Data Range" />
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-amber-50 px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-amber-100"
              >
                Full Range
              </button>
            </div>

            <div className="relative w-full lg:w-[360px]">
              <span className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center">
                <SearchNormal1 size={18} variant="Linear" className="text-slate-500" />
              </span>
              <input
                type="search"
                placeholder="search"
                className="h-11 w-full rounded-full border border-slate-300 bg-amber-50 pl-11 pr-4 text-sm text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="grid grid-cols-6 bg-amber-50 text-xs font-semibold text-slate-700">
              {[
                'Document Name',
                'Linked Shipment',
                'Type',
                'Date Uploaded',
                'Status',
                'Compliance\nStatus',
              ].map((h) => (
                <div key={h} className="px-3 py-3 border-r border-slate-200 last:border-r-0">
                  {h}
                </div>
              ))}
            </div>
            <div className="h-[520px] bg-sky-50" />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
