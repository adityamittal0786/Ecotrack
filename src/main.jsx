import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { GLOBAL_CSS } from './design.js'

// Inject Space Grotesk font
const link = document.createElement('link')
link.rel  = 'stylesheet'
link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap'
document.head.appendChild(link)

// Inject global CSS
const style = document.createElement('style')
style.textContent = GLOBAL_CSS
document.head.appendChild(style)

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
