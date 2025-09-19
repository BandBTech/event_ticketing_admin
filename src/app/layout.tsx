// src/app/layout.tsx
import Navbar from "@/app/components/Navbar/Navbar";
import "@/app/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        {/* <Navbar /> */}
        <main className="">{children}</main>
      </body>
    </html>
  );
}
