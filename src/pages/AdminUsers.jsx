import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Menu, X, Plus, Minus, CheckCircle, XCircle, RefreshCw } from "lucide-react";

export default function AdminUsers() {
    const [adminProfile, setAdminProfile] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState({});
    const [pointsLoading, setPointsLoading] = useState({});
    const [pointsInput, setPointsInput] = useState({});
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();

            if (authError) {
                console.error("Auth error:", authError.message);
                navigate("/");
                return;
            }

            if (!user) {
                navigate("/");
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
                navigate("/dashboard");
                return;
            }

            setAdminProfile(profile);
            await fetchUsers();
        }

        fetchData();
    }, [navigate]);

    async function fetchUsers() {
        setRefreshing(true);
        try {
            const { data: usersData, error: usersError } = await supabase
                .from("profiles")
                .select("id, full_name, location, pickup_status, points, collected")
                .eq("is_admin", false)
                .order("full_name", { ascending: true });

            console.log("🔄 Fetched users from database:", usersData); // Debug log

            if (usersError) {
                console.error("❌ Users fetch error:", usersError.message);
                alert("Error fetching users: " + usersError.message);
                return;
            }

            if (usersData) {
                setUsers(usersData);
                // Initialize points input for each user
                const initialPointsInput = {};
                usersData.forEach(user => {
                    initialPointsInput[user.id] = user.points || 0;
                    console.log(`User ${user.full_name}: collected=${user.collected}, pickup_status=${user.pickup_status}`); // Debug log
                });
                setPointsInput(initialPointsInput);
            }
        } catch (error) {
            console.error("❌ Unexpected error:", error);
        } finally {
            setRefreshing(false);
        }
    }

    // Handle collection completion
    async function handleCollect(userId) {
        setLoading(prev => ({ ...prev, [userId]: true }));

        try {
            console.log(`🎯 Marking user ${userId} as collected...`);

            const { data, error } = await supabase
                .from("profiles")
                .update({
                    collected: true,
                    pickup_status: false // Reset pickup status after collection
                })
                .eq("id", userId)
                .select(); // Return the updated record

            if (error) {
                console.error("❌ Error updating collection:", error);
                alert("Error updating collection: " + error.message);
                return;
            }

            console.log("✅ Successfully updated:", data);

            // Update local state
            setUsers(prev => prev.map(user =>
                user.id === userId ? { ...user, collected: true, pickup_status: false } : user
            ));

        } catch (error) {
            console.error("❌ Unexpected error in handleCollect:", error);
        } finally {
            setLoading(prev => ({ ...prev, [userId]: false }));
        }
    }

    // Handle points update
    async function handlePointsUpdate(userId, points) {
        setPointsLoading(prev => ({ ...prev, [userId]: true }));

        try {
            console.log(`🎯 Updating points for user ${userId} to ${points}...`);

            const { data, error } = await supabase
                .from("profiles")
                .update({ points: parseInt(points) })
                .eq("id", userId)
                .select(); // Return the updated record

            if (error) {
                console.error("❌ Error updating points:", error);
                alert("Error updating points: " + error.message);
                return;
            }

            console.log("✅ Points updated successfully:", data);

            // Update local state
            setUsers(prev => prev.map(user =>
                user.id === userId ? { ...user, points: parseInt(points) } : user
            ));

            // Also update points input
            setPointsInput(prev => ({
                ...prev,
                [userId]: parseInt(points)
            }));

        } catch (error) {
            console.error("❌ Unexpected error in handlePointsUpdate:", error);
        } finally {
            setPointsLoading(prev => ({ ...prev, [userId]: false }));
        }
    }

    // Quick points adjustment
    async function handleQuickPoints(userId, change) {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const newPoints = Math.max(0, (user.points || 0) + change);
        await handlePointsUpdate(userId, newPoints);
    }

    // Reset all collections for a new day (admin function)
    async function resetAllCollections() {
        if (!window.confirm("Are you sure you want to reset all collections? This will allow users to request pickups again.")) {
            return;
        }

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    collected: false,
                    pickup_status: false
                })
                .eq("is_admin", false);

            if (error) {
                console.error("❌ Error resetting collections:", error);
                alert("Error resetting collections: " + error.message);
                return;
            }

            console.log("✅ All collections reset");
            await fetchUsers(); // Refresh the data
            alert("All collections have been reset successfully!");

        } catch (error) {
            console.error("❌ Unexpected error in resetAllCollections:", error);
        }
    }

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
                        href="/admin/leaderboard"
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
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-blue-700 mb-4 md:mb-0">
                        Users Management
                    </h1>
                    <div className="flex space-x-2">
                        <button
                            onClick={fetchUsers}
                            disabled={refreshing}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-semibold flex items-center space-x-2"
                        >
                            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                            <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
                        </button>
                        <button
                            onClick={resetAllCollections}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
                        >
                            Reset All Collections
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow-md rounded-xl overflow-hidden">
                    <table className="w-full table-auto border-collapse">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">Location</th>
                                <th className="px-4 py-3 text-left">Points</th>
                                <th className="px-4 py-3 text-left">Collection Status</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
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
                                            <div className="flex items-center space-x-2">
                                                {/* Quick Points Adjustment */}
                                                <button
                                                    onClick={() => handleQuickPoints(user.id, -1)}
                                                    disabled={pointsLoading[user.id]}
                                                    className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50 transition"
                                                >
                                                    <Minus size={16} />
                                                </button>

                                                <span className="font-bold text-blue-600 min-w-12 text-center">
                                                    {user.points || 0}
                                                </span>

                                                <button
                                                    onClick={() => handleQuickPoints(user.id, 1)}
                                                    disabled={pointsLoading[user.id]}
                                                    className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200 disabled:opacity-50 transition"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            {/* Points Input */}
                                            <div className="flex items-center space-x-2 mt-2">
                                                <input
                                                    type="number"
                                                    value={pointsInput[user.id] || 0}
                                                    onChange={(e) => setPointsInput(prev => ({
                                                        ...prev,
                                                        [user.id]: parseInt(e.target.value) || 0
                                                    }))}
                                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                                    min="0"
                                                />
                                                <button
                                                    onClick={() => handlePointsUpdate(user.id, pointsInput[user.id])}
                                                    disabled={pointsLoading[user.id]}
                                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 transition"
                                                >
                                                    {pointsLoading[user.id] ? "..." : "Set"}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.collected ? (
                                                <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 font-medium flex items-center space-x-1">
                                                    <CheckCircle size={16} />
                                                    <span>✅ Collected</span>
                                                </span>
                                            ) : user.pickup_status ? (
                                                <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 font-medium flex items-center space-x-1">
                                                    <CheckCircle size={16} />
                                                    <span>✅ Ready for Collection</span>
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700 font-medium flex items-center space-x-1">
                                                    <XCircle size={16} />
                                                    <span>🚫 Not Ready</span>
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.pickup_status && !user.collected ? (
                                                <button
                                                    onClick={() => handleCollect(user.id)}
                                                    disabled={loading[user.id]}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-semibold flex items-center space-x-2"
                                                >
                                                    {loading[user.id] ? (
                                                        <span>Processing...</span>
                                                    ) : (
                                                        <>
                                                            <CheckCircle size={16} />
                                                            <span>Mark Collected</span>
                                                        </>
                                                    )}
                                                </button>
                                            ) : user.collected ? (
                                                <span className="text-gray-500 italic">Already collected</span>
                                            ) : (
                                                <span className="text-gray-500 italic">Waiting for request</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="font-semibold text-gray-700">Total Users</h3>
                        <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="font-semibold text-gray-700">Ready for Collection</h3>
                        <p className="text-2xl font-bold text-green-600">
                            {users.filter(u => u.pickup_status && !u.collected).length}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="font-semibold text-gray-700">Collected Today</h3>
                        <p className="text-2xl font-bold text-blue-600">
                            {users.filter(u => u.collected).length}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}