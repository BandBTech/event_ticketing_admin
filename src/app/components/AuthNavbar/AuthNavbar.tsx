"use client";

// src/components/Navbar/Navbar.tsx
import React from "react";
import { Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { LanguageSelector } from "../LanguageSelector/LanguageSelector";
import logo from "../../../../public/timro-ticket-logo.png";
import Image from "next/image";

const AuthNavbar: React.FC = () => {
  const router = useRouter();
  const handleOpen = () => router.push("/auth/login");
  return (
    <nav className="bg-white text-black flex justify-between py-2 px-4 items-center">
      <div
        onClick={handleOpen}
        className="flex font-bold text-xl text-black cursor-pointer"
      >
        <Image
          onClick={() => router.push("/dashboard")}
          src={logo}
          alt="Logo"
          className="w-40 px-2"
        />
      </div>

      <div className="">
        <LanguageSelector />
      </div>
    </nav>
  );
};

export default AuthNavbar;
