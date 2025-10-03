import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function AdminUsers() {
    const [adminProfile, setAdminProfile] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();

            if (authError) {
                console.error("Auth error:", authError.message);
                navigate("/"); // not logged in
                return;
            }

            if (!user) {
                navigate("/"); // no user session
                return;
            }

            // ✅ get admin profile
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("id, full_name, is_admin")
                .eq("id", user.id)
                .single();

            if (profileError) {
                console.error("Profile fetch error:", profileError.message);
                navigate("/");
                return;
            }

            if (!profile.is_admin) {
                // ✅ block non-admins from seeing this page
                navigate("/dashboard");
                return;
            }

            setAdminProfile(profile);

            // ✅ fetch all non-admin users
            const { data: usersData, error: usersError } = await supabase
                .from("profiles")
                .select("id, full_name, location, pickup_status")
                .eq("is_admin", false)
                .order("full_name", { ascending: true });

            if (usersError) {
                console.error("Users fetch error:", usersError.message);
            } else {
                setUsers(usersData || []);
            }
        }

        fetchData();
    }, [navigate]);

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
                    className="fixed top-4 left-4 p-2 bg-blue-600 text-white rounded-md md:hidden z-50"
                >
                    <Menu size={24} />
                </button>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed md:static top-0 left-0 h-screen w-64 bg-gradient-to-b from-blue-700 to-blue-500 text-white flex flex-col p-6 shadow-xl transform transition-transform duration-300 z-40 ${menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                    }`}
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

                <nav className="flex flex-col space-y-4 text-sm font-medium flex-1">
                    <a
                        href="/admin"
                        className="hover:bg-blue-600 px-4 py-2 rounded-lg transition"
                    >
                        Dashboard
                    </a>
                    <a
                        href="/admin/users"
                        className="hover:bg-blue-600 px-4 py-2 rounded-lg transition bg-blue-800"
                    >
                        Users
                    </a>
                    <a
                        href="/leaderboard"
                        className="hover:bg-blue-600 px-4 py-2 rounded-lg transition"
                    >
                        Leaderboard
                    </a>
                </nav>

                <button
                    onClick={handleLogout}
                    className="mt-6 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-semibold transition"
                >
                    Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 overflow-x-auto">
                <h1 className="text-2xl md:text-3xl font-bold text-blue-700 mb-6">
                    Users
                </h1>

                <div className="bg-white shadow-md rounded-xl overflow-hidden">
                    <table className="w-full table-auto border-collapse">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">Location</th>
                                <th className="px-4 py-3 text-left">Collection Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="3"
                                        className="text-center py-6 text-gray-500"
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b hover:bg-gray-50 transition"
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            {user.full_name}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {user.location || "No location"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.pickup_status ? (
                                                <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 font-medium">
                                                    ✅ Ready for Collection
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700 font-medium">
                                                    🚫 Not Ready
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
