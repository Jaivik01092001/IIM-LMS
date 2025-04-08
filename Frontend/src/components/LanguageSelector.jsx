import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSelector() {
  const { i18n } = useTranslation();
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
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          id="language-menu"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          {i18n.language === 'en' && 'English'}
          {i18n.language === 'hi' && 'हिन्दी'}
          {i18n.language === 'gu' && 'ગુજરાતી'}
          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-50" role="menu" aria-orientation="vertical" aria-labelledby="language-menu">
          <div className="py-1" role="none">
            <button
              onClick={() => changeLanguage('en')}
              className={`${i18n.language === 'en' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'} flex items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-50`}
              role="menuitem"
            >
              <span className="flex-shrink-0 mr-3 h-5 w-5 text-blue-500">
                {i18n.language === 'en' && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              English
            </button>
            <button
              onClick={() => changeLanguage('hi')}
              className={`${i18n.language === 'hi' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'} flex items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-50`}
              role="menuitem"
            >
              <span className="flex-shrink-0 mr-3 h-5 w-5 text-blue-500">
                {i18n.language === 'hi' && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              हिन्दी
            </button>
            <button
              onClick={() => changeLanguage('gu')}
              className={`${i18n.language === 'gu' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'} flex items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-50`}
              role="menuitem"
            >
              <span className="flex-shrink-0 mr-3 h-5 w-5 text-blue-500">
                {i18n.language === 'gu' && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              ગુજરાતી
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
