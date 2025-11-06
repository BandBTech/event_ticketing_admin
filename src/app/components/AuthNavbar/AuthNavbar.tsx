"use client"

// src/components/Navbar/Navbar.tsx
import React, { useState } from "react";
import { Ticket } from "lucide-react";
import LanguageButton from "@/app/components/LanguageButton/LanguageButton";
import { useRouter } from "next/navigation";

const AuthNavbar: React.FC = () => {
  const router = useRouter();
  const [language, setLanguage] = useState("English");

  const languages = ["English", "日本語", "Italian"];
  const handleOpen = () => router.push("/auth/login");
  return (
    <nav className="bg-white text-black flex justify-between py-2 px-4 items-center">
      <div onClick={handleOpen} className="flex font-bold text-xl text-black cursor-pointer"><span><Ticket className="mr-2 text-blue-500" /></span>Timro-Ticket</div>

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
