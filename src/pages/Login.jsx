import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (isSignUp) {
            // SIGN UP
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName }
                }
            });

            if (error) setError(error.message);
            else navigate("/dashboard");
        } else {
            // LOGIN
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) setError(error.message);
            else navigate("/dashboard");
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
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                        />
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

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-semibold transition"
                    >
                        {loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    {isSignUp ? "Already have an account?" : "Don’t have an account?"}{" "}
                    <button
                        className="text-blue-600 hover:underline font-semibold"
                        onClick={() => setIsSignUp(!isSignUp)}
                    >
                        {isSignUp ? "Log In" : "Sign Up"}
                    </button>
                </p>
            </div>
        </div>
    );
}
