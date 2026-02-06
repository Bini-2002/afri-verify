import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import HomePage from './Components/HomePage.jsx'
import LoginPage from './Components/LoginPage.jsx'
import SignupPage from './Components/SignupPage.jsx'
import DashboardPage from './Components/DashboardPage.jsx'
import TradeChatPage from './Components/TradeChatPage.jsx'
import DocumentRepositoryPage from './Components/DocumentRepositoryPage.jsx'
import RooCalculatorPage from './Components/RooCalculatorPage.jsx'
import TradeActionPage from './Components/TradeActionPage.jsx'
import SettingsPage from './Components/SettingsPage.jsx'
import OAuthCallbackPage from './Components/OAuthCallbackPage.jsx'
import RequireAuth from './Components/RequireAuth.jsx'
import CertificatePage from './Components/CertificatePage.jsx'
import FinalizeAssessmentPage from './Components/FinalizeAssessmentPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

        <Route
          path="/app/certificate/:assessmentId"
          element={
            <RequireAuth>
              <CertificatePage />
            </RequireAuth>
          }
        />

        <Route
          path="/app/finalize/:assessmentId"
          element={
            <RequireAuth>
              <FinalizeAssessmentPage />
            </RequireAuth>
          }
        />

        <Route
          path="/app/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/app/chat"
          element={
            <RequireAuth>
              <TradeChatPage />
            </RequireAuth>
          }
        />
        <Route
          path="/app/documents"
          element={
            <RequireAuth>
              <DocumentRepositoryPage />
            </RequireAuth>
          }
        />
        <Route
          path="/app/roo"
          element={
            <RequireAuth>
              <RooCalculatorPage />
            </RequireAuth>
          }
        />
        <Route
          path="/app/trade-action"
          element={
            <RequireAuth>
              <TradeActionPage />
            </RequireAuth>
          }
        />
        <Route
          path="/app/settings"
          element={
            <RequireAuth>
              <SettingsPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
