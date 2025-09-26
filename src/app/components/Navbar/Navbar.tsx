"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Globe, ChevronRight, Plus } from "lucide-react";
import LanguageButton from "../LanguageButton/LanguageButton";

interface NavbarProps {
  title: string;
  addMessage: string;
  handleOpen: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ title, addMessage, handleOpen }) => {
  const [searchQuery, setSearchQuery] = useState("");
    const [language, setLanguage] = useState("English");
  
    const languages = ["English", "Japanese", "Italian", "Danish"];

  const handleCreateEvent = () => {
    handleOpen();
  };

  return (
    <nav className="bg-white text-black p-4 space-x-4 flex justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center space-x-3 gap-4">
{addMessage && (
          <button
          type="button"
          onClick={handleOpen}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">{addMessage}</span>
        </button>
)}

        {/* <div className="flex items-center space-x-2 text-gray-600">
          <Globe className="h-4 w-4" />
          <span className="text-sm">English</span>
          <ChevronRight className="h-3 w-3" />
        </div> */}

              <div className="flex items-center space-x-2 text-gray-600">
        <LanguageButton
          languages={languages}
          selectedLanguage={language}
          onSelectLanguage={setLanguage}
        />
      </div>
      </div>
    </nav>
  );
};

export default Navbar;
