export default function CrisisOverlay({ resources, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative glass max-w-lg w-full p-6 shadow-2xl shadow-red-900/40 border border-red-500/30 animate-slide-up">
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-calm-400 hover:text-white transition text-xl leading-none"
                    aria-label="Close"
                >
                    ×
                </button>

                {/* Header */}
                <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-2xl flex-shrink-0">
                        🆘
                    </div>
                    <div>
                        <h2 className="text-lg font-extrabold text-white">You're Not Alone</h2>
                        <p className="text-calm-300 text-sm mt-0.5">
                            I noticed something in what you shared that concerns me. Please reach out to one of these
                            support lines — they're free, confidential, and here for you right now.
                        </p>
                    </div>
                </div>

                {/* Helplines */}
                <div className="space-y-3 mb-5">
                    {resources.map((r, i) => (
                        <div key={i} className="bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div>
                                    <p className="font-bold text-white text-sm">{r.name}</p>
                                    <p className="text-calm-300 text-xs mt-0.5">{r.description}</p>
                                </div>
                                {r.number && (
                                    <a
                                        href={`tel:${r.number}`}
                                        className="flex items-center gap-1.5 bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30 transition rounded-lg px-3 py-1.5 text-sm font-semibold flex-shrink-0"
                                    >
                                        📞 {r.number}
                                    </a>
                                )}
                                {r.url && (
                                    <a
                                        href={r.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 bg-calm-500/20 border border-calm-500/40 text-calm-300 hover:bg-calm-500/30 transition rounded-lg px-3 py-1.5 text-sm font-semibold flex-shrink-0"
                                    >
                                        🔗 Visit
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Grounding prompt */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-amber-200">
                    <p className="font-semibold mb-1">⚓ Quick Grounding: 5-4-3-2-1</p>
                    <p className="text-amber-300/80 text-xs leading-relaxed">
                        Name 5 things you see · 4 things you can touch · 3 things you hear · 2 things you smell · 1 thing you taste.
                        Take one slow breath.
                    </p>
                </div>

                <button onClick={onClose} className="btn-primary w-full mt-4">
                    I'm okay — continue with Aria
                </button>
            </div>
        </div>
    );
}
