import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Header from "../components/Header";

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [countdown, setCountdown] = useState("");
    const [seasonEnded, setSeasonEnded] = useState(false);

    // Countdown timer function
    const updateCountdown = () => {
        const currentYear = new Date().getFullYear();
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59); // Dec 31 of current year

        const now = new Date();
        const timeLeft = endOfYear - now;

        if (timeLeft <= 0) {
            setCountdown("Season ended! 🎉");
            setSeasonEnded(true);
            return;
        }

        // Calculate months, days, hours, minutes, seconds
        const months = Math.floor(timeLeft / (1000 * 60 * 60 * 24 * 30.44));
        const days = Math.floor((timeLeft % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        // Format the countdown string
        let countdownString = "";
        if (months > 0) {
            countdownString += `${months} month${months !== 1 ? 's' : ''} `;
        }
        if (days > 0) {
            countdownString += `${days} day${days !== 1 ? 's' : ''} `;
        }
        if (months === 0) { // Only show hours if less than a month left
            countdownString += `${hours}h ${minutes}m ${seconds}s`;
        } else {
            countdownString += `${hours}h`;
        }

        setCountdown(countdownString.trim());
        setSeasonEnded(false);
    };

    useEffect(() => {
        async function fetchLeaderboard() {
            const { data, error } = await supabase
                .from("profiles")
                .select("full_name, points")
                .eq("is_admin", false) // Exclude admins from leaderboard
                .order("points", { ascending: false })
                .limit(10);

            if (!error && data) {
                setLeaderboard(data);
            }
        }

        fetchLeaderboard();

        // Initialize countdown
        updateCountdown();

        // Update countdown every second
        const countdownInterval = setInterval(updateCountdown, 1000);

        return () => clearInterval(countdownInterval);
    }, []);

    // Get current year and next year for display
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="p-6 max-w-5xl mx-auto">
                {/* Title and Countdown */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-blue-700 mb-2">
                            {seasonEnded ? "🏆 Final Leaderboard" : "🏆 Leaderboard"} {currentYear} - Barangay Santa Cruz
                        </h1>
                        <p className="text-gray-600">
                            {seasonEnded
                                ? "The season has ended! Congratulations to our winners! 🎉"
                                : "Recognizing our most disciplined waste segregators this year."
                            }
                        </p>
                    </div>

                    {/* Countdown Timer */}
                    <div className={`mt-4 lg:mt-0 px-4 py-3 rounded-lg border font-semibold text-center ${seasonEnded
                            ? "bg-green-100 border-green-400 text-green-800"
                            : "bg-red-100 border-red-300 text-red-700"
                        }`}>
                        <div className="text-sm">
                            {seasonEnded ? "🎉 Season Completed" : "⏳ Season Ends In"}
                        </div>
                        <div className="text-lg">
                            {seasonEnded ? "Thank you for participating!" : countdown}
                        </div>
                    </div>
                </div>

                {/* Season Ended Banner */}
                {seasonEnded && (
                    <div className="mb-6 p-5 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold mb-2">🎊 Season {currentYear} Has Concluded!</h2>
                                <p className="opacity-90">
                                    The waste management competition for {currentYear} has ended.
                                    Winners can claim their rewards at the Barangay Office starting January 1st, {nextYear}.
                                </p>
                            </div>
                            <div className="text-4xl">🏆</div>
                        </div>
                    </div>
                )}

                {/* Leaderboard Table */}
                {leaderboard.length > 0 ? (
                    <div className="overflow-x-auto bg-white rounded-xl shadow-md mb-10">
                        <table className="min-w-full text-left">
                            <thead className="bg-blue-600 text-white">
                                <tr>
                                    <th className="px-6 py-4">Rank</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((user, index) => {
                                    // Add special styling for top 3 winners
                                    const isTopThree = index < 3;
                                    const rankColors = [
                                        "bg-yellow-100 border-l-4 border-yellow-400", // 1st place
                                        "bg-gray-100 border-l-4 border-gray-400",     // 2nd place  
                                        "bg-orange-100 border-l-4 border-orange-400", // 3rd place
                                    ];

                                    return (
                                        <tr
                                            key={user.full_name}
                                            className={`border-b transition-all ${isTopThree
                                                    ? `${rankColors[index]} font-bold`
                                                    : index % 2 === 0
                                                        ? "bg-gray-50"
                                                        : "bg-white"
                                                } ${seasonEnded && isTopThree ? 'animate-pulse' : ''}`}
                                        >
                                            <td className="px-6 py-4 font-bold">
                                                <div className="flex items-center space-x-2">
                                                    {index === 0 && <span className="text-2xl">🥇</span>}
                                                    {index === 1 && <span className="text-2xl">🥈</span>}
                                                    {index === 2 && <span className="text-2xl">🥉</span>}
                                                    <span className={`${index === 0 ? 'text-yellow-600' :
                                                            index === 1 ? 'text-gray-600' :
                                                                index === 2 ? 'text-orange-600' :
                                                                    'text-blue-600'
                                                        }`}>
                                                        #{index + 1}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <span className={`${isTopThree ? 'text-lg' : ''
                                                        }`}>
                                                        {user.full_name}
                                                    </span>
                                                    {seasonEnded && isTopThree && (
                                                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                                                            Winner 🎉
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-700">
                                                {user.points ?? 0}
                                            </td>
                                        </tr>
                                    );
                                })}
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
                <div className={`border-l-4 p-6 rounded-lg shadow-md ${seasonEnded
                        ? "bg-blue-50 border-blue-500"
                        : "bg-green-50 border-green-500"
                    }`}>
                    <h2 className={`text-xl font-bold mb-3 ${seasonEnded ? "text-blue-700" : "text-green-700"
                        }`}>
                        {seasonEnded ? "🎁 Rewards Claim Period" : "🎁 Rewards for " + nextYear}
                    </h2>

                    {seasonEnded ? (
                        <div className="space-y-4">
                            <p className="text-gray-700 mb-4">
                                <strong>Congratulations to our winners! 🎊</strong><br />
                                Prize claiming will be available from <strong>January 1st to January 31st, {nextYear}</strong>
                                at the Barangay Office during office hours (8:00 AM - 5:00 PM).
                            </p>
                            <div className="bg-white p-4 rounded-lg border">
                                <h3 className="font-bold text-gray-800 mb-2">📋 Required Documents for Claiming:</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                                    <li>Valid ID (any government-issued ID)</li>
                                    <li>Proof of residence (Barangay ID or utility bill)</li>
                                    <li>Claiming stub (will be provided)</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-center space-x-3">
                                <span className="text-2xl">🥇</span>
                                <div>
                                    <span className="font-semibold text-blue-700">Top 1:</span>
                                    <span className="ml-2">1 Sack of Rice + Certificate of Recognition</span>
                                </div>
                            </li>
                            <li className="flex items-center space-x-3">
                                <span className="text-2xl">🥈</span>
                                <div>
                                    <span className="font-semibold text-blue-700">Top 2:</span>
                                    <span className="ml-2">Grocery Package + Certificate of Recognition</span>
                                </div>
                            </li>
                            <li className="flex items-center space-x-3">
                                <span className="text-2xl">🥉</span>
                                <div>
                                    <span className="font-semibold text-blue-700">Top 3:</span>
                                    <span className="ml-2">Cooking Utensils Set + Certificate of Recognition</span>
                                </div>
                            </li>
                            <li className="text-sm text-gray-600 mt-4 p-3 bg-white rounded border">
                                💡 <strong>Note:</strong> Rewards can be claimed at the Barangay Office from January 1st to January 31st, {nextYear}.
                            </li>
                        </ul>
                    )}
                </div>

                {/* Additional Info */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="font-bold text-gray-800 mb-2">📅 Competition Period</h3>
                        <p className="text-gray-600 text-sm">
                            The competition runs from <strong>January 1st to December 31st, {currentYear}</strong>.
                            Points reset at the start of each year.
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="font-bold text-gray-800 mb-2">⭐ How to Earn Points</h3>
                        <p className="text-gray-600 text-sm">
                            Points are awarded by collectors for proper waste segregation.
                            Keep your trash properly sorted on collection days!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}