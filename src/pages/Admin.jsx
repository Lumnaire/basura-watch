import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Menu, X } from "lucide-react";

export default function Admin() {
    const [adminProfile, setAdminProfile] = useState(null);
    const [totalUsers, setTotalUsers] = useState(0);
    const [activeCollectors, setActiveCollectors] = useState(0);
    const [monthlyData, setMonthlyData] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchAdmin() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", user.id)
                    .single();

                if (!error) setAdminProfile(data);
            }
        }

        async function fetchAnalytics() {
            // ✅ Total Users
            const { count } = await supabase
                .from("profiles")
                .select("*", { count: "exact", head: true });
            setTotalUsers(count || 0);

            // ✅ Active Collectors (admins)
            const { count: adminCount } = await supabase
                .from("profiles")
                .select("*", { count: "exact", head: true })
                .eq("is_admin", true);
            setActiveCollectors(adminCount || 0);

            // ✅ Mock Monthly Data
            const mockMonthly = [
                { month: "Jan", collected: 15 },
                { month: "Feb", collected: 20 },
                { month: "Mar", collected: 12 },
                { month: "Apr", collected: 18 },
                { month: "May", collected: 25 },
                { month: "Jun", collected: 22 },
                { month: "Jul", collected: 30 },
                { month: "Aug", collected: 28 },
                { month: "Sep", collected: 35 },
                { month: "Oct", collected: 40 },
                { month: "Nov", collected: 38 },
                { month: "Dec", collected: 42 },
            ];
            setMonthlyData(mockMonthly);
        }

        fetchAdmin();
        fetchAnalytics();
    }, []);

    async function handleLogout() {
        await supabase.auth.signOut();
        navigate("/");
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile Hamburger */}
            {!menuOpen && (
                <button
                    onClick={() => setMenuOpen(true)}
                    className="fixed top-4 right-4 p-2 bg-blue-600 text-white rounded-md md:hidden z-50 shadow-lg"
                >
                    <Menu size={24} />
                </button>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed md:static top-0 left-0 h-screen w-64 bg-gradient-to-b from-blue-700 to-blue-500 text-white flex flex-col p-6 shadow-xl transform transition-transform duration-300 z-40 
          ${menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
            >
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-2xl font-extrabold">
                        Basura<span className="text-yellow-300">Watch</span>
                    </h1>
                    <button
                        onClick={() => setMenuOpen(false)}
                        className="md:hidden p-2 bg-blue-600 rounded-md"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-10">
                    <p className="text-sm opacity-80">Admin</p>
                    <p className="text-lg font-semibold">
                        {adminProfile?.full_name || "Loading..."}
                    </p>
                </div>

                <nav className="flex flex-col space-y-4 text-sm font-medium flex-1 overflow-y-auto">
                    <Link
                        to="/admin"
                        className="hover:bg-blue-600 px-4 py-2 rounded-lg transition"
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/admin/users"
                        className="hover:bg-blue-600 px-4 py-2 rounded-lg transition"
                    >
                        Users
                    </Link>
                    <Link
                        to="admin/leaderboard"
                        className="hover:bg-blue-600 px-4 py-2 rounded-lg transition"
                    >
                        Leaderboard
                    </Link>
                </nav>

                <button
                    onClick={handleLogout}
                    className="mt-6 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-semibold transition"
                >
                    Logout
                </button>
            </aside>

            {/* Overlay for mobile */}
            {menuOpen && (
                <div
                    onClick={() => setMenuOpen(false)}
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                ></div>
            )}

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10">
                <h1 className="text-2xl md:text-3xl font-bold text-blue-700 mb-6">
                    Admin Dashboard
                </h1>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                    <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 text-center">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-700">
                            Total Users
                        </h2>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">
                            {totalUsers}
                        </p>
                    </div>

                    <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 text-center">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-700">
                            Monthly Collected
                        </h2>
                        <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">
                            {monthlyData.reduce((acc, curr) => acc + curr.collected, 0)}
                        </p>
                    </div>

                    <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 text-center">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-700">
                            Active Collectors
                        </h2>
                        <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-2">
                            {activeCollectors}
                        </p>
                    </div>
                </div>

                {/* Line Chart Section */}
                <div className="bg-white shadow-md rounded-xl p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-blue-600 mb-4">
                        Monthly Collection Overview
                    </h2>
                    <div className="w-full h-64 sm:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="collected"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </main>
        </div>
    );
}
