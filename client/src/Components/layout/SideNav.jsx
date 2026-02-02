import { Link } from 'react-router-dom'
import {
  Category2,
  Messages,
  Calculator,
  Activity,
  DocumentText,
  Setting2,
} from 'iconsax-react'

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', to: '/app/dashboard', Icon: Category2 },
  { key: 'chat', label: 'AI Trade Chat', to: '/app/chat', Icon: Messages },
  { key: 'roo', label: 'RoO Calculator', to: '/app/roo', Icon: Calculator },
  { key: 'trade', label: 'Trade Action', to: '/app/trade-action', Icon: Activity },
  { key: 'docs', label: 'My Document', to: '/app/documents', Icon: DocumentText },
  { key: 'settings', label: 'Setting', to: '/app/settings', Icon: Setting2 },
]

function NavItem({ active, item }) {
  const isActive = active === item.key
  const Icon = item.Icon

  return (
    <Link
      to={item.to}
      className={
        'group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ' +
        (isActive
          ? 'bg-sky-100 text-slate-900'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
      }
    >
      <span
        className={
          'inline-flex h-9 w-9 items-center justify-center rounded-xl ' +
          (isActive ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'bg-white')
        }
      >
        <Icon
          size={20}
          variant={isActive ? 'Bold' : 'Linear'}
          className={isActive ? 'text-slate-800' : 'text-slate-500'}
        />
      </span>
      <span className="text-sm font-medium">{item.label}</span>
    </Link>
  )
}

export default function SideNav({ active }) {
  return (
    <aside className="w-[260px] shrink-0 border-r border-slate-200 bg-white">
      <div className="px-4 py-5">
        <div className="space-y-2">
          {NAV_ITEMS.slice(0, 5).map((item) => (
            <NavItem key={item.key} active={active} item={item} />
          ))}
        </div>
      </div>

      <div className="mt-auto px-4 pb-6">
        <NavItem active={active} item={NAV_ITEMS[5]} />
      </div>
    </aside>
  )
}
