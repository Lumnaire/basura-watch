import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [location, setLocation] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                console.log("🔄 Starting signup process...");
                console.log("📝 Form data:", { email, fullName, location });

                // Handle Sign Up
                const { data, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            location: location
                        },
                    },
                });

                console.log("🔐 Auth response:", data);
                console.log("❌ Auth error:", authError);

                if (authError) {
                    setError(authError.message);
                    setLoading(false);
                    return;
                }

                if (data.user) {
                    console.log("✅ User created successfully:", data.user.id);

                    // Create profile in profiles table with better error handling
                    try {
                        const { data: profileData, error: profileError } = await supabase
                            .from("profiles")
                            .upsert({
                                id: data.user.id,
                                email: data.user.email,
                                full_name: fullName,
                                location: location,
                                is_admin: false,
                                points: 0,
                                pickup_status: false,
                                collected: false,
                                created_at: new Date().toISOString(),
                            })
                            .select(); // Return the created profile

                        console.log("📊 Profile creation response:", profileData);
                        console.log("❌ Profile creation error:", profileError);

                        if (profileError) {
                            console.error("❌ Profile creation failed:", profileError);
                            // Try alternative approach - insert instead of upsert
                            const { error: insertError } = await supabase
                                .from("profiles")
                                .insert({
                                    id: data.user.id,
                                    email: data.user.email,
                                    full_name: fullName,
                                    location: location,
                                    is_admin: false,
                                    points: 0,
                                    pickup_status: false,
                                    collected: false,
                                    created_at: new Date().toISOString(),
                                });

                            if (insertError) {
                                console.error("❌ Insert also failed:", insertError);
                                // Don't show error to user as auth was successful
                                // The profile might be created via database trigger
                            } else {
                                console.log("✅ Profile created via insert");
                            }
                        } else {
                            console.log("✅ Profile created successfully via upsert");
                        }
                    } catch (profileErr) {
                        console.error("❌ Unexpected error in profile creation:", profileErr);
                    }

                    // Show confirmation message
                    setEmailConfirmationSent(true);
                    setLoading(false);
                    return;
                }

            } else {
                // Handle Log In
                const { data, error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (authError) {
                    setError(authError.message);
                    setLoading(false);
                    return;
                }

                if (data.user) {
                    // Check if user is confirmed
                    if (!data.user.email_confirmed_at && !data.user.confirmed_at) {
                        setError("Please check your email and confirm your account before logging in.");
                        setLoading(false);
                        return;
                    }

                    // Check if profile exists and get admin status
                    const { data: profile, error: profileError } = await supabase
                        .from("profiles")
                        .select("id, full_name, location, is_admin")
                        .eq("id", data.user.id)
                        .maybeSingle();

                    console.log("🔍 Profile fetch after login:", profile);
                    console.log("❌ Profile fetch error:", profileError);

                    if (profileError) {
                        console.error("Profile fetch error:", profileError);
                    }

                    // If profile doesn't exist or is missing data, try to create it
                    if (!profile || !profile.full_name) {
                        console.log("🔄 Profile missing, attempting to create...");
                        const userMetadata = data.user.user_metadata;

                        const { error: fixProfileError } = await supabase
                            .from("profiles")
                            .upsert({
                                id: data.user.id,
                                email: data.user.email,
                                full_name: userMetadata.full_name || "Unknown User",
                                location: userMetadata.location || "Unknown Location",
                                is_admin: false,
                                points: 0,
                                pickup_status: false,
                                collected: false,
                                created_at: new Date().toISOString(),
                            });

                        if (fixProfileError) {
                            console.error("❌ Failed to fix profile:", fixProfileError);
                        } else {
                            console.log("✅ Profile fixed successfully");
                        }
                    }

                    // Redirect based on admin status
                    if (profile?.is_admin) {
                        navigate("/admin");
                    } else {
                        navigate("/dashboard");
                    }
                }
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    // Email Confirmation Success Screen
    if (emailConfirmationSent) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-blue-900">
                <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md text-center">
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-green-600 mb-2">Check Your Email!</h2>
                        <p className="text-gray-600 mb-4">
                            We've sent a confirmation link to <strong>{email}</strong>
                        </p>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6 text-left">
                        <p className="text-sm text-blue-700">
                            <strong>Important:</strong> Please check your inbox and click the confirmation link to activate your account.
                            You won't be able to log in until you confirm your email address.
                        </p>
                    </div>

                    <div className="space-y-3 text-sm text-gray-600">
                        <p>📧 Check your spam folder if you don't see the email</p>
                        <p>⏰ The link typically expires in 24 hours</p>
                        <p>🔐 After confirmation, you can log in with your credentials</p>
                    </div>

                    <button
                        onClick={() => {
                            setEmailConfirmationSent(false);
                            setIsSignUp(false);
                            setEmail("");
                            setPassword("");
                            setFullName("");
                            setLocation("");
                        }}
                        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-semibold transition"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
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
                            <div>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <input
                                    type="text"
                                    placeholder="#123 Santa Cruz St. Purok 6"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1 ml-1">
                                    Please provide your complete address for collection purposes
                                </p>
                            </div>
                        </>
                    )}

                    <div>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder="Password (min 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {isSignUp && (
                        <div className="flex items-start space-x-2 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={() => setAgreeTerms(!agreeTerms)}
                                className="mt-1"
                                required
                            />
                            <span>
                                I agree to the{" "}
                                <a href="/terms" className="text-blue-600 hover:underline">
                                    Terms & Conditions
                                </a>{" "}
                                and{" "}
                                <a href="/privacy" className="text-blue-600 hover:underline">
                                    Privacy Policy
                                </a>
                            </span>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || (isSignUp && !agreeTerms)}
                        className={`w-full ${loading || (isSignUp && !agreeTerms)
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                            } text-white py-2 rounded-xl font-semibold transition`}
                    >
                        {loading ? "Processing..." : isSignUp ? "Create Account" : "Log In"}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                        className="text-blue-600 hover:underline font-semibold"
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setAgreeTerms(false);
                            setError(null);
                            setFullName("");
                            setLocation("");
                        }}
                    >
                        {isSignUp ? "Log In" : "Sign Up"}
                    </button>
                </p>
            </div>
        </div>
    );
}