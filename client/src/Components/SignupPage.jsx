import { useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import logo from '../images/logo-removebg-preview.png'
import heroSide from '../images/cyber-map.png'
import googleIcon from '../images/google.png'

function EyeIcon({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10.6 10.6A3.5 3.5 0 0 0 12 15.5c1.9 0 3.5-1.6 3.5-3.5 0-.5-.1-1-.3-1.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.5 6.6C4.2 8.2 2.5 12 2.5 12s3.5 7 9.5 7c1.7 0 3.2-.4 4.5-1.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9.1 4.9C10 4.6 11 4.5 12 4.5c6 0 9.5 7.5 9.5 7.5s-1.2 2.6-3.5 4.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function SignupPage() {
  const nameId = useId()
  const emailId = useId()
  const passwordId = useId()
  const sectorId = useId()

  const [showPassword, setShowPassword] = useState(false)

  const quote = useMemo(
    () =>
      '“Empowering African SMEs to trade beyond borders. Sign up and get certified.”',
    [],
  )

  return (
    <div className="min-h-dvh bg-white">
      <div className="mx-auto grid min-h-dvh max-w-6xl grid-cols-1 lg:grid-cols-2">
        <div className="px-6 sm:px-10 py-10 lg:py-14">
          <Link to="/" className="inline-flex items-center gap-3">
            <img src={logo} alt="AfriVerify" className="h-10 w-auto" />
          </Link>

          <h1 className="mt-10 text-2xl font-semibold text-slate-900">
            Join the trade revolution
          </h1>

          <form className="mt-8 space-y-5 max-w-md">
            <div>
              <label
                htmlFor={nameId}
                className="block text-sm font-medium text-slate-700"
              >
                Full Name
              </label>
              <input
                id={nameId}
                name="fullName"
                type="text"
                autoComplete="name"
                className="mt-2 block w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="Your name"
              />
            </div>

            <div>
              <label
                htmlFor={emailId}
                className="block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id={emailId}
                name="email"
                type="email"
                autoComplete="email"
                className="mt-2 block w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor={passwordId}
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative mt-2">
                <input
                  id={passwordId}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="block w-full rounded-full border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 inline-flex items-center text-slate-500 hover:text-slate-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor={sectorId}
                className="block text-sm font-medium text-slate-700"
              >
                Sector
              </label>
              <input
                id={sectorId}
                name="sector"
                type="text"
                className="mt-2 block w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="e.g Agriculture, Textile"
              />
            </div>

            <button
              type="button"
              className="w-full rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-900 shadow hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              Create Account
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-slate-500">
                  or
                </span>
              </div>
            </div>

            <button
              type="button"
              className="w-full rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 inline-flex items-center justify-center gap-2"
            >
              <img src={googleIcon} alt="" className="h-5 w-5" />
              or log in with Google
            </button>

            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-slate-900">
                Log in
              </Link>
              .
            </p>
          </form>
        </div>

        <div className="relative hidden lg:block">
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url(${heroSide})` }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-slate-950/30" aria-hidden="true" />
          <div className="absolute inset-0 p-10 flex items-end">
            <div className="max-w-md rounded-xl bg-slate-950/30 backdrop-blur-sm px-6 py-5 text-white shadow-lg ring-1 ring-white/15">
              <p className="text-xl font-semibold leading-snug">{quote}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
