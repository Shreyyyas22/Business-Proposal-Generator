import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter as Router } from 'react-router-dom'
import { DarkModeProvider } from './context/DarkModeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DarkModeProvider>
    <AuthProvider>
    <Router>
    <App />
    </Router>
    </AuthProvider>
    </DarkModeProvider>
  </StrictMode>,
)
