import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language files
import enTranslation from './locales/en.json';
import hiTranslation from './locales/hi.json';
import guTranslation from './locales/gu.json';

const resources = {
  en: {
    translation: enTranslation
  },
  hi: {
    translation: hiTranslation
  },
  gu: {
    translation: guTranslation
  }
};

i18n
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: false, // Disable debug mode to prevent missing key warnings
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
      wait: true
    }
  });

// Force a reload when language changes
i18n.on('languageChanged', () => {
  document.documentElement.lang = i18n.language;
  document.documentElement.dir = i18n.dir(i18n.language);
});

export default i18n;
