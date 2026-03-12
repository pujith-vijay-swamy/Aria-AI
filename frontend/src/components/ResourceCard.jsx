import { useState } from "react";

const TECHNIQUE_ICONS = {
    breathing: "🌬️",
    grounding: "⚓",
    relaxation: "🧘",
    productivity: "⏱️",
    journaling: "📓",
    sleep: "🌙",
    social: "🤝",
    planning: "📋",
};

export default function ResourceCard({ resource }) {
    const [expanded, setExpanded] = useState(false);
    const icon = TECHNIQUE_ICONS[resource.technique_type] || "✨";

    return (
        <div className="bg-white/[0.06] border border-white/10 rounded-xl overflow-hidden transition-all duration-300">
            <button
                onClick={() => setExpanded((p) => !p)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.04] transition"
            >
                <span className="text-xl">{icon}</span>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{resource.title}</p>
                    <p className="text-calm-400 text-xs">
                        {resource.technique_type} · {resource.duration_minutes > 0 ? `${resource.duration_minutes} min` : "Ongoing habit"}
                    </p>
                </div>
                <span className={`text-calm-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>

            {expanded && (
                <div className="px-4 pb-4 animate-slide-up">
                    <p className="text-calm-300 text-xs mb-3 leading-relaxed">{resource.description}</p>
                    <ol className="space-y-1.5">
                        {resource.steps.map((step, i) => (
                            <li key={i} className="flex gap-2 text-xs text-calm-200 leading-relaxed">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-calm-500/30 text-calm-300 text-[10px] font-bold flex items-center justify-center mt-0.5">
                                    {i + 1}
                                </span>
                                {step}
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}
