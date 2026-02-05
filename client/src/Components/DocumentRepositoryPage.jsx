import { useEffect, useMemo, useState } from 'react'

import AppLayout from './layout/AppLayout.jsx'
import { AddSquare, SearchNormal1 } from 'iconsax-react'

import { apiFetch, getApiBaseUrl, getToken } from '../lib/auth.js'

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

function formatDate(value) {
  if (!value) return '—'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return String(value)
  return dt.toLocaleString()
}

function Badge({ kind, children }) {
  const styles =
    kind === 'verified'
      ? 'bg-green-100 text-green-700 ring-green-200'
      : kind === 'rejected'
        ? 'bg-red-100 text-red-700 ring-red-200'
        : 'bg-sky-100 text-sky-700 ring-sky-200'

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles}`}>
      {children}
    </span>
  )
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-[640px] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 bg-amber-50 px-6 py-4">
          <div className="text-base font-semibold text-slate-900">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function FieldLabel({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-800">
      {children}
    </label>
  )
}

function Select({ id, value, onChange, children }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-2 block h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
    >
      {children}
    </select>
  )
}

export default function DocumentRepositoryPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [documents, setDocuments] = useState([])
  const [assessments, setAssessments] = useState([])

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsDoc, setDetailsDoc] = useState(null)
  const [ocrBusy, setOcrBusy] = useState(false)
  const [indexBusy, setIndexBusy] = useState(false)

  const [filterType, setFilterType] = useState('all')
  const [search, setSearch] = useState('')

  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadDocType, setUploadDocType] = useState('invoice')
  const [uploadAssessmentId, setUploadAssessmentId] = useState('')
  const [uploadFile, setUploadFile] = useState(null)

  async function fetchDocumentBlob(doc) {
    const token = getToken()
    if (!token) throw new Error('Not authenticated')

    const apiBase = getApiBaseUrl()
    const res = await fetch(`${apiBase}/documents/${doc.id}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      let detail = `Download failed (${res.status})`
      try {
        const data = await res.json()
        detail = data.detail || JSON.stringify(data)
      } catch {
        try {
          detail = await res.text()
        } catch {
          // ignore
        }
      }
      throw new Error(detail)
    }

    const contentType = res.headers.get('content-type') || 'application/octet-stream'
    const blob = await res.blob()
    return { blob, contentType }
  }

  async function handleDownload(doc) {
    setError('')
    try {
      const { blob } = await fetchDocumentBlob(doc)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.file_name || 'document'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      setError(e?.message || 'Download failed')
    }
  }

  async function handleView(doc) {
    setError('')
    try {
      const { blob, contentType } = await fetchDocumentBlob(doc)
      if (!contentType.includes('pdf') && !contentType.startsWith('image/')) {
        await handleDownload(doc)
        return
      }

      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
      setTimeout(() => window.URL.revokeObjectURL(url), 60_000)
    } catch (e) {
      setError(e?.message || 'View failed')
    }
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [docs, myAssessments] = await Promise.all([
          apiFetch('/documents/'),
          apiFetch('/assessments/my-assessments'),
        ])
        if (cancelled) return

        const sortedDocs = Array.isArray(docs)
          ? [...docs].sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
          : []
        setDocuments(sortedDocs)

        const list = Array.isArray(myAssessments) ? myAssessments : []
        setAssessments(list)
        if (!uploadAssessmentId && list[0]?.id) {
          setUploadAssessmentId(list[0].id)
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load documents')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const assessmentById = useMemo(() => {
    const map = new Map()
    for (const a of assessments) {
      if (a?.id) map.set(a.id, a)
    }
    return map
  }, [assessments])

  const types = useMemo(() => {
    const set = new Set()
    for (const d of documents) {
      if (d?.doc_type) set.add(String(d.doc_type))
    }
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [documents])

  const filteredDocuments = useMemo(() => {
    const q = search.trim().toLowerCase()
    return documents.filter((d) => {
      if (filterType !== 'all' && String(d?.doc_type || '') !== filterType) return false
      if (!q) return true
      const name = String(d?.file_name || '').toLowerCase()
      const type = String(d?.doc_type || '').toLowerCase()
      const status = String(d?.status || '').toLowerCase()
      return name.includes(q) || type.includes(q) || status.includes(q)
    })
  }, [documents, filterType, search])

  async function refreshDocuments() {
    const docs = await apiFetch('/documents/')
    const sortedDocs = Array.isArray(docs)
      ? [...docs].sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
      : []
    setDocuments(sortedDocs)
  }

  function safeParseJson(value) {
    if (!value) return null
    if (typeof value !== 'string') return null
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }

  const detailsMetadata = useMemo(() => safeParseJson(detailsDoc?.ai_metadata), [detailsDoc])
  const detailsFields = detailsMetadata?.extracted_fields || null
  const detailsDocType = String(detailsDoc?.doc_type || '').toLowerCase()
  const detailsIsInvoice =
    detailsDocType === 'invoice' || detailsDocType === 'commercial_invoice' || detailsDocType === 'commercial invoice'

  async function runOcrForDetailsDoc() {
    if (!detailsDoc?.id) return
    setError('')
    setOcrBusy(true)
    try {
      await apiFetch(`/documents/${encodeURIComponent(detailsDoc.id)}/ocr`, { method: 'POST' })
      await refreshDocuments()

      // refresh the modal doc from updated list
      setDetailsDoc((prev) => {
        const updated = documents.find((d) => d.id === prev?.id)
        return updated || prev
      })
    } catch (e) {
      setError(e?.message || 'OCR failed')
    } finally {
      setOcrBusy(false)
    }
  }

  async function indexDetailsDocForChat() {
    if (!detailsDoc?.id) return
    setError('')
    setIndexBusy(true)
    try {
      await apiFetch(`/documents/${encodeURIComponent(detailsDoc.id)}/index`, { method: 'POST' })
      await refreshDocuments()
    } catch (e) {
      setError(e?.message || 'Indexing failed')
    } finally {
      setIndexBusy(false)
    }
  }

  async function submitUpload() {
    setError('')
    if (!uploadFile) {
      setError('Please choose a file to upload.')
      return
    }
    if (!uploadAssessmentId) {
      setError('Please link the document to an assessment (shipment).')
      return
    }

    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', uploadFile)
      form.append('doc_type', uploadDocType)
      form.append('assessment_id', uploadAssessmentId)

      await apiFetch('/documents/upload', { method: 'POST', body: form })
      await refreshDocuments()

      setUploadFile(null)
      setUploadOpen(false)
    } catch (e) {
      setError(e?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <AppLayout active="docs" title="Document Repository">
      <Modal
        open={detailsOpen}
        title="Document Details"
        onClose={() => (ocrBusy || indexBusy ? null : (setDetailsOpen(false), setDetailsDoc(null)))}
      >
        {!detailsDoc ? (
          <div className="text-sm font-semibold text-slate-700">No document selected.</div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-600">File</div>
                <div className="mt-1 text-sm font-semibold text-slate-900 break-words">{detailsDoc.file_name}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600">Type</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{detailsDoc.doc_type || '—'}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600">Status</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{detailsDoc.status || '—'}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-600">Uploaded</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{formatDate(detailsDoc.uploaded_at)}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={indexDetailsDocForChat}
                disabled={indexBusy}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-60"
              >
                {indexBusy ? 'Indexing…' : 'Index for Chat'}
              </button>
              <div className="text-xs font-semibold text-slate-600">
                Use this after upload so AI chat can read it.
              </div>
            </div>

            {detailsIsInvoice ? (
              <div className="rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Invoice extraction</div>
                    <div className="mt-1 text-xs font-semibold text-slate-700">
                      {detailsMetadata?.ocr_provider
                        ? `Provider: ${detailsMetadata.ocr_provider}`
                        : 'Provider: —'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={runOcrForDetailsDoc}
                    disabled={ocrBusy}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
                  >
                    {ocrBusy ? 'Running OCR…' : 'Run OCR'}
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-white px-3 py-3 shadow-sm ring-1 ring-slate-200">
                    <div className="text-xs font-semibold text-slate-600">Item</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900 break-words">
                      {detailsFields?.item_name || '—'}
                    </div>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-3 shadow-sm ring-1 ring-slate-200">
                    <div className="text-xs font-semibold text-slate-600">Price</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      {typeof detailsFields?.price === 'number' ? detailsFields.price : '—'}
                    </div>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-3 shadow-sm ring-1 ring-slate-200">
                    <div className="text-xs font-semibold text-slate-600">Country</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900 break-words">
                      {detailsFields?.country || '—'}
                    </div>
                  </div>
                </div>

                {detailsMetadata?.extracted_text_excerpt ? (
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-slate-700">Extracted text (excerpt)</div>
                    <pre className="mt-2 max-h-56 overflow-auto rounded-xl bg-white p-3 text-xs text-slate-800 shadow-sm ring-1 ring-slate-200 whitespace-pre-wrap">
                      {detailsMetadata.extracted_text_excerpt}
                    </pre>
                  </div>
                ) : null}
              </div>
            ) : detailsMetadata ? (
              <div className="rounded-xl bg-sky-50 px-4 py-3 ring-1 ring-slate-200">
                <div className="text-sm font-semibold text-slate-900">AI metadata</div>
                <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-white p-3 text-xs text-slate-800 shadow-sm ring-1 ring-slate-200 whitespace-pre-wrap">
                  {JSON.stringify(detailsMetadata, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-sm font-semibold text-slate-700">No AI metadata available.</div>
            )}
          </div>
        )}
      </Modal>

      <Modal open={uploadOpen} title="Upload New Document" onClose={() => (uploading ? null : setUploadOpen(false))}>
        {assessments.length === 0 ? (
          <div className="rounded-xl bg-sky-50 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
            No assessments found yet. Create an assessment in the RoO Calculator first, then upload documents linked to that shipment.
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <FieldLabel htmlFor="docType">Document Type</FieldLabel>
            <Select id="docType" value={uploadDocType} onChange={setUploadDocType}>
              <option value="invoice">Commercial Invoice</option>
              <option value="supplier_declaration">Supplier Declaration</option>
              <option value="direct_transport">Direct Transport</option>
              <option value="bill_of_lading">Bill of Lading</option>
              <option value="afcfta_pdf">AfCFTA PDF (RAG)</option>
              <option value="roo_reference">RoO Guide / Reference PDF (RAG)</option>
              <option value="other">Other</option>
            </Select>
            <div className="mt-2 text-xs text-slate-600">
              Tip: use the standard types above to update the compliance tracker automatically.
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="assessment">Link To Shipment (Assessment)</FieldLabel>
            <Select id="assessment" value={uploadAssessmentId} onChange={setUploadAssessmentId}>
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.product_name} → {a.destination_country} (VA {Math.round((a.va_percentage || 0) * 10) / 10}%)
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-5">
          <FieldLabel htmlFor="file">File</FieldLabel>
          <input
            id="file"
            type="file"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
          {uploadFile ? (
            <div className="mt-2 text-xs font-semibold text-slate-700">Selected: {uploadFile.name}</div>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setUploadOpen(false)}
            disabled={uploading}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submitUpload}
            disabled={uploading || assessments.length === 0}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </Modal>

      {error ? (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      ) : null}

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
              onClick={() => setUploadOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-50 px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-amber-100"
            >
              <AddSquare size={18} variant="Bold" color="#334155" />
              Upload New Document
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                <span>Type</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none"
                >
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t === 'all' ? 'All' : t}
                    </option>
                  ))}
                </select>
              </div>
              <SelectLike label="Date Range" />
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-amber-50 px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-amber-100"
              >
                Full Range
              </button>
            </div>

            <div className="relative w-full lg:w-[360px]">
              <span className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center">
                <SearchNormal1 size={18} variant="Linear" color="#64748b" />
              </span>
              <input
                type="search"
                placeholder="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-full border border-slate-300 bg-amber-50 pl-11 pr-4 text-sm text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="grid grid-cols-7 bg-amber-50 text-xs font-semibold text-slate-700">
              {[
                'Document Name',
                'Linked Shipment',
                'Type',
                'Date Uploaded',
                'Status',
                'Compliance\nStatus',
                'Actions',
              ].map((h) => (
                <div key={h} className="px-3 py-3 border-r border-slate-200 last:border-r-0">
                  {h}
                </div>
              ))}
            </div>

            <div className="bg-sky-50">
              {loading ? (
                <div className="px-4 py-6 text-sm font-semibold text-slate-700">Loading documents…</div>
              ) : filteredDocuments.length === 0 ? (
                <div className="px-4 py-6 text-sm font-semibold text-slate-700">
                  No documents found.
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredDocuments.map((d) => {
                    const status = String(d?.status || '').toLowerCase()
                    const a = d?.assessment_id ? assessmentById.get(d.assessment_id) : null
                    const linkedShipment = a
                      ? `${a.product_name} → ${a.destination_country}`
                      : d?.assessment_id
                        ? `Assessment ${String(d.assessment_id).slice(0, 8)}…`
                        : '—'

                    const compliance = a?.status ? String(a.status).toLowerCase() : ''
                    return (
                      <div key={d.id} className="grid grid-cols-7 items-center text-sm text-slate-800">
                        <div className="px-3 py-3 border-r border-slate-200 font-semibold text-slate-900 truncate">
                          {d.file_name}
                        </div>
                        <div className="px-3 py-3 border-r border-slate-200 truncate">{linkedShipment}</div>
                        <div className="px-3 py-3 border-r border-slate-200 truncate">{d.doc_type || '—'}</div>
                        <div className="px-3 py-3 border-r border-slate-200 truncate">{formatDate(d.uploaded_at)}</div>
                        <div className="px-3 py-3 border-r border-slate-200">
                          <Badge kind={status}>{status || 'pending'}</Badge>
                        </div>
                        <div className="px-3 py-3 border-r border-slate-200">
                          {compliance ? <Badge kind={compliance}>{compliance}</Badge> : '—'}
                        </div>
                        <div className="px-3 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleView(d)}
                              className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDetailsDoc(d)
                                setDetailsOpen(true)
                              }}
                              className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm ring-1 ring-amber-200 hover:bg-amber-100"
                            >
                              Details
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownload(d)}
                              className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-600">
            Uploading a document with type <span className="font-semibold">invoice</span>, <span className="font-semibold">supplier_declaration</span>, or <span className="font-semibold">direct_transport</span> will automatically update the Trade Action compliance timeline.
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
