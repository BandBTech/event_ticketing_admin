// src/app/layout.tsx
import "@/app/globals.css";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        {/* <Navbar /> */}
        <main className="">
          {children}
          <Toaster position="top-right" reverseOrder={false} />
        </main>
      </body>
    </html>
  );
}
