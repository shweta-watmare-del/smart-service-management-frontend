import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/theme.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          borderRadius: '8px',
          padding: '12px 16px',
        },
        success: {
          iconTheme: { primary: '#1B998B', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#E85D4C', secondary: '#fff' },
        },
      }}
    />
    <App />
  </StrictMode>,
)