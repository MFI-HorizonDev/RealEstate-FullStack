import { Outlet } from "react-router";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Sidebar />
      <main className="flex-1 ml-64 mt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
