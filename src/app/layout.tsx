// src/app/layout.tsx
"use client";

import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { I18nextProvider } from "react-i18next";
import i18n from "../app/lib/i18n";
import Providers from "@/app/providers/QueryProviders";

import { AuthProvider } from "@/components/providers/AuthProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <I18nextProvider i18n={i18n}>
          <Providers>
            <AuthProvider>
              <main>
                {children}
                <Toaster closeButton offset={{ top: "18px", right: "16px" }} />
              </main>
            </AuthProvider>
          </Providers>
        </I18nextProvider>
      </body>
    </html>
  );
}
