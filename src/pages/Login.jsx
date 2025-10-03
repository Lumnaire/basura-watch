import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [location, setLocation] = useState(""); // ✅ add location state
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [agreeTerms, setAgreeTerms] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        let authResponse;

        if (isSignUp) {
            authResponse = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName, location },
                },
            });

            const signedUpUser = authResponse.data.user;
            if (signedUpUser) {
                await supabase.from("profiles")
                    .update({
                        full_name: fullName,
                        location,
                    })
                    .eq("id", signedUpUser.id);
            }

        } else {
            authResponse = await supabase.auth.signInWithPassword({
                email,
                password,
            });
        }

        const { data, error: authError } = authResponse;
        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        const user = data.user || data.session?.user; // ✅ only declared once now


        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, email, is_admin")
            .eq("id", user.id)
            .single();

        if (profileError) {
            console.error("Profile fetch error:", profileError.message);
        } else {
            console.log("Fetched profile:", profile);
        }


        // ✅ Fetch the profile of the logged-in user

        if (user) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("is_admin")
                .eq("id", user.id)
                .single();

            if (profile?.is_admin) {
                navigate("/admin");
            } else {
                navigate("/dashboard");  // ✅ redirect non-admins to /
            }
        }

        setLoading(false);
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-blue-900">
            <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">
                    {isSignUp ? "Create Account" : "Welcome Back"}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignUp && (
                        <>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                            />

                            <input
                                type="text"
                                placeholder="#123 Santa Cruz St. Purok 6"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                            />
                        </>
                    )}

                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        type="password"
                        placeholder="Password (min 6 chars)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    />

                    {isSignUp && (
                        <div className="flex items-start space-x-2 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={() => setAgreeTerms(!agreeTerms)}
                                className="mt-1"
                            />
                            <span>
                                By signing up, you agree to our{" "}
                                <a href="/terms" className="text-blue-600 hover:underline">
                                    Terms & Conditions
                                </a>{" "}
                                and{" "}
                                <a href="/privacy" className="text-blue-600 hover:underline">
                                    Privacy Policy
                                </a>.
                            </span>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading || (isSignUp && !agreeTerms)}
                        className={`w-full ${loading || (isSignUp && !agreeTerms)
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                            } text-white py-2 rounded-xl font-semibold transition`}
                    >
                        {loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    {isSignUp ? "Already have an account?" : "Don’t have an account?"}{" "}
                    <button
                        className="text-blue-600 hover:underline font-semibold"
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setAgreeTerms(false);
                        }}
                    >
                        {isSignUp ? "Log In" : "Sign Up"}
                    </button>
                </p>
            </div>
        </div>
    );
}
