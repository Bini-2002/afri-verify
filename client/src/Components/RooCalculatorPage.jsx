import { useId, useMemo, useState } from 'react'
import AppLayout from './layout/AppLayout.jsx'

function FieldLabel({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
      {children}
    </label>
  )
}

function FieldSelect({ id, value, onChange, children }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-2 block h-8 w-full rounded-md border border-slate-400 bg-sky-50 px-3 text-sm text-slate-900 shadow-sm focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
    >
      {children}
    </select>
  )
}

function FieldInput({ id, value, onChange }) {
  return (
    <input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-2 block h-8 w-full rounded-md border border-slate-400 bg-sky-50 px-3 text-sm text-slate-900 shadow-sm focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
    />
  )
}

export default function RooCalculatorPage() {
  const productId = useId()
  const destinationId = useId()
  const exFactoryId = useId()
  const nonOriginId = useId()
  const localMaterialId = useId()
  const laborId = useId()

  const [productHs, setProductHs] = useState('0901')
  const [destination, setDestination] = useState('Egypt')

  // Defaults chosen to reflect the screenshot example (42%)
  const [exFactoryPrice, setExFactoryPrice] = useState('100')
  const [nonOriginMaterialCost, setNonOriginMaterialCost] = useState('58')
  const [localMaterialCost, setLocalMaterialCost] = useState('35')
  const [directLaborOverload, setDirectLaborOverload] = useState('7')

  const valueAddedPercent = useMemo(() => {
    const ex = Number.parseFloat(exFactoryPrice)
    const local = Number.parseFloat(localMaterialCost)
    const labor = Number.parseFloat(directLaborOverload)

    if (!Number.isFinite(ex) || ex <= 0) return 0
    if (!Number.isFinite(local) || !Number.isFinite(labor)) return 0

    return Math.max(0, Math.min(100, Math.round(((local + labor) / ex) * 100)))
  }, [directLaborOverload, exFactoryPrice, localMaterialCost])

  return (
    <AppLayout active="roo" title="New Compliance Calculation">
      <div className="flex justify-center">
        <section className="w-full max-w-[760px] overflow-hidden rounded-sm bg-white shadow-[0_14px_30px_rgba(0,0,0,0.18)] ring-1 ring-slate-300">
          <div className="border-b border-slate-300 bg-white px-8 py-4">
            <h1 className="text-2xl font-semibold text-slate-900">Roc Calculator</h1>
          </div>

          {/* Shipment Details */}
          <div className="border-b border-slate-300 bg-sky-100/70 px-8 py-5">
            <div className="text-xl font-medium text-slate-700">Shipment Details</div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              <div>
                <FieldLabel htmlFor={productId}>Product(HS Code)</FieldLabel>
                <FieldSelect id={productId} value={productHs} onChange={setProductHs}>
                  <option value="0901">Coffee (0901)</option>
                  <option value="1801">Cocoa Beans (1801)</option>
                  <option value="1006">Rice (1006)</option>
                </FieldSelect>
              </div>

              <div>
                <FieldLabel htmlFor={destinationId}>Destination Country</FieldLabel>
                <FieldSelect id={destinationId} value={destination} onChange={setDestination}>
                  <option>Egypt</option>
                  <option>Ghana</option>
                  <option>Kenya</option>
                  <option>Rwanda</option>
                  <option>South Africa</option>
                </FieldSelect>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="border-b border-slate-300 bg-sky-100/70 px-8 py-5">
            <div className="text-xl font-medium text-slate-700">Cost Breakdown</div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              <div>
                <FieldLabel htmlFor={exFactoryId}>Ex-factor Price</FieldLabel>
                <FieldInput id={exFactoryId} value={exFactoryPrice} onChange={setExFactoryPrice} />
              </div>

              <div>
                <FieldLabel htmlFor={nonOriginId}>Total Non-original material cost</FieldLabel>
                <FieldInput id={nonOriginId} value={nonOriginMaterialCost} onChange={setNonOriginMaterialCost} />
              </div>

              <div>
                <FieldLabel htmlFor={localMaterialId}>Total Local Material Cost</FieldLabel>
                <FieldInput id={localMaterialId} value={localMaterialCost} onChange={setLocalMaterialCost} />
              </div>

              <div>
                <FieldLabel htmlFor={laborId}>Direct Labor overload</FieldLabel>
                <FieldInput id={laborId} value={directLaborOverload} onChange={setDirectLaborOverload} />
              </div>
            </div>
          </div>

          {/* Estimate + Action */}
          <div className="bg-sky-100/70 px-8 py-5">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
              <div className="flex-1 rounded-sm bg-amber-100 px-4 py-3 ring-1 ring-amber-200">
                <div className="text-[11px] font-medium text-slate-600">Real-time Estimate</div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="text-3xl font-semibold text-green-500">Value Added =</div>
                  <div className="rounded-sm bg-amber-200 px-6 py-2 text-3xl font-extrabold text-green-600 ring-1 ring-amber-300">
                    {valueAddedPercent}%
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="shrink-0 rounded-sm bg-slate-200 px-6 py-3 text-sm font-medium text-slate-900 shadow-sm ring-1 ring-slate-300 hover:bg-slate-100"
              >
                Run official Assessment
              </button>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
