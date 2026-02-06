import { useId, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from './layout/AppLayout.jsx'

import { apiFetch } from '../lib/auth.js'

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

function FieldInput({ id, value, onChange, ...props }) {
  return (
    <input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-2 block h-8 w-full rounded-md border border-slate-400 bg-sky-50 px-3 text-sm text-slate-900 shadow-sm focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
      {...props}
    />
  )
}

export default function RooCalculatorPage() {
  const navigate = useNavigate()
  const productId = useId()
  const hsCodeId = useId()
  const destinationId = useId()

  const [productName, setProductName] = useState('Coffee')
  const [hsCode, setHsCode] = useState('0901')
  const [destination, setDestination] = useState('Egypt')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const productSuggestions = useMemo(
    () => [
      'Shea Butter',
      'Coffee',
      'Cocoa Beans',
      'Rice',
      'Cotton T-shirts',
      'Roasted Coffee',
      'Refined Shea Butter (Cosmetic Grade)',
      'Tea',
      'Sugar',
      'Cashew Nuts',
      'Sesame Seeds',
      'Avocados',
      'Mangoes',
      'Pineapples',
      'Bananas',
      'Maize (Corn)',
      'Wheat Flour',
      'Palm Oil',
      'Leather Goods',
      'Textiles',
      'Footwear',
      'Pharmaceutical Products',
      'Ceramics',
    ],
    [],
  )

  const hsCodeSuggestions = useMemo(
    () => [
      '0901',
      '1801',
      '1006',
      '1515.90',
      '6109',
      '5208',
      '8703',
      '8711',
      '0901.21',
      '0901.22',
    ],
    [],
  )

  const destinationSuggestions = useMemo(
    () => [
      'Egypt',
      'Ghana',
      'Kenya',
      'Rwanda',
      'South Africa',
      'Nigeria',
      'Morocco',
      'Algeria',
      'Tunisia',
      'Senegal',
      'Côte d’Ivoire',
      'Cameroon',
      'Uganda',
      'Tanzania',
      'Ethiopia',
      'Zambia',
      'Zimbabwe',
      'Botswana',
      'Namibia',
      'Mozambique',
      'Angola',
      'DR Congo',
      'Somalia',
      'Sudan',
      'Madagascar',
      'Mauritius',
    ],
    [],
  )

  async function runAssessment() {
    setError('')

    setSubmitting(true)
    try {
      const payload = {
        product_name: productName,
        hs_code: hsCode,
        destination_country: destination,
      }

      const assessment = await apiFetch('/assessments/draft', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      navigate(`/app/trade-action?assessmentId=${encodeURIComponent(assessment.id)}`)
    } catch (e) {
      setError(e?.message || 'Failed to run assessment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppLayout active="roo" title="Shipment Details">
      <div className="flex justify-center">
        <section className="w-full max-w-[760px] overflow-hidden rounded-sm bg-white shadow-[0_14px_30px_rgba(0,0,0,0.18)] ring-1 ring-slate-300">
          <div className="border-b border-slate-300 bg-white px-8 py-4">
            <h1 className="text-2xl font-semibold text-slate-900">Shipment Details</h1>
          </div>

          {/* Shipment Details */}
          <div className="border-b border-slate-300 bg-sky-100/70 px-8 py-5">
            <div className="text-xl font-medium text-slate-700">Shipment Details</div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              <div>
                <FieldLabel htmlFor={productId}>Product Name</FieldLabel>
                <FieldInput
                  id={productId}
                  value={productName}
                  onChange={setProductName}
                  list="product-suggestions"
                  placeholder="Start typing (e.g., Shea Butter)"
                />
                <datalist id="product-suggestions">
                  {productSuggestions.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>

              <div>
                <FieldLabel htmlFor={hsCodeId}>HS Code</FieldLabel>
                <FieldInput
                  id={hsCodeId}
                  value={hsCode}
                  onChange={setHsCode}
                  list="hs-suggestions"
                  placeholder="Start typing (e.g., 1515.90)"
                  inputMode="decimal"
                />
                <datalist id="hs-suggestions">
                  {hsCodeSuggestions.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <FieldLabel htmlFor={destinationId}>Destination Country</FieldLabel>
                <FieldInput
                  id={destinationId}
                  value={destination}
                  onChange={setDestination}
                  list="destination-suggestions"
                  placeholder="Start typing (e.g., Kenya)"
                />
                <datalist id="destination-suggestions">
                  {destinationSuggestions.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="bg-sky-100/70 px-8 py-5">
            {error ? (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            ) : null}

            <button
              type="button"
              onClick={runAssessment}
              disabled={submitting}
              className="shrink-0 rounded-sm bg-slate-200 px-6 py-3 text-sm font-medium text-slate-900 shadow-sm ring-1 ring-slate-300 hover:bg-slate-100"
            >
              {submitting ? 'Creating…' : 'Continue to Evidence Upload'}
            </button>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
