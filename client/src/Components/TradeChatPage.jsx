import AppLayout from './layout/AppLayout.jsx'

function ChatBubble({ variant, children }) {
  const isUser = variant === 'user'

  return (
    <div className={isUser ? 'flex justify-start gap-3' : 'flex justify-end gap-3'}>
      {isUser ? (
        <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200 ring-1 ring-slate-300" />
      ) : null}

      <div
        className={
          'max-w-[520px] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm ring-1 ' +
          (isUser
            ? 'bg-sky-100 text-slate-800 ring-sky-200'
            : 'bg-amber-100 text-slate-800 ring-amber-200')
        }
      >
        {children}
      </div>

      {!isUser ? (
        <div className="h-10 w-10 shrink-0 rounded-full bg-white ring-1 ring-slate-200 shadow-sm" />
      ) : null}
    </div>
  )
}

export default function TradeChatPage() {
  return (
    <AppLayout active="chat" title="AI Trade Chat with Zuri AI">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="space-y-6">
            <ChatBubble variant="user">
              What are the rules of origin for exporting Coffee from Ethiopia to
              Kenya?
            </ChatBubble>

            <ChatBubble variant="ai">
              According to AfCFTA Annex 2, Coffee (HS Code 0901) must be wholly
              obtained in the member state. This means it must be grown and
              harvested in Ethiopia to qualify for 0% tariff.
            </ChatBubble>
          </div>
        </div>

        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder=""
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
            <button
              type="button"
              className="h-12 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
