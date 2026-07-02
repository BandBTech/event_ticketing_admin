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
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="icon" href="/android-chrome-192x192.png" sizes="192x192" type="image/png" />
        <link rel="icon" href="/android-chrome-512x512.png" sizes="512x512" type="image/png" />
      </head>
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
