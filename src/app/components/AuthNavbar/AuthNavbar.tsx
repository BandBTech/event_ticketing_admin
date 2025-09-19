"use client"

// src/components/Navbar/Navbar.tsx
import React, { useState } from "react";
import Link from "next/link";
import LanguageButton from "@/app/components/LanguageButton/LanguageButton";

const AuthNavbar: React.FC = () => {
  const [language, setLanguage] = useState("English");

  const languages = ["English", "Nepali", "Spanish", "French"];
  return (
    <nav className="bg-white text-black flex justify-between py-2 px-4 items-center">
      <div className="font-bold text-blue-500">Mero Ticket</div>

      <div className="">
        <LanguageButton
          languages={languages}
          selectedLanguage={language}
          onSelectLanguage={setLanguage}
        />
      </div>
    </nav>
  );
};

export default AuthNavbar;
