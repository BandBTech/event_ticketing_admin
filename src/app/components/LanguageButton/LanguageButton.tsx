import React, { useState } from 'react';
import { Globe } from 'lucide-react';

interface LanguageButtonProps {
  languages: string[]; // List of languages to display
  selectedLanguage: string; // Currently selected language
  onSelectLanguage: (language: string) => void; // Callback when a language is selected
}

const LanguageButton: React.FC<LanguageButtonProps> = ({
  languages,
  selectedLanguage,
  onSelectLanguage,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const handleSelect = (language: string) => {
    onSelectLanguage(language);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={toggleDropdown}
        className="inline-flex justify-center w-full px-4 py-2  text-gray-700 font-medium rounded-md focus:outline-none border-1"
      >
        <Globe className="mr-2" />
        {selectedLanguage}
        <svg
          className="-mr-1 ml-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language}
                onClick={() => handleSelect(language)}
                className={`block w-full text-left px-2 py-1 text-sm ${
                  language === selectedLanguage ? 'bg-blue-100 text-blue-900' : 'text-gray-700'
                } hover:bg-blue-200`}
              >
                {language}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageButton;
