import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AppLayout from './layout/AppLayout.jsx'
import {
  Paperclip,
  More,
  TickCircle,
  TickSquare,
} from 'iconsax-react'

import { apiFetch } from '../lib/auth.js'

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

function CheckItem({ checked, label, onUpload, busy }) {
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
      <button
        type="button"
        onClick={onUpload}
        disabled={busy}
        className={
          'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm ring-1 ' +
          (busy
            ? 'bg-slate-100 text-slate-500 ring-slate-200'
            : 'bg-amber-100 text-slate-900 ring-amber-200 hover:bg-amber-200')
        }
      >
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white ring-1 ring-amber-200">
          <Paperclip size={12} variant="Linear" color="#0f172a" />
        </span>
        {busy ? 'Uploading…' : 'Upload'}
      </button>
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
  const [searchParams, setSearchParams] = useSearchParams()
  const assessmentIdFromUrl = searchParams.get('assessmentId')

  const [assessment, setAssessment] = useState(null)
  const [profile, setProfile] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [uploading, setUploading] = useState({
    supplier_declaration: false,
    direct_transport: false,
    invoice: false,
  })

  const fileInputs = {
    supplier_declaration: useRef(null),
    direct_transport: useRef(null),
    invoice: useRef(null),
  }

  const docChecks = useMemo(() => {
    const s = (assessment?.docs_supplier_declaration_status || '').toLowerCase()
    const i = (assessment?.docs_invoice_status || '').toLowerCase()
    const d = (assessment?.docs_direct_transport_status || '').toLowerCase()
    return {
      supplier_declaration: s === 'verified',
      invoice: i === 'verified',
      direct_transport: d === 'verified',
    }
  }, [assessment])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [me, chosenAssessment, docs] = await Promise.all([
          apiFetch('/users/me'),
          (async () => {
            if (assessmentIdFromUrl) {
              return apiFetch(`/assessments/${encodeURIComponent(assessmentIdFromUrl)}`)
            }
            const list = await apiFetch('/assessments/my-assessments')
            if (!Array.isArray(list) || list.length === 0) return null
            const newest = list[0]
            if (newest?.id) {
              setSearchParams({ assessmentId: newest.id }, { replace: true })
            }
            return newest
          })(),
          apiFetch('/documents/'),
        ])

        if (cancelled) return
        setProfile(me)
        setAssessment(chosenAssessment)
        setDocuments(Array.isArray(docs) ? docs : [])
      } catch (e) {
        if (cancelled) return
        setError(e?.message || 'Failed to load compliance tracker')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [assessmentIdFromUrl, setSearchParams])

  async function uploadDocument(docType, file) {
    if (!assessment?.id) return
    setError('')
    setUploading((prev) => ({ ...prev, [docType]: true }))
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('doc_type', docType)
      form.append('assessment_id', assessment.id)

      await apiFetch('/documents/upload', { method: 'POST', body: form })
      const refreshed = await apiFetch(`/assessments/${encodeURIComponent(assessment.id)}`)
      setAssessment(refreshed)

      const docs = await apiFetch('/documents/')
      setDocuments(Array.isArray(docs) ? docs : [])
    } catch (e) {
      setError(e?.message || 'Upload failed')
    } finally {
      setUploading((prev) => ({ ...prev, [docType]: false }))
    }
  }

  function safeParseJson(value) {
    if (!value || typeof value !== 'string') return null
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }

  const latestInvoice = useMemo(() => {
    if (!assessment?.id) return null
    const inv = documents
      .filter((d) => String(d?.assessment_id || '') === String(assessment.id))
      .filter((d) => {
        const t = String(d?.doc_type || '').toLowerCase()
        return t === 'invoice' || t === 'commercial_invoice' || t === 'commercial invoice'
      })
      .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
    return inv[0] || null
  }, [documents, assessment])

  const invoiceMetadata = useMemo(() => safeParseJson(latestInvoice?.ai_metadata), [latestInvoice])
  const invoiceFields = invoiceMetadata?.extracted_fields || null

  function openFilePicker(docType) {
    const ref = fileInputs[docType]
    if (ref?.current) ref.current.click()
  }

  const summary = useMemo(() => {
    if (!assessment) return null
    const home = profile?.home_country || 'Origin'
    const route = `${home} → ${assessment.destination_country}`
    const va = Math.round((assessment.va_percentage || 0) * 10) / 10
    return {
      product: assessment.product_name,
      route,
      protocol: assessment.protocol_used || 'AfCFTA',
      status: (assessment.status || '').toLowerCase(),
      va,
    }
  }, [assessment, profile])

  return (
    <AppLayout active="trade" title="Trade Action">
      <input
        ref={fileInputs.supplier_declaration}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) uploadDocument('supplier_declaration', file)
        }}
      />
      <input
        ref={fileInputs.direct_transport}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) uploadDocument('direct_transport', file)
        }}
      />
      <input
        ref={fileInputs.invoice}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) uploadDocument('invoice', file)
        }}
      />

      {error ? (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-[340px,1fr] 2xl:grid-cols-[340px,1fr,300px] gap-6 items-start">
        {/* Shipment Summary */}
        <section className="relative rounded-2xl bg-sky-200/60 shadow-sm ring-1 ring-slate-200 px-6 pb-6 pt-14">
          <PillTitle>Shipment Summary</PillTitle>

          <div className="mt-2 space-y-3">
            <LabelRow label="Product" value={summary?.product || (loading ? 'Loading…' : '—')} />
            <LabelRow label="Route" value={summary?.route || (loading ? 'Loading…' : '—')} />
            <LabelRow label="Protocol" value={summary?.protocol || (loading ? 'Loading…' : '—')} />
          </div>

          <div className="mt-6 flex justify-center">
            <div className="rounded-full bg-green-300 px-6 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-green-400/50">
              {summary
                ? `${summary.status.toUpperCase()} (VA=${summary.va}%)`
                : loading
                  ? 'Loading…'
                  : 'No assessment selected'}
            </div>
          </div>
        </section>

        {/* Invoice extraction */}
        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-slate-900">Invoice extraction</div>
              <div className="mt-1 text-xs font-semibold text-slate-600">
                {latestInvoice ? `Latest: ${latestInvoice.file_name}` : 'Upload an invoice to extract fields'}
              </div>
            </div>
          </div>

          {latestInvoice ? (
            <div className="mt-4 space-y-3">
              <div className="text-xs font-semibold text-slate-700">
                Status: <span className="text-slate-900">{latestInvoice.status || '—'}</span>
                {invoiceMetadata?.ocr_provider ? (
                  <span className="ml-2 text-slate-600">(Provider: {invoiceMetadata.ocr_provider})</span>
                ) : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold text-slate-600">Item</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 break-words">
                    {invoiceFields?.item_name || '—'}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold text-slate-600">Price</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {typeof invoiceFields?.price === 'number' ? invoiceFields.price : '—'}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold text-slate-600">Country</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 break-words">
                    {invoiceFields?.country || '—'}
                  </div>
                </div>
              </div>

              {invoiceMetadata?.extracted_text_excerpt ? (
                <div>
                  <div className="text-xs font-semibold text-slate-700">Extracted text (excerpt)</div>
                  <pre className="mt-2 max-h-48 overflow-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-800 ring-1 ring-slate-200 whitespace-pre-wrap">
                    {invoiceMetadata.extracted_text_excerpt}
                  </pre>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-amber-200">
              Upload an invoice (image or PDF). If it’s an image, make sure Tesseract is installed on the server.
            </div>
          )}
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
                  {summary ? `Calculation Verified | VA=${summary.va}%` : 'Calculation pending'}
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
                  <CheckItem
                    checked={docChecks.supplier_declaration}
                    label="Supplier Declaration"
                    busy={uploading.supplier_declaration}
                    onUpload={() => openFilePicker('supplier_declaration')}
                  />
                  <CheckItem
                    checked={docChecks.direct_transport}
                    label="Direct Transport (Bill of Lading)"
                    busy={uploading.direct_transport}
                    onUpload={() => openFilePicker('direct_transport')}
                  />
                  <CheckItem
                    checked={docChecks.invoice}
                    label="Commercial Invoice"
                    busy={uploading.invoice}
                    onUpload={() => openFilePicker('invoice')}
                  />
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
