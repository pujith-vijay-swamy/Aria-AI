import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const links = [
    { to: "/chat", label: "Chat", icon: "💬" },
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
];

export default function Layout({ user, children }) {
    const navigate = useNavigate();

    const logout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    const displayName = user?.displayName || user?.email?.split("@")[0] || "there";

    return (
        <div className="min-h-screen flex flex-col">
            {/* Top nav */}
            <nav className="sticky top-0 z-40 glass-dark border-b border-white/10 px-4 h-16 flex items-center gap-4">
                {/* Brand */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xl">🧠</span>
                    <span className="font-extrabold text-white text-sm hidden sm:block">AI MENTAL HEALTH COMPANION</span>
                </div>

                {/* Nav links */}
                <div className="flex items-center gap-1 flex-1 justify-center">
                    {links.map(({ to, label, icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `nav-link ${isActive ? "active" : ""}`
                            }
                        >
                            <span>{icon}</span>
                            {label}
                        </NavLink>
                    ))}
                </div>

                {/* User + logout */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-calm-400 text-xs hidden sm:block">Hi, {displayName} 👋</span>
                    <button onClick={logout} className="btn-ghost text-xs px-3 py-1.5">
                        Sign out
                    </button>
                </div>
            </nav>

            {/* Page content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
