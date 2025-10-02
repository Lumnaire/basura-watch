import { useEffect, useState } from "react";
import Header from "../components/Header";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
    const [profile, setProfile] = useState(null);
    const [today, setToday] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);

    // Collection schedule
    const schedule = {
        Monday: "Plastic",
        Tuesday: "Biodegradable",
        Friday: "Non-Biodegradable",
    };

    // Fetch profile + leaderboard
    useEffect(() => {
        async function fetchProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("profiles")
                .select("id, full_name, location, pickup_status, points")
                .eq("id", user.id)
                .single();

            if (!error) setProfile(data);
        }

        async function fetchLeaderboard() {
            const { data, error } = await supabase
                .from("profiles")
                .select("id, full_name, points")
                .order("points", { ascending: false })
                .limit(10);

            if (!error && data) {
                setLeaderboard(data);
            }
        }

        fetchProfile();
        fetchLeaderboard();
    }, []);

    // Calendar info
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = days[today.getDay()];
    const collectionToday = schedule[todayName] || "No Collection Today";
    const isCollectionDay = Object.keys(schedule).includes(todayName);

    // Handle pickup request
    async function handlePickupRequest() {
        if (!profile) return;
        setLoading(true);

        const { error } = await supabase
            .from("profiles")
            .update({ pickup_status: true })
            .eq("id", profile.id);

        if (!error) {
            setProfile({ ...profile, pickup_status: true });
        }

        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="p-6 max-w-5xl mx-auto">
                {/* Welcome Section */}
                <h1 className="text-2xl md:text-3xl font-bold text-blue-700 mb-2">
                    Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}! 👋
                </h1>
                <p className="text-gray-600 mb-4">
                    Today is <span className="font-semibold">{today.toDateString()}</span> —{" "}
                    <span className="text-blue-600 font-semibold">{collectionToday}</span>
                </p>

                {/* ✅ Reminder Card */}
                <div className="mb-6 p-5 border-l-4 border-green-500 bg-green-50 rounded-lg shadow-sm">
                    <h2 className="text-lg md:text-xl font-bold text-green-700 mb-1">
                        ♻️ Reminder for Today
                    </h2>
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                        Please ensure your{" "}
                        <span className="font-semibold text-green-800">trash is properly segregated</span>{" "}
                        before the collectors arrive. Following the waste management standards will earn you{" "}
                        <span className="font-semibold text-green-800">points</span> from collectors
                        — boosting your standing on the <span className="text-blue-600">leaderboard</span>.
                    </p>
                </div>

                {/* Location */}
                {profile?.location && (
                    <p className="text-gray-700 mb-6">
                        📍 Your location: <span className="font-medium">{profile.location}</span>
                    </p>
                )}

                {/* Pickup Button */}
                <div className="mb-8">
                    {isCollectionDay ? (
                        <button
                            onClick={handlePickupRequest}
                            disabled={loading || profile?.pickup_status}
                            className={`px-6 py-3 rounded-xl font-semibold transition w-full sm:w-auto ${profile?.pickup_status
                                ? "bg-green-500 text-white cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                        >
                            {profile?.pickup_status ? "✅ Pickup Requested" : "🚛 Collect My Trash"}
                        </button>
                    ) : (
                        <button
                            disabled
                            className="px-6 py-3 rounded-xl font-semibold bg-gray-400 text-white cursor-not-allowed w-full sm:w-auto"
                        >
                            🚫 Not a collection day
                        </button>
                    )}
                </div>

                {/* Calendar Section */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-center mb-10">
                    {days.map((day) => {
                        const isToday = day === todayName;
                        const type = schedule[day];

                        return (
                            <div
                                key={day}
                                className={`p-4 rounded-xl shadow-sm border transition ${isToday
                                    ? "bg-blue-600 text-white border-blue-700"
                                    : type
                                        ? "bg-green-100 border-green-300 text-green-800"
                                        : "bg-gray-100 border-gray-300 text-gray-600"
                                    }`}
                            >
                                <p className="font-semibold">{day.slice(0, 3)}</p>
                                <p className="text-sm">{type ? type : "—"}</p>
                                {isToday && <p className="mt-1 text-xs">(Today)</p>}
                            </div>
                        );
                    })}
                </div>

                {/* Leaderboard Section */}
                <div className="bg-white shadow-md rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-bold text-blue-700 mb-4">
                        🏆 Leaderboard — {new Date().getFullYear()}
                    </h2>
                    {leaderboard.length === 0 ? (
                        <p className="text-gray-500 text-center">No one is on the leaderboard yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-blue-100 text-left">
                                        <th className="px-4 py-2">Rank</th>
                                        <th className="px-4 py-2">Name</th>
                                        <th className="px-4 py-2">Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.map((user, index) => (
                                        <tr
                                            key={user.id}
                                            className="border-b hover:bg-gray-50 transition"
                                        >
                                            <td className="px-4 py-2 font-semibold text-blue-600">
                                                #{index + 1}
                                            </td>
                                            <td className="px-4 py-2">{user.full_name}</td>
                                            <td className="px-4 py-2 font-bold text-gray-700">
                                                {user.points || 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Rewards Section */}
                <div className="bg-green-50 border-l-4 border-green-500 rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-green-700 mb-3">🎁 Rewards for 2025 (Claim at Barangay Office)</h2>
                    <ul className="space-y-2 text-gray-700">
                        <li>
                            🥇 <span className="font-semibold">Top 1</span> — 1 Sack of Rice
                        </li>
                        <li>
                            🥈 <span className="font-semibold">Top 2</span> — Grocery Package
                        </li>
                        <li>
                            🥉 <span className="font-semibold">Top 3</span> — Cooking Utensils
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
