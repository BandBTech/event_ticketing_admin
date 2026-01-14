"use client"

// src/components/Navbar/Navbar.tsx
import React, { useState } from "react";
import { Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { LanguageSelector } from "../LanguageSelector/LanguageSelector";

const AuthNavbar: React.FC = () => {
  const router = useRouter();
  const handleOpen = () => router.push("/auth/login");
  return (
    <nav className="bg-white text-black flex justify-between py-2 px-4 items-center">
      <div onClick={handleOpen} className="flex font-bold text-xl text-black cursor-pointer"><span><Ticket className="mr-2 text-blue-500" /></span>Timro-Ticket</div>

      <div className="">
        <LanguageSelector />
      </div>
    </nav>
  );
};

export default AuthNavbar;
