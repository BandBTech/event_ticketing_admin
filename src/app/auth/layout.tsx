// src/app/dashboard/layout.tsx
import AuthNavbar from "@/app/components/AuthNavbar/AuthNavbar"

export default function AuthsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white text-gray-900">
      <AuthNavbar />
      <main>{children}</main>
    </div>
  )
}
