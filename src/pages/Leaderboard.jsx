import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Header from "../components/Header";

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        async function fetchLeaderboard() {
            const { data, error } = await supabase
                .from("profiles")
                .select("full_name, points")
                .order("points", { ascending: false })
                .limit(10);

            if (!error && data) {
                setLeaderboard(data);
            }
        }

        fetchLeaderboard();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="p-6 max-w-5xl mx-auto">
                {/* Title */}
                <h1 className="text-3xl font-bold text-blue-700 mb-2">
                    Leaderboard 2025 - Barangay Santa Cruz🏆
                </h1>
                <p className="text-gray-600 mb-6">
                    Recognizing our most disciplined waste segregators this year.
                </p>

                {/* Leaderboard Table */}
                {leaderboard.length > 0 ? (
                    <div className="overflow-x-auto bg-white rounded-xl shadow-md mb-10">
                        <table className="min-w-full text-left">
                            <thead className="bg-blue-600 text-white">
                                <tr>
                                    <th className="px-6 py-3">Rank</th>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((user, index) => (
                                    <tr
                                        key={user.full_name}
                                        className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                            }`}
                                    >
                                        <td className="px-6 py-4 font-bold text-blue-600">
                                            #{index + 1}
                                        </td>
                                        <td className="px-6 py-4">{user.full_name}</td>
                                        <td className="px-6 py-4">{user.points ?? 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded-lg shadow mb-10">
                        <p className="text-yellow-800 font-semibold">
                            📊 No leaderboard data yet. Start segregating and earning points today!
                        </p>
                    </div>
                )}

                {/* Rewards Section */}
                <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-green-700 mb-3">
                        🎁 Rewards for 2025 (Claim at Barangay Office)
                    </h2>
                    <ul className="space-y-3 text-gray-700">
                        <li>
                            🥇 <span className="font-semibold text-blue-700">Top 1:</span>{" "}
                            1 Sack of Rice
                        </li>
                        <li>
                            🥈 <span className="font-semibold text-blue-700">Top 2:</span>{" "}
                            Grocery Package
                        </li>
                        <li>
                            🥉 <span className="font-semibold text-blue-700">Top 3:</span>{" "}
                            Cooking Utensils Set
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
