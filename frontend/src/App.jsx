import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import Intelligence from './pages/Intelligence'
import Portfolio from './pages/Portfolio'
import Execution from './pages/Execution'
import Strategy from './pages/Strategy'
import Options from './pages/Options'
import Social from './pages/Social'
import Lab from './pages/Lab'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Clients from './pages/Clients'
import Journal from './pages/Journal'
import Execution from './pages/Execution'
import NeuralTerminal from './pages/NeuralTerminal'

import { NotificationProvider } from './context/NotificationContext'
import ToastContainer from './components/ToastContainer'

// Simple Auth Guard
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <Router>
      <NotificationProvider>
        <ToastContainer />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/*" element={
            <ProtectedRoute>
              <AppShell>
                <Routes>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="intelligence" element={<Intelligence />} />
                  <Route path="strategy" element={<Strategy />} />
                  <Route path="options" element={<Options />} />
                  <Route path="social" element={<Social />} />
                  <Route path="lab" element={<Lab />} />
                  <Route path="execution" element={<Execution />} />
                  <Route path="terminal" element={<NeuralTerminal />} />
                  <Route path="brokers" element={<Clients />} />
                  <Route path="accounts" element={<Portfolio />} />
                  <Route path="logs" element={<Journal />} />
                  <Route path="profile" element={<Settings />} />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </NotificationProvider>
    </Router>
  )
}

export default App
