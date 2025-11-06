// src/app/dashboard/layout.tsx
import AuthNavbar from "@/app/components/AuthNavbar/AuthNavbar"
import AuthFooter from "@/app/components/AuthFooter/AuthFooter"

export default function AuthsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col ">
      <AuthNavbar />
      <main className="flex-1 flex items-center justify-center">{children}</main>
      <AuthFooter />
    </div>
  )
}
