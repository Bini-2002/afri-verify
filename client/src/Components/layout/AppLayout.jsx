import SideNav from './SideNav.jsx'
import TopBar from './TopBar.jsx'
import StandardFooter from './StandardFooter.jsx'

export default function AppLayout({ active, title, children }) {
  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <TopBar title={title} />
      <div className="flex flex-1 min-h-0">
        <SideNav active={active} />
        <main className="flex-1 min-w-0 bg-slate-100">
          <div className="mx-auto max-w-[1200px] px-6 py-6">{children}</div>
        </main>
      </div>
      <StandardFooter />
    </div>
  )
}
