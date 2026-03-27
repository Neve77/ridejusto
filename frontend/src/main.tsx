/**
 * Entry point da aplicação
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Security: Remove referrer
document.head.appendChild(Object.assign(document.createElement('meta'), {
  name: 'referrer',
  content: 'strict-origin-when-cross-origin',
}))

// Security: Content Security Policy
// Note: frame-ancestors is only supported via HTTP headers, not meta tags
const cspMeta = document.createElement('meta')
cspMeta.httpEquiv = 'Content-Security-Policy'
cspMeta.content = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' http://localhost:8000",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')
document.head.appendChild(cspMeta)

const root = document.getElementById('root')
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
