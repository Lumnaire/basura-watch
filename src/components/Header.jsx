import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    async function handleLogout() {
        await supabase.auth.signOut();
        navigate("/");
    }

    return (
        <header className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 text-white px-6 py-4 shadow-md rounded-b-2xl relative">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
                {/* Logo / Title */}
                <h1
                    className="text-2xl md:text-3xl font-extrabold tracking-wide cursor-pointer"
                    onClick={() => navigate("/dashboard")}
                >
                    Basura<span className="text-yellow-300">Watch</span>
                </h1>

                {/* Desktop Nav */}
                <nav className="hidden md:flex space-x-6 text-sm font-medium items-center">
                    <Link to="/dashboard" className="hover:text-yellow-300 transition">
                        Dashboard
                    </Link>
                    <Link to="/leaderboard" className="hover:text-yellow-300 transition">
                        Leaderboard
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="ml-4 bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-sm font-semibold transition"
                    >
                        Logout
                    </button>
                </nav>

                {/* Mobile Hamburger */}
                <button
                    className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        {menuOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Dropdown Menu with animation */}
            <div
                className={`absolute top-full left-0 w-full bg-blue-700 text-white flex flex-col md:hidden shadow-lg rounded-b-2xl z-50 overflow-hidden transition-all duration-500 ease-in-out ${menuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <Link
                    to="/dashboard"
                    className="px-6 py-3 hover:bg-blue-600 transition"
                    onClick={() => setMenuOpen(false)}
                >
                    Dashboard
                </Link>
                <Link
                    to="/leaderboard"
                    className="px-6 py-3 hover:bg-blue-600 transition"
                    onClick={() => setMenuOpen(false)}
                >
                    Leaderboard
                </Link>
                <button
                    onClick={handleLogout}
                    className="px-6 py-3 text-left hover:bg-red-600 transition"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}
