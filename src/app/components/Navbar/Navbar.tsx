// src/components/Navbar/Navbar.tsx
import Link from "next/link";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white text-black p-4 space-x-4 flex justify-between">
      <div>Good Evening John Doe !</div>
      <div className="flex gap-10">

      <h1>Create New Event</h1>
      <h1>English</h1>
      </div>
    </nav>
  );
};

export default Navbar;
