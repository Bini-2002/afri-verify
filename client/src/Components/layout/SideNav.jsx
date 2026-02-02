import { Link } from 'react-router-dom'
import {
  Profile2User,
  MessageText,
  Calculator,
  Activity,
  Folder,
  Setting2,
} from 'iconsax-react'

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', to: '/app/dashboard', Icon: Profile2User },
  { key: 'chat', label: 'AI Trade Chat', to: '/app/chat', Icon: MessageText },
  { key: 'roo', label: 'RoO Calculator', to: '/app/roo', Icon: Calculator },
  { key: 'trade', label: 'Trade Action', to: '/app/trade-action', Icon: Activity },
  { key: 'docs', label: 'My Document', to: '/app/documents', Icon: Folder },
  { key: 'settings', label: 'Setting', to: '/app/settings', Icon: Setting2 },
]

function NavItem({ active, item }) {
  const isActive = active === item.key
  const Icon = item.Icon
  const iconColor = isActive ? '#0f172a' : '#64748b'

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
      <Icon size={22} variant={isActive ? 'Bold' : 'Linear'} color={iconColor} />
      <span className="text-sm font-medium">{item.label}</span>
    </Link>
  )
}

export default function SideNav({ active }) {
  return (
    <aside className="w-[260px] shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col">
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
