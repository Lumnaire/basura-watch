import { useEffect, useState } from "react";
import Header from "../components/Header";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
    const [profile, setProfile] = useState(null);
    const [today, setToday] = useState(new Date());
    const [loading, setLoading] = useState(false);

    // Collection schedule
    const schedule = {
        Monday: "Plastic",
        Tuesday: "Biodegradable",
        Friday: "Non-Biodegradable",
    };

    // Fetch profile
    useEffect(() => {
        async function fetchProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("profiles")
                .select("id, full_name, location, pickup_status")
                .eq("id", user.id)
                .single();

            if (!error) setProfile(data);
        }

        fetchProfile();
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
        <div>
            <Header />
            <div className="p-6 max-w-4xl mx-auto">
                {/* Welcome Section */}
                <h1 className="text-2xl font-bold text-blue-700 mb-2">
                    Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}! 👋
                </h1>
                <p className="text-gray-600 mb-6">
                    Today is <span className="font-semibold">{today.toDateString()}</span> —{" "}
                    <span className="text-blue-600 font-semibold">{collectionToday}</span>
                </p>

                {/* Location */}
                {profile?.location && (
                    <p className="text-gray-700 mb-4">
                        📍 Your location: <span className="font-medium">{profile.location}</span>
                    </p>
                )}

                {/* Pickup Button */}
                <div className="mb-6">
                    {isCollectionDay ? (
                        <button
                            onClick={handlePickupRequest}
                            disabled={loading || profile?.pickup_status}
                            className={`px-6 py-3 rounded-xl font-semibold transition ${profile?.pickup_status
                                ? "bg-green-500 text-white cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                        >
                            {profile?.pickup_status ? "✅ Pickup Requested" : "🚛 Collect My Trash"}
                        </button>
                    ) : (
                        <button
                            disabled
                            className="px-6 py-3 rounded-xl font-semibold bg-gray-400 text-white cursor-not-allowed"
                        >
                            🚫 Not a collection day
                        </button>
                    )}
                </div>

                {/* Calendar Section */}
                <div className="grid grid-cols-7 gap-2 text-center">
                    {days.map((day) => {
                        const isToday = day === todayName;
                        const type = schedule[day];

                        return (
                            <div
                                key={day}
                                className={`p-4 rounded-xl shadow-md border ${isToday
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
            </div>
        </div>
    );
}
