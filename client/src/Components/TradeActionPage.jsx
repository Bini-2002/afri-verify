import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import AppLayout from './layout/AppLayout.jsx'
import {
  Paperclip,
  More,
  TickCircle,
  TickSquare,
  Verify,
} from 'iconsax-react'

import { apiFetch } from '../lib/auth.js'

function buildGuidance({ assessmentStatus, docStatuses, invoiceFields, hasInvoiceUpload }) {
  const status = String(assessmentStatus || '').toLowerCase()
  const supplier = String(docStatuses?.supplier_declaration || '').toLowerCase()
  const direct = String(docStatuses?.direct_transport || '').toLowerCase()
  const invoice = String(docStatuses?.invoice || '').toLowerCase()

  const steps = []

  if (status === 'eligible') {
    return {
      title: 'Final decision: Eligible',
      tone: 'success',
      steps: ['All required evidence is verified. You can generate your Certificate of Origin.'],
    }
  }

  if (status === 'ineligible') {
    return {
      title: 'Final decision: Ineligible',
      tone: 'danger',
      steps: ['The value addition threshold is not met (VA < 40%). Review EXW and NOM inputs and re-calculate.'],
    }
  }

  if (supplier !== 'verified') {
    steps.push('Upload a signed Supplier Declaration confirming originating status of inputs.')
  }

  if (direct !== 'verified') {
    steps.push('Upload Direct Transport evidence (Bill of Lading) showing shipment route without disqualifying transshipment.')
  }

  if (invoice !== 'verified') {
    if (!hasInvoiceUpload) {
      steps.push('Upload a Commercial Invoice for this assessment.')
    } else {
      const missing = []
      if (!invoiceFields?.country) missing.push('Country of Origin')
      if (typeof invoiceFields?.price !== 'number') missing.push('Invoice Total (numeric)')

      if (missing.length > 0) {
        steps.push(`Update the invoice to include: ${missing.join(' and ')}.`)
      } else {
        steps.push('Re-upload a clearer invoice (text must be extractable).')
      }
    }
  }

  if (steps.length === 0) {
    steps.push('Upload the remaining required evidence to proceed.')
  }

  return {
    title: 'Final decision: Action Required',
    tone: 'warning',
    steps,
  }
}

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

function CheckItem({ status, hasUpload, label, onUpload, busy }) {
  const normalized = String(status || '').toLowerCase()
  const isVerified = normalized === 'verified'
  const isPending = normalized === 'pending'
  const isRejected = normalized === 'rejected'

  const boxClass = isVerified
    ? 'bg-indigo-500 ring-indigo-600/20'
    : isRejected
      ? 'bg-red-300 ring-red-400/40'
      : isPending || hasUpload
        ? 'bg-amber-200 ring-amber-300/50'
        : 'bg-white ring-slate-300'

  const statusLabel = isVerified
    ? 'Verified'
    : isRejected
      ? 'Rejected'
      : isPending || hasUpload
        ? 'Pending'
        : 'Not uploaded'

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span
          className={
            'inline-flex h-9 w-9 items-center justify-center rounded-lg shadow-sm ring-1 ' +
            boxClass
          }
        >
          {isVerified ? (
            <TickSquare size={18} variant="Bold" color="#ffffff" />
          ) : isPending || hasUpload ? (
            <TickCircle size={18} variant="Bold" color="#0f172a" />
          ) : null}
        </span>
        <div>
          <div className="text-sm font-semibold text-slate-800">{label}</div>
          <div
            className={
              'mt-0.5 text-xs font-semibold ' +
              (isVerified
                ? 'text-slate-700'
                : isRejected
                  ? 'text-red-700'
                  : isPending || hasUpload
                    ? 'text-amber-900'
                    : 'text-slate-500')
            }
          >
            {statusLabel}
          </div>
        </div>
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
  const navigate = useNavigate()
  const assessmentIdFromUrl = searchParams.get('assessmentId')

  const [assessment, setAssessment] = useState(null)
  const [profile, setProfile] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [finalizing, setFinalizing] = useState(false)
  const [finalizeError, setFinalizeError] = useState('')
  const [chatUnlocked, setChatUnlocked] = useState(false)
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

  const docStatuses = useMemo(() => {
    return {
      supplier_declaration: assessment?.docs_supplier_declaration_status || '',
      invoice: assessment?.docs_invoice_status || '',
      direct_transport: assessment?.docs_direct_transport_status || '',
    }
  }, [assessment])

  const uploadedForAssessment = useMemo(() => {
    if (!assessment?.id) return { supplier_declaration: false, invoice: false, direct_transport: false }
    const mine = documents.filter((d) => String(d?.assessment_id || '') === String(assessment.id))

    const hasSupplier = mine.some((d) => String(d?.doc_type || '').toLowerCase() === 'supplier_declaration')
    const hasDirect = mine.some((d) => {
      const t = String(d?.doc_type || '').toLowerCase()
      return t === 'direct_transport' || t === 'direct transport' || t === 'bill_of_lading' || t === 'bill of lading'
    })
    const hasInvoice = mine.some((d) => {
      const t = String(d?.doc_type || '').toLowerCase()
      return t === 'invoice' || t === 'commercial_invoice' || t === 'commercial invoice'
    })

    return { supplier_declaration: hasSupplier, direct_transport: hasDirect, invoice: hasInvoice }
  }, [documents, assessment])

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

  async function finalizeEligibility() {
    if (!assessment?.id || finalizing) return
    setFinalizeError('')
    setFinalizing(true)
    try {
      // Keep user on this page; show a professional “processing” moment.
      await new Promise((r) => setTimeout(r, 700))
      const res = await apiFetch(`/assessments/${encodeURIComponent(assessment.id)}/finalize`, { method: 'POST' })
      await new Promise((r) => setTimeout(r, 900))
      setAssessment(res)

      const docs = await apiFetch('/documents/')
      setDocuments(Array.isArray(docs) ? docs : [])
    } catch (e) {
      setFinalizeError(e?.message || 'Final AI check failed')
    } finally {
      setFinalizing(false)
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

  const statusPillClass = useMemo(() => {
    const s = summary?.status
    if (s === 'eligible') return 'bg-green-300 ring-1 ring-green-400/50'
    if (s === 'ineligible') return 'bg-red-300 ring-1 ring-red-400/50'
    if (s === 'action_required' || s === 'action required') return 'bg-red-300 ring-1 ring-red-400/50'
    return 'bg-sky-200 ring-1 ring-sky-300/50'
  }, [summary])

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

      <div className="grid grid-cols-1 2xl:grid-cols-[1fr,320px] gap-6 items-start">
        <div>
          <div className="flex flex-col xl:flex-row gap-6 items-start">
            {/* Shipment Summary */}
            <section className="relative w-full xl:w-[340px] rounded-2xl bg-sky-200/60 shadow-sm ring-1 ring-slate-200 px-6 pb-6 pt-14">
              <PillTitle>Shipment Summary</PillTitle>

            <div className="mt-2 space-y-3">
              <LabelRow label="Product" value={summary?.product || (loading ? 'Loading…' : '—')} />
              <LabelRow label="Route" value={summary?.route || (loading ? 'Loading…' : '—')} />
              <LabelRow label="Protocol" value={summary?.protocol || (loading ? 'Loading…' : '—')} />
            </div>

            <div className="mt-6 flex justify-center">
              <div className={`rounded-full px-6 py-2 text-sm font-semibold text-slate-900 shadow-sm ${statusPillClass}`}>
                {summary
                  ? `${summary.status.toUpperCase()} (VA=${summary.va}%)`
                  : loading
                    ? 'Loading…'
                    : 'No assessment selected'}
              </div>
            </div>
            </section>

            {/* Compliance Timeline */}
            <section className="relative w-full xl:flex-1 min-w-0 rounded-2xl bg-sky-200/60 shadow-sm ring-1 ring-slate-200 px-8 pb-8 pt-14">
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
                    status={docStatuses.supplier_declaration}
                    hasUpload={uploadedForAssessment.supplier_declaration}
                    label="Supplier Declaration"
                    busy={uploading.supplier_declaration}
                    onUpload={() => openFilePicker('supplier_declaration')}
                  />
                  <CheckItem
                    status={docStatuses.direct_transport}
                    hasUpload={uploadedForAssessment.direct_transport}
                    label="Direct Transport (Bill of Lading)"
                    busy={uploading.direct_transport}
                    onUpload={() => openFilePicker('direct_transport')}
                  />
                  <CheckItem
                    status={docStatuses.invoice}
                    hasUpload={uploadedForAssessment.invoice}
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
                <StepNumber 
                  number={4} 
                  variant={summary?.status === 'eligible' ? 'active' : 'idle'} 
                />
              </div>
              <div className="pt-1">
                <div className="text-sm font-semibold text-slate-900">
                  Certificate of Origin (CoO) Issuance
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {summary?.status === 'eligible' ? (
                    <button
                      onClick={() => navigate(`/app/certificate/${assessment?.id}`)}
                      className="mt-2 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm ring-1 ring-indigo-500 hover:bg-indigo-700"
                    >
                      <Verify size={16} variant="Bold" className="text-indigo-200" />
                      View Certificate
                    </button>
                  ) : (
                    <div className="mt-2">
                      <button
                        onClick={finalizeEligibility}
                        disabled={finalizing}
                        className={
                          'inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white shadow-sm ring-1 ' +
                          (finalizing
                            ? 'bg-slate-700 ring-slate-700'
                            : 'bg-slate-900 ring-slate-800 hover:bg-slate-800')
                        }
                      >
                        <Verify size={16} variant="Bold" className="text-slate-200" />
                        {finalizing ? 'Zuri AI is processing…' : 'Finalize with Zuri AI'}
                      </button>

                      {finalizing ? (
                        <div className="mt-3 rounded-xl bg-white/70 px-4 py-3 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                          Running final eligibility checks and validating evidence…
                        </div>
                      ) : null}

                      {finalizeError ? (
                        <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                          {finalizeError}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
            </section>
          </div>

          {/* Upload / Invoice extraction (below the top row) */}
          <section className="mt-6 w-full rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 px-6 py-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-slate-900">Upload Invoice Extraction</div>
                <div className="mt-1 text-xs font-semibold text-slate-600">
                  {latestInvoice ? `Latest: ${latestInvoice.file_name}` : 'Upload an invoice to extract fields'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => openFilePicker('invoice')}
                disabled={uploading.invoice}
                className={
                  'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm ring-1 ' +
                  (uploading.invoice
                    ? 'bg-slate-100 text-slate-500 ring-slate-200'
                    : 'bg-amber-100 text-slate-900 ring-amber-200 hover:bg-amber-200')
                }
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white ring-1 ring-amber-200">
                  <Paperclip size={12} variant="Linear" color="#0f172a" />
                </span>
                {uploading.invoice ? 'Uploading…' : 'Upload'}
              </button>
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
        </div>

        {/* Zuri Guidance (no prompts) */}
        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden 2xl:col-start-2">
          <div className="bg-amber-100 px-4 py-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">Zuri Guidance</div>
            <button type="button" aria-label="More" className="text-slate-700 hover:text-slate-900">
              <More size={18} variant="Linear" color="#0f172a" />
            </button>
          </div>

          <div className="p-4">
            {(() => {
              const guidance = buildGuidance({
                assessmentStatus: summary?.status,
                docStatuses,
                invoiceFields,
                hasInvoiceUpload: uploadedForAssessment?.invoice,
              })

              const toneClass =
                guidance.tone === 'success'
                  ? 'bg-green-50 ring-green-200 text-green-800'
                  : guidance.tone === 'danger'
                    ? 'bg-red-50 ring-red-200 text-red-800'
                    : 'bg-amber-50 ring-amber-200 text-slate-800'

              return (
                <div className={`rounded-2xl px-4 py-4 ring-1 ${toneClass}`}>
                  <div className="text-sm font-extrabold">{guidance.title}</div>
                  <div className="mt-3 space-y-2 text-sm font-semibold">
                    {guidance.steps.map((s, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="mt-1 h-2 w-2 rounded-full bg-slate-900/70" aria-hidden="true" />
                        <div className="min-w-0 flex-1">{s}</div>
                      </div>
                    ))}
                  </div>

                  {guidance.tone !== 'success' ? (
                    <div className="mt-4">
                      {!chatUnlocked ? (
                        <button
                          type="button"
                          onClick={() => setChatUnlocked(true)}
                          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-slate-800 hover:bg-slate-800"
                        >
                          Enable Zuri Chat (uses prompts)
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => navigate('/app/chat')}
                          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-slate-800 hover:bg-slate-800"
                        >
                          Open Zuri Chat
                        </button>
                      )}
                      <div className="mt-2 text-[11px] font-semibold text-slate-700">
                        Chat is optional and may consume limited AI prompts.
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })()}
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
