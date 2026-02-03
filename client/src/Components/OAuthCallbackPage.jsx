import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { setToken } from '../lib/auth.js'

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  useEffect(() => {
    const token = params.get('token')
    if (token) {
      setToken(token)
      navigate('/app/dashboard', { replace: true })
      return
    }
    navigate('/login', { replace: true })
  }, [navigate, params])

  return (
    <div className="min-h-dvh flex items-center justify-center bg-white">
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Signing you in…</div>
        <div className="mt-1 text-sm text-slate-600">Completing Google OAuth callback.</div>
      </div>
    </div>
  )
}
