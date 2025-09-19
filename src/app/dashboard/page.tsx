import Navbar from "../components/Navbar/Navbar";

export default function DashboardPage() {
  return (
    <div className="">
      <Navbar/>
      <div className="mt-2">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600">Manage your account and app settings here.</p>
      </div>
    </div>
  );
}
