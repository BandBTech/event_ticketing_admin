// src/app/layout.tsx
"use client";

import "@/app/globals.css";
import { Toaster } from "react-hot-toast";
import { I18nextProvider } from "react-i18next";
import i18n from "../app/lib/i18n";
import Providers from "@/app/providers/QueryProviders";

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
            <main>
              {children}
              <Toaster position="top-right" reverseOrder={false} />
            </main>
          </Providers>
        </I18nextProvider>
      </body>
    </html>
  );
}
