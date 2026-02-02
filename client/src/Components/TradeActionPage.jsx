import AppLayout from './layout/AppLayout.jsx'
import {
  Paperclip,
  More,
  TickCircle,
  TickSquare,
} from 'iconsax-react'

function PillTitle({ children }) {
  return (
    <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-white px-6 py-1.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200">
      {children}
    </div>
  )
}

function LabelRow({ label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 rounded-lg bg-amber-200/70 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm">
        {label}
      </div>
      <div className="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
        {value}
      </div>
    </div>
  )
}

function UploadChip() {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-amber-200 hover:bg-amber-200"
    >
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white ring-1 ring-amber-200">
        <Paperclip size={12} variant="Linear" color="#0f172a" />
      </span>
      Upload
    </button>
  )
}

function CheckItem({ checked, label }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span
          className={
            'inline-flex h-9 w-9 items-center justify-center rounded-lg shadow-sm ring-1 ' +
            (checked
              ? 'bg-indigo-500 ring-indigo-600/20'
              : 'bg-white ring-slate-300')
          }
        >
          {checked ? (
            <TickSquare size={18} variant="Bold" color="#ffffff" />
          ) : null}
        </span>
        <div className="text-sm font-semibold text-slate-800">{label}</div>
      </div>
      <UploadChip />
    </div>
  )
}

function StepNumber({ number, variant }) {
  const bg =
    variant === 'active'
      ? 'bg-indigo-500 text-white'
      : 'bg-white text-slate-700'

  return (
    <div
      className={
        'relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full text-lg font-extrabold shadow-sm ring-1 ' +
        (variant === 'active' ? 'ring-indigo-600/20 ' : 'ring-slate-300 ') +
        bg
      }
    >
      {number}
    </div>
  )
}

export default function TradeActionPage() {
  return (
    <AppLayout active="trade" title="Trade Action">
      <div className="grid grid-cols-1 xl:grid-cols-[340px,1fr] 2xl:grid-cols-[340px,1fr,300px] gap-6 items-start">
        {/* Shipment Summary */}
        <section className="relative rounded-2xl bg-sky-200/60 shadow-sm ring-1 ring-slate-200 px-6 pb-6 pt-14">
          <PillTitle>Shipment Summary</PillTitle>

          <div className="mt-2 space-y-3">
            <LabelRow label="Product" value="Cocoa Beans" />
            <LabelRow label="Route" value="Ghana → Egypt" />
            <LabelRow label="Protocol" value="AfCFTA" />
          </div>

          <div className="mt-6 flex justify-center">
            <div className="rounded-full bg-green-300 px-6 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-green-400/50">
              Eligible(VA=65%)
            </div>
          </div>
        </section>

        {/* Compliance Timeline */}
        <section className="relative min-w-0 rounded-2xl bg-sky-200/60 shadow-sm ring-1 ring-slate-200 px-8 pb-8 pt-14">
          <PillTitle>Compliance Timeline</PillTitle>

          <div className="relative mt-4">
            {/* Vertical line */}
            <div className="absolute left-5 top-3 bottom-3 w-[3px] rounded-full bg-indigo-500/70" aria-hidden="true" />

            {/* Step 1 */}
            <div className="relative flex gap-6 pb-6">
              <div className="relative z-10 flex w-11 justify-center">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-green-400 shadow-sm ring-1 ring-green-500/40">
                  <TickCircle size={22} variant="Bold" color="#0f172a" />
                </div>
              </div>
              <div className="pt-1">
                <div className="text-sm font-semibold text-slate-900">Origin Criteria Meet</div>
                <div className="mt-1 text-xs text-slate-600">
                  Calculation Verified | Value Added &gt; 40%
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex gap-6 pb-8">
              <div className="relative z-10 flex w-11 justify-center">
                <StepNumber number={2} variant="active" />
              </div>
              <div className="flex-1 pt-1">
                <div className="text-sm font-semibold text-slate-900">
                  Evidence Upload and Verification
                </div>

                <div className="mt-4 space-y-3">
                  <CheckItem checked label="Supplier Declaration" />
                  <CheckItem checked label="Bill of Landing" />
                  <CheckItem checked={false} label="Commercial Invoice" />
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex gap-6 pb-10">
              <div className="relative z-10 flex w-11 justify-center">
                <StepNumber number={3} variant="idle" />
              </div>
              <div className="pt-1">
                <div className="text-sm font-semibold text-slate-900">Export Registration Check</div>
                <div className="mt-1 text-xs text-slate-600">pending</div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative flex gap-6">
              <div className="relative z-10 flex w-11 justify-center">
                <StepNumber number={4} variant="idle" />
              </div>
              <div className="pt-1">
                <div className="text-sm font-semibold text-slate-900">
                  Certificate of Origin(CoO) Issurance
                </div>
                <div className="mt-1 text-xs text-slate-600">pending</div>
              </div>
            </div>
          </div>
        </section>

        {/* Ask Zuri */}
        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden xl:col-span-2 2xl:col-span-1 2xl:col-start-3 2xl:row-start-1">
          <div className="bg-amber-100 px-4 py-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">Ask Zuri</div>
            <button type="button" aria-label="More" className="text-slate-700 hover:text-slate-900">
              <More size={18} variant="Linear" color="#0f172a" />
            </button>
          </div>

          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-sm font-semibold text-slate-900">Zuri AI</div>
              <div className="min-w-0 flex-1 rounded-xl bg-white px-3 py-3 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200 break-words">
                I’m tracking this shipment. We’re at the evidence stage. Please upload the
                suppliers declaration to proceed
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                aria-label="Attach"
              >
                <Paperclip size={18} variant="Linear" color="#0f172a" />
              </button>
              <input
                type="text"
                placeholder="Message…"
                className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
              <button
                type="button"
                className="h-10 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Send
              </button>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
