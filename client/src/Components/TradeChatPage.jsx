import AppLayout from './layout/AppLayout.jsx'

import chatAvatar from '../images/africa-logo-chat.png'

import { useState } from 'react'
import { apiFetch } from '../lib/auth.js'

function ChatBubble({ variant, children }) {
  const isUser = variant === 'user'

  return (
    <div className={isUser ? 'flex justify-start gap-3' : 'flex justify-end gap-3'}>
      {isUser ? (
        <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200 ring-1 ring-slate-300 flex items-center justify-center">
          <span className="text-xs font-bold text-slate-700">U</span>
        </div>
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
        <div className="h-10 w-10 shrink-0 rounded-full bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden">
          <img src={chatAvatar} alt="Zuri AI" className="h-full w-full object-cover" />
        </div>
      ) : null}
    </div>
  )
}

export default function TradeChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Ask me anything about AfCFTA rules of origin. I'll answer using only your uploaded AfCFTA PDFs.",
      citations: [],
    },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  async function send() {
    const text = input.trim()
    if (!text || sending) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text }])
    setSending(true)

    try {
      const res = await apiFetch('/rag/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      })
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: res?.answer || 'No response', citations: res?.citations || [] },
      ])
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: e?.message || 'Chat failed', citations: [] },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <AppLayout active="chat" title="AI Trade Chat with Zuri AI">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="space-y-6">
            {messages.map((m, idx) => (
              <ChatBubble key={idx} variant={m.role === 'user' ? 'user' : 'ai'}>
                <div>{m.text}</div>
                {m.role !== 'user' && Array.isArray(m.citations) && m.citations.length > 0 ? (
                  <div className="mt-3 border-t border-slate-200/60 pt-3 text-xs text-slate-700">
                    <div className="font-semibold text-slate-800">Citations</div>
                    <ul className="mt-2 space-y-1">
                      {m.citations.slice(0, 6).map((c) => (
                        <li key={c.chunk_id} className="truncate">
                          {c.file_name} {c.page_number ? `(p.${c.page_number})` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </ChatBubble>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder=""
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') send()
              }}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 shadow-sm focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
            <button
              type="button"
              onClick={send}
              disabled={sending}
              className="h-12 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
