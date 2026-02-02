import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import HomePage from './Components/HomePage.jsx'
import LoginPage from './Components/LoginPage.jsx'
import SignupPage from './Components/SignupPage.jsx'
import DashboardPage from './Components/DashboardPage.jsx'
import TradeChatPage from './Components/TradeChatPage.jsx'
import DocumentRepositoryPage from './Components/DocumentRepositoryPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/app/dashboard" element={<DashboardPage />} />
        <Route path="/app/chat" element={<TradeChatPage />} />
        <Route path="/app/documents" element={<DocumentRepositoryPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
