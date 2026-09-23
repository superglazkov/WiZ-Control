import i18n from '@i18n'

// This release intentionally ships an English-only user interface.
export default function initializeLanguage(_app: Electron.App): void {
  void i18n.changeLanguage('en')
}
