import { Navigate, useLocation } from 'react-router-dom'

import { isLoggedIn } from '../lib/auth.js'

export default function RequireAuth({ children }) {
  const location = useLocation()

  if (!isLoggedIn()) {
    const from = `${location.pathname}${location.search || ''}`
    return <Navigate to="/login" replace state={{ from }} />
  }

  return children
}
