import { Link } from "react-router";
import ModeToggle from "@/components/ModeToggle";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold text-primary">
          RealEstate
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
            About
          </Link>
          <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">
            Login
          </Link>
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
