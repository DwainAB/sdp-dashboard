import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const saved = localStorage.getItem('theme')
document.documentElement.dataset.theme = saved || 'dark'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
