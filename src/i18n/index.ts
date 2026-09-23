import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '@resources/locales/en/translation.json'

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en'],
    debug: false,
    resources: { en: { translation: en } },
    interpolation: { escapeValue: false }
  })
}

export default i18n
