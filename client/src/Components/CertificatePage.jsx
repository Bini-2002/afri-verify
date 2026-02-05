import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/auth.js'
import { Verify, Award } from 'iconsax-react'

export default function CertificatePage() {
  const { assessmentId } = useParams()
  const navigate = useNavigate()
  const [assessment, setAssessment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch(`/assessments/${encodeURIComponent(assessmentId)}`)
        setAssessment(data)
      } catch (e) {
        setError(e.message || 'Failed to load certificate')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [assessmentId])

  if (loading) return <div className="p-10 text-center">Loading certificate...</div>
  
  if (error) {
    return (
      <div className="p-10 text-center text-red-600">
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 underline">
          Go back
        </button>
      </div>
    )
  }

  if (!assessment) return null

  // Ensure it's eligible
  const isEligible = (assessment.status || '').toLowerCase() === 'eligible'

  if (!isEligible) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-6 text-center">
        <div className="rounded-full bg-red-100 p-4 text-red-600">
          <Verify size={48} variant="Bold" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Certificate Not Available</h1>
        <p className="mt-2 text-slate-600">
          This shipment has not yet met all the requirements for verification.
        </p>
        <button
          onClick={() => navigate('/app/trade')}
          className="mt-6 rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Return to Dashboard
        </button>
      </div>
    )
  }

  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex items-center justify-center print:bg-white print:p-0">
      <div className="w-full max-w-[210mm] bg-white p-12 shadow-2xl ring-1 ring-slate-900/5 print:shadow-none print:ring-0">
        
        {/* Border */}
        <div className="h-full w-full border-8 border-double border-slate-900 p-8">
          
          {/* Header */}
          <div className="text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-amber-100 p-3 ring-1 ring-amber-200">
                <Award size={48} variant="Bold" className="text-amber-600" />
            </div>
            <h1 className="font-serif text-4xl font-bold uppercase tracking-widest text-slate-900">
              Certificate of Origin
            </h1>
            <p className="mt-2 font-serif text-lg font-medium text-slate-600 uppercase tracking-wide">
              Afri-Verify Compliance
            </p>
          </div>

          <hr className="my-8 border-slate-200" />

          {/* Body */}
          <div className="space-y-6 text-center font-serif text-lg text-slate-800">
            <p>
              This is to certify that the goods described below have been verified
              and originate from:
            </p>
            <p className="text-2xl font-bold uppercase text-slate-900">
              {assessment.owner?.home_country || '[Origin Country]'}
            </p>

            <div className="mx-auto my-8 max-w-lg rounded-xl border border-slate-200 bg-slate-50 p-6 text-left">
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="font-semibold text-slate-500">Exporter:</span>
                <span className="font-bold">{assessment.owner?.full_name || '—'}</span>

                <span className="font-semibold text-slate-500">Product:</span>
                <span className="font-bold">{assessment.product_name}</span>

                <span className="font-semibold text-slate-500">HS Code:</span>
                <span className="font-bold">{assessment.hs_code}</span>

                <span className="font-semibold text-slate-500">Destination:</span>
                <span className="font-bold">{assessment.destination_country}</span>
                
                <span className="font-semibold text-slate-500">Protocol:</span>
                <span className="font-bold">{assessment.protocol_used || 'AfCFTA Annex 2'}</span>
              </div>
            </div>

            <p>
              The goods have been assessed and found to comply with the 
              Rules of Origin under the African Continental Free Trade Area (AfCFTA).
            </p>
          </div>

          {/* Footer / Signature */}
          <div className="mt-16 grid grid-cols-2 gap-12 text-center">
            <div>
              <div className="mx-auto mb-2 h-16 w-32 border-b-2 border-slate-900">
                 {/* Signature placeholder */}
                 <img src="/images/signature.png" alt="" className="h-full w-full object-contain opacity-50" onError={(e) => e.target.style.display='none'}/>
              </div>
              <p className="font-serif text-sm font-bold uppercase text-slate-500">Authorized Signature</p>
            </div>
            <div>
              <div className="mx-auto mb-2 flex h-16 items-end justify-center pb-1">
                 <span className="font-mono text-xl">{date}</span>
              </div>
              <div className="mx-auto w-32 border-b-2 border-slate-900"></div>
              <p className="mt-2 font-serif text-sm font-bold uppercase text-slate-500">Date of Issue</p>
            </div>
          </div>

          <div className="mt-12 text-center text-xs text-slate-400">
            <p>Verification ID: {assessment.id}</p>
            <p>Generated by Afri-Verify Digital Systems</p>
          </div>

        </div>
      </div>

      <div className="fixed bottom-8 right-8 flex gap-4 print:hidden">
        <button
          onClick={() => navigate('/app/trade')}
          className="rounded-full bg-white px-6 py-3 font-semibold text-slate-900 shadow-lg ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Close
        </button>
        <button
          onClick={() => window.print()}
          className="rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg ring-1 ring-indigo-500 hover:bg-indigo-700"
        >
          Print Certificate
        </button>
      </div>
    </div>
  )
}
