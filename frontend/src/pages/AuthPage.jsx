import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";

const googleProvider = new GoogleAuthProvider();

export default function AuthPage() {
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState({ display_name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (mode === "register") {
                const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
                if (form.display_name) {
                    await updateProfile(cred.user, { displayName: form.display_name });
                }
            } else {
                await signInWithEmailAndPassword(auth, form.email, form.password);
            }
            navigate("/chat");
        } catch (err) {
            const msgs = {
                "auth/email-already-in-use": "An account with this email already exists.",
                "auth/invalid-credential": "Invalid email or password.",
                "auth/weak-password": "Password must be at least 6 characters.",
                "auth/invalid-email": "Please enter a valid email address.",
            };
            setError(msgs[err.code] || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setLoading(true);
        setError("");
        try {
            await signInWithPopup(auth, googleProvider);
            navigate("/chat");
        } catch (err) {
            if (err.code !== "auth/popup-closed-by-user") {
                setError("Google sign-in failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            {/* Glowing background orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-calm-500/20 rounded-full blur-3xl animate-pulse-soft" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sage-500/15 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
            </div>

            <div className="relative w-full max-w-md animate-fade-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-calm-400 to-sage-400 mb-4 shadow-lg shadow-calm-900/50">
                        <span className="text-3xl">🧠</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-white">AI MENTAL HEALTH COMPANION</h1>
                    <p className="text-calm-300 mt-1 text-sm">Your private wellness space</p>
                </div>

                {/* Card */}
                <div className="glass p-8 shadow-2xl shadow-calm-900/60">
                    {/* Tab toggle */}
                    <div className="flex gap-2 p-1 bg-black/20 rounded-xl mb-6">
                        {["login", "register"].map((m) => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(""); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === m ? "bg-calm-500 text-white shadow" : "text-calm-300 hover:text-white"
                                    }`}
                            >
                                {m === "login" ? "🌿 Sign In" : "🌱 Create Account"}
                            </button>
                        ))}
                    </div>

                    {/* Google Sign-In */}
                    <button
                        onClick={handleGoogle}
                        disabled={loading}
                        className="btn-ghost w-full mb-4 justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-calm-500 text-xs">or continue with email</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Email form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        {mode === "register" && (
                            <div className="animate-slide-up">
                                <label className="block text-xs font-semibold text-calm-300 mb-1.5 uppercase tracking-wider">Your Name</label>
                                <input
                                    name="display_name"
                                    value={form.display_name}
                                    onChange={handleChange}
                                    placeholder="e.g. Alex"
                                    className="input-calm"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-semibold text-calm-300 mb-1.5 uppercase tracking-wider">Email</label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@university.edu"
                                required
                                className="input-calm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-calm-300 mb-1.5 uppercase tracking-wider">Password</label>
                            <input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                className="input-calm"
                            />
                        </div>

                        {error && (
                            <div className="animate-slide-up bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3">
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    {mode === "login" ? "Signing in…" : "Creating account…"}
                                </span>
                            ) : mode === "login" ? "Sign In" : "Create Account"}
                        </button>
                    </form>

                    <p className="text-center text-xs text-calm-400 mt-6">
                        🔒 Secured by Firebase · Your data is anonymised and never shared.
                    </p>
                </div>
            </div>
        </div>
    );
}
