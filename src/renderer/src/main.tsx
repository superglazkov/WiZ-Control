import { applyTheme } from './theme'
import '@fontsource-variable/inter'
import '../../i18n'
import './assets/main.css'

import App from '@renderer/App'
import React from 'react'
import ReactDOM from 'react-dom/client'

applyTheme()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
