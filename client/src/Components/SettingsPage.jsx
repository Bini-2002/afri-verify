import { useId, useState } from 'react'
import AppLayout from './layout/AppLayout.jsx'
import { TickSquare, NotificationBing, SecuritySafe, User } from 'iconsax-react'

function Field({ label, id, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
      />
    </div>
  )
}

function ToggleRow({ icon: Icon, title, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
          <Icon size={20} variant="Bold" color="#334155" />
        </span>
        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-sm text-slate-600">{description}</div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={
          'relative inline-flex h-7 w-12 items-center rounded-full transition-colors ring-1 ' +
          (checked
            ? 'bg-green-500 ring-green-600/20'
            : 'bg-slate-200 ring-slate-300')
        }
        aria-pressed={checked}
      >
        <span
          className={
            'inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform ' +
            (checked ? 'translate-x-5' : 'translate-x-0.5')
          }
        />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const nameId = useId()
  const emailId = useId()
  const companyId = useId()

  const [name, setName] = useState('Bini')
  const [email, setEmail] = useState('binetjachew18@gmail.com')
  const [company, setCompany] = useState('AfriVerify')

  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyInApp, setNotifyInApp] = useState(true)
  const [twoFactor, setTwoFactor] = useState(false)

  return (
    <AppLayout active="settings" title="Setting">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="px-6 py-5 border-b border-slate-200">
              <div className="text-lg font-semibold text-slate-900">Profile</div>
              <div className="mt-1 text-sm text-slate-600">Update your account information.</div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field
                label="Full Name"
                id={nameId}
                value={name}
                onChange={setName}
                placeholder="Your name"
              />
              <Field
                label="Email"
                id={emailId}
                value={email}
                onChange={setEmail}
                type="email"
                placeholder="you@example.com"
              />
              <div className="md:col-span-2">
                <Field
                  label="Company"
                  id={companyId}
                  value={company}
                  onChange={setCompany}
                  placeholder="Company name"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 inline-flex items-center gap-2"
                >
                  <TickSquare size={18} variant="Bold" color="#ffffff" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
            <div className="px-6 py-5 border-b border-slate-200">
              <div className="text-lg font-semibold text-slate-900">Preferences</div>
            </div>
            <div className="p-6 space-y-4">
              <ToggleRow
                icon={NotificationBing}
                title="Email notifications"
                description="Receive important updates and reminders by email."
                checked={notifyEmail}
                onChange={setNotifyEmail}
              />
              <ToggleRow
                icon={User}
                title="In-app notifications"
                description="Show alerts and status updates inside the dashboard."
                checked={notifyInApp}
                onChange={setNotifyInApp}
              />
              <ToggleRow
                icon={SecuritySafe}
                title="Two-factor authentication"
                description="Add an extra security layer to your account."
                checked={twoFactor}
                onChange={setTwoFactor}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm h-fit">
          <div className="px-6 py-5 border-b border-slate-200">
            <div className="text-lg font-semibold text-slate-900">Account</div>
          </div>
          <div className="p-6 space-y-3">
            <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-100">
              <div className="text-xs font-semibold text-slate-700">Plan</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">Starter</div>
            </div>

            <button
              type="button"
              className="w-full rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Change Password
            </button>
            <button
              type="button"
              className="w-full rounded-xl bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 shadow-sm ring-1 ring-red-200 hover:bg-red-100"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
