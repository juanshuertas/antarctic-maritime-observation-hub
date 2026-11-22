// OLEA i18n V20 — native render-time translation (global DOM translator stays disabled)

import { StrictMode, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { getLocale, initI18n, subscribeLocale } from './i18n/olea-i18n'

function LocalizedApp() {
  // Remount once per language change so every view re-renders in the new locale.
  const locale = useSyncExternalStore(subscribeLocale, getLocale, getLocale)
  return <App key={locale} />
}

const root = createRoot(document.getElementById('root')!)

initI18n().finally(() => {
  root.render(
    <StrictMode>
      <LocalizedApp />
    </StrictMode>,
  )
})
