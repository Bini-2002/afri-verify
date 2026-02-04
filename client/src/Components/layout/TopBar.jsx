import { SearchNormal1, NotificationBing, ProfileCircle } from 'iconsax-react'
import { Link, useNavigate } from 'react-router-dom'

import { clearToken, isLoggedIn } from '../../lib/auth.js'

import logo from '../../images/logo-removebg-preview.png'

export default function TopBar({ title, rightLabel = 'Log out' }) {
  const navigate = useNavigate()

  function logout() {
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-16 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="AfriVerify" className="h-9 w-auto object-contain" />
          <span className="font-semibold tracking-wide text-slate-900">AfriVerify</span>
        </Link>

        <div className="hidden md:block text-center">
          <div className="text-lg font-semibold text-slate-900">{title}</div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
            aria-label="Search"
          >
            <SearchNormal1 size={18} variant="Linear" color="#475569" />
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
            aria-label="Notifications"
          >
            <NotificationBing size={18} variant="Linear" color="#475569" />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
              aria-label="Profile"
            >
              <ProfileCircle size={20} variant="Linear" color="#334155" />
            </button>
            {isLoggedIn() ? (
              <button
                type="button"
                onClick={logout}
                className="hidden sm:inline text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                {rightLabel}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-slate-100 bg-white px-4 py-2">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
      </div>
    </header>
  )
}
