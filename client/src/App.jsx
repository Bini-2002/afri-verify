import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import HomePage from './Components/HomePage.jsx'
import LoginPage from './Components/LoginPage.jsx'
import SignupPage from './Components/SignupPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
