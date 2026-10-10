import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// NOTE (v1.1.0, online-only): no service worker is registered. The
// /sw.js file that ships exists solely so previously installed clients
// replace their old offline worker with a self-unregistering stub.
