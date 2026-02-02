import { useId, useMemo, useState } from 'react'
import { InfoCircle, TickCircle, Warning2 } from 'iconsax-react'
import AppLayout from './layout/AppLayout.jsx'

function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
      {children}
    </label>
  )
}

function Input({ id, placeholder, type = 'text', value, onChange }) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
    />
  )
}

function Select({ id, value, onChange, children }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
    >
      {children}
    </select>
  )
}

function StatusPill({ variant, children }) {
  const classes =
    variant === 'pass'
      ? 'bg-green-100 text-green-800 ring-1 ring-green-200'
      : variant === 'warn'
        ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-200'
        : 'bg-red-100 text-red-800 ring-1 ring-red-200'

  return (
    <span className={'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ' + classes}>
      {children}
    </span>
  )
}

export default function RooCalculatorPage() {
  const originId = useId()
  const destinationId = useId()
  const hsCodeId = useId()
  const productId = useId()
  const valueAddedId = useId()

  const [origin, setOrigin] = useState('Ethiopia')
  const [destination, setDestination] = useState('Kenya')
  const [hsCode, setHsCode] = useState('0901')
  const [product, setProduct] = useState('Coffee')
  const [valueAdded, setValueAdded] = useState('35')

  const result = useMemo(() => {
    const value = Number.parseFloat(valueAdded)
    const isValid = Number.isFinite(value)

    if (!isValid) {
      return { status: 'warn', headline: 'Enter a valid % value', detail: 'Value added should be a number (e.g. 35).' }
    }

    if (hsCode.trim() === '0901') {
      return {
        status: 'pass',
        headline: 'Likely qualifies as Wholly Obtained',
        detail:
          'Coffee (HS 0901) often qualifies under AfCFTA when grown and harvested in the originating member state. Confirm supporting evidence and documentation before submitting.',
      }
    }

    if (value >= 40) {
      return {
        status: 'pass',
        headline: 'Likely qualifies (Value Added rule)',
        detail:
          'Based on your input, local value addition meets a common threshold. Final determination depends on the specific product rule and evidence.',
      }
    }

    return {
      status: 'warn',
      headline: 'Borderline — needs more info',
      detail:
        'Consider refining the materials breakdown (non-originating inputs) and check the product-specific rule for your HS code.',
    }
  }, [hsCode, valueAdded])

  return (
    <AppLayout active="roo" title="RoO Calculator">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="px-6 py-5 border-b border-slate-200">
            <div className="text-lg font-semibold text-slate-900">Rules of Origin Check</div>
            <div className="mt-1 text-sm text-slate-600">
              Provide shipment details to estimate AfCFTA origin eligibility.
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor={originId}>Origin Country</Label>
              <Select id={originId} value={origin} onChange={setOrigin}>
                <option>Ethiopia</option>
                <option>Kenya</option>
                <option>Ghana</option>
                <option>Rwanda</option>
                <option>South Africa</option>
              </Select>
            </div>

            <div>
              <Label htmlFor={destinationId}>Destination Country</Label>
              <Select id={destinationId} value={destination} onChange={setDestination}>
                <option>Kenya</option>
                <option>Ethiopia</option>
                <option>Ghana</option>
                <option>Rwanda</option>
                <option>South Africa</option>
              </Select>
            </div>

            <div>
              <Label htmlFor={hsCodeId}>HS Code</Label>
              <Input id={hsCodeId} placeholder="e.g. 0901" value={hsCode} onChange={setHsCode} />
            </div>

            <div>
              <Label htmlFor={productId}>Product</Label>
              <Input id={productId} placeholder="e.g. Coffee" value={product} onChange={setProduct} />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor={valueAddedId}>Local Value Added (%)</Label>
              <Input
                id={valueAddedId}
                type="number"
                placeholder="e.g. 40"
                value={valueAdded}
                onChange={setValueAdded}
              />
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <InfoCircle size={16} variant="Linear" color="#64748b" />
                This is an estimate; actual rules depend on HS-specific product rules.
              </div>
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                onClick={() => {
                  setOrigin('Ethiopia')
                  setDestination('Kenya')
                  setHsCode('0901')
                  setProduct('Coffee')
                  setValueAdded('35')
                }}
              >
                Reset
              </button>
              <button
                type="button"
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Calculate
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
          <div className="px-6 py-5 border-b border-slate-200">
            <div className="text-lg font-semibold text-slate-900">Result</div>
          </div>

          <div className="p-6 space-y-4">
            <StatusPill variant={result.status}>
              {result.status === 'pass' ? (
                <TickCircle size={16} variant="Bold" color="#15803d" />
              ) : (
                <Warning2 size={16} variant="Bold" color="#92400e" />
              )}
              {result.headline}
            </StatusPill>

            <div className="rounded-xl bg-white p-4 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200">
              <div className="font-semibold text-slate-900">Summary</div>
              <div className="mt-2 space-y-1">
                <div>
                  <span className="text-slate-500">Origin:</span> {origin}
                </div>
                <div>
                  <span className="text-slate-500">Destination:</span> {destination}
                </div>
                <div>
                  <span className="text-slate-500">HS Code:</span> {hsCode || '—'}
                </div>
                <div>
                  <span className="text-slate-500">Product:</span> {product || '—'}
                </div>
                <div>
                  <span className="text-slate-500">Value Added:</span> {valueAdded || '—'}%
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200">
              <div className="font-semibold text-slate-900">Notes</div>
              <p className="mt-2 leading-relaxed text-slate-600">{result.detail}</p>
            </div>

            <button
              type="button"
              className="w-full rounded-xl bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-amber-200"
            >
              Generate Supporting Checklist
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
