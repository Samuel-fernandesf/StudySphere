import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './contexts/ThemeContext';
import App from './App'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)

