export default function Header() {
    return (
        <header className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 text-white px-6 py-4 shadow-md rounded-b-2xl">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
                {/* Logo / Title */}
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">
                    Basura<span className="text-yellow-300">Watch</span>
                </h1>

                {/* Nav (optional for later) */}
                <nav className="hidden md:flex space-x-6 text-sm font-medium">
                    <a href="/dashboard" className="hover:text-yellow-300 transition">
                        Dashboard
                    </a>
                    <a href="/leaderboard" className="hover:text-yellow-300 transition">
                        Leaderboard
                    </a>
                    <a href="/admin" className="hover:text-yellow-300 transition">
                        Admin
                    </a>
                </nav>

                {/* Mobile Menu (Hamburger placeholder for now) */}
                <button className="md:hidden p-2 rounded-lg hover:bg-white/10 transition">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </header>
    );
}
