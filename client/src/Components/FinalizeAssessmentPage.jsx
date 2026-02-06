import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import AppLayout from './layout/AppLayout.jsx'
import { apiFetch } from '../lib/auth.js'

function Spinner() {
  return (
    <div className="inline-flex items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
    </div>
  )
}

export default function FinalizeAssessmentPage() {
  const { assessmentId } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function run() {
      setError('')
      if (!assessmentId) {
        setError('Missing assessment id')
        return
      }

      try {
        const res = await apiFetch(`/assessments/${encodeURIComponent(assessmentId)}/finalize`, {
          method: 'POST',
        })

        const status = String(res?.status || '').toLowerCase()

        // Give the user a believable “AI processing” moment.
        await new Promise((r) => setTimeout(r, 1600))
        if (cancelled) return

        if (status === 'eligible') {
          navigate(`/app/certificate/${assessmentId}`, { replace: true })
          return
        }

        navigate('/app/chat', { replace: true })
      } catch (e) {
        if (cancelled) return
        setError(e?.message || 'Failed to finalize eligibility')
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [assessmentId, navigate])

  return (
    <AppLayout active="trade" title="Final AI Eligibility Check">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl bg-white px-8 py-10 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col items-center text-center">
            <Spinner />
            <div className="mt-4 text-lg font-semibold text-slate-900">
              Zuri AI is finalizing your eligibility
            </div>
            <div className="mt-2 max-w-xl text-sm text-slate-600">
              Reviewing uploaded documents and confirming AfCFTA Rules of Origin evidence.
            </div>

            {error ? (
              <div className="mt-6 w-full rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
                {error}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => navigate('/app/trade-action', { replace: true })}
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Back to Trade Action
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
