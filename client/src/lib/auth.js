const TOKEN_KEY = 'afriverify_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function isLoggedIn() {
  return Boolean(getToken())
}

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
}

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const apiBase = getApiBaseUrl()

  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${apiBase}${path}`, { ...options, headers })

  if (!res.ok) {
    let detail = 'Request failed'
    try {
      const data = await res.json()
      detail = data.detail || JSON.stringify(data)
    } catch {
      try {
        detail = await res.text()
      } catch {
        // ignore
      }
    }

    if (res.status === 401) {
      // Token is missing/expired/invalid or server secret changed.
      clearToken()
      try {
        if (window.location.pathname.startsWith('/app')) {
          window.location.assign('/login')
        }
      } catch {
        // ignore
      }
    }

    const err = new Error(detail)
    err.status = res.status
    throw err
  }

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return res.json()
  return res.text()
}
