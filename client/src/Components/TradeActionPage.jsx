import AppLayout from './layout/AppLayout.jsx'
import {
  ArrowRight2,
  TickCircle,
  Clock,
  CloseCircle,
  DocumentUpload,
  ShieldTick,
} from 'iconsax-react'

function Badge({ variant, children }) {
  const classes =
    variant === 'done'
      ? 'bg-green-100 text-green-800 ring-1 ring-green-200'
      : variant === 'pending'
        ? 'bg-sky-100 text-sky-800 ring-1 ring-sky-200'
        : 'bg-red-100 text-red-800 ring-1 ring-red-200'

  return (
    <span className={'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ' + classes}>
      {children}
    </span>
  )
}

export default function TradeActionPage() {
  const actions = [
    {
      title: 'Upload commercial invoice',
      detail: 'Attach invoice to the shipment record to continue compliance checks.',
      status: 'pending',
      icon: DocumentUpload,
    },
    {
      title: 'Validate product HS code mapping',
      detail: 'Confirm HS code aligns with the product description and packing unit.',
      status: 'pending',
      icon: ShieldTick,
    },
    {
      title: 'Submit origin evidence documents',
      detail: 'Provide supplier declarations / manufacturing records for RoO review.',
      status: 'blocked',
      icon: CloseCircle,
    },
    {
      title: 'Finalize application package',
      detail: 'Ensure all required documents are present and up-to-date.',
      status: 'done',
      icon: TickCircle,
    },
  ]

  return (
    <AppLayout active="trade" title="Trade Action">
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="px-6 py-5 border-b border-slate-200">
            <div className="text-lg font-semibold text-slate-900">Action Center</div>
            <div className="mt-1 text-sm text-slate-600">
              Recommended next steps to keep shipments compliant and moving.
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-xl bg-amber-50 p-5 shadow-sm ring-1 ring-slate-200">
                <div className="text-xs font-semibold text-slate-600">Open Actions</div>
                <div className="mt-2 text-2xl font-extrabold text-slate-900">3</div>
              </div>
              <div className="rounded-xl bg-sky-50 p-5 shadow-sm ring-1 ring-slate-200">
                <div className="text-xs font-semibold text-slate-600">Pending Reviews</div>
                <div className="mt-2 text-2xl font-extrabold text-slate-900">2</div>
              </div>
              <div className="rounded-xl bg-green-50 p-5 shadow-sm ring-1 ring-slate-200">
                <div className="text-xs font-semibold text-slate-600">Completed</div>
                <div className="mt-2 text-2xl font-extrabold text-slate-900">1</div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-12 bg-amber-50 text-xs font-semibold text-slate-700">
            <div className="col-span-6 px-4 py-3 border-r border-slate-200">Action</div>
            <div className="col-span-3 px-4 py-3 border-r border-slate-200">Status</div>
            <div className="col-span-3 px-4 py-3">Next</div>
          </div>

          <div className="divide-y divide-slate-200">
            {actions.map((a) => {
              const Icon = a.icon
              return (
                <div key={a.title} className="grid grid-cols-12 items-center">
                  <div className="col-span-6 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                        <Icon size={20} variant="Bold" className="text-slate-700" />
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{a.title}</div>
                        <div className="mt-1 text-sm text-slate-600">{a.detail}</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 px-4 py-4">
                    {a.status === 'done' ? (
                      <Badge variant="done">
                        <TickCircle size={14} variant="Bold" className="text-green-700" /> Completed
                      </Badge>
                    ) : a.status === 'pending' ? (
                      <Badge variant="pending">
                        <Clock size={14} variant="Bold" className="text-sky-700" /> Pending
                      </Badge>
                    ) : (
                      <Badge variant="blocked">
                        <CloseCircle size={14} variant="Bold" className="text-red-700" /> Blocked
                      </Badge>
                    )}
                  </div>

                  <div className="col-span-3 px-4 py-4">
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-between rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                    >
                      Open
                      <ArrowRight2 size={18} variant="Linear" className="text-white/90" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
