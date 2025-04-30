import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import '../../assets/styles/LanguageSelector.css';

/**
 * Language selector component for switching between supported languages
 */
const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng); // Ensure language is saved to localStorage
    setIsOpen(false);

    // Force reload of the page to ensure all components update
    window.location.reload();
  };

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="language-selector-button"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg className="language-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span className="language-name">
          {i18n.language === 'en' && t('language.english')}
          {i18n.language === 'hi' && t('language.hindi')}
          {i18n.language === 'gu' && t('language.gujarati')}
        </span>
        <svg className="dropdown-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="language-dropdown" role="menu" aria-orientation="vertical">
          <div className="language-options" role="none">
            <button
              onClick={() => changeLanguage('en')}
              className={`language-option ${i18n.language === 'en' ? 'active' : ''}`}
              role="menuitem"
            >
              <span className="language-check">
                {i18n.language === 'en' && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              {t('language.english')}
            </button>
            <button
              onClick={() => changeLanguage('hi')}
              className={`language-option ${i18n.language === 'hi' ? 'active' : ''}`}
              role="menuitem"
            >
              <span className="language-check">
                {i18n.language === 'hi' && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              {t('language.hindi')}
            </button>
            <button
              onClick={() => changeLanguage('gu')}
              className={`language-option ${i18n.language === 'gu' ? 'active' : ''}`}
              role="menuitem"
            >
              <span className="language-check">
                {i18n.language === 'gu' && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              {t('language.gujarati')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
