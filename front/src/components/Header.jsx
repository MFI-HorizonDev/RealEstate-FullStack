import { Link } from "react-router";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold text-blue-800">
          RealEstate
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/" className="text-gray-600 hover:text-blue-800">
            Home
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-blue-800">
            About
          </Link>
          <Link to="/login" className="text-gray-600 hover:text-blue-800">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
