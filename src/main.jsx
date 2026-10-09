import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.inkforge.css'
import App from './App.inkforge.tsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
