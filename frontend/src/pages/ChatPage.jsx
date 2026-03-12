import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import api from "../api";
import CrisisOverlay from "../components/CrisisOverlay";
import ResourceCard from "../components/ResourceCard";
import SentimentBadge from "../components/SentimentBadge";

const SESSION_ID = uuidv4();

const TypingIndicator = () => (
    <div className="flex items-end gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sage-400 to-calm-400 flex items-center justify-center text-sm flex-shrink-0">
            🌿
        </div>
        <div className="bubble-ai flex gap-1.5 py-3.5 px-5">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-calm-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
            ))}
        </div>
    </div>
);

export default function ChatPage() {
    const [messages, setMessages] = useState([
        {
            id: "welcome",
            role: "ai",
            text: "Hi there 🌿 I'm Aria, your wellness companion. This is a safe, private space — you can share anything on your mind. What's been weighing on you lately?",
            sentiment_score: null,
            stressors: [],
            resources: [],
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [crisis, setCrisis] = useState({ show: false, resources: [] });
    const bottomRef = useRef(null);
    const textareaRef = useRef(null);
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const userMsg = { id: uuidv4(), role: "user", text, sentiment_score: null, stressors: [], resources: [] };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const { data } = await api.post("/api/chat", { message: text, session_id: SESSION_ID });

            if (data.is_crisis) {
                setCrisis({ show: true, resources: data.crisis_resources });
            }

            const aiMsg = {
                id: uuidv4(),
                role: "ai",
                text: data.reply,
                sentiment_score: data.sentiment_score,
                stressors: data.stressors,
                resources: data.recommended_resources,
            };
            setMessages((prev) => [...prev, aiMsg]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: uuidv4(),
                    role: "ai",
                    text: "I'm having trouble connecting right now. Please try again in a moment.",
                    sentiment_score: null,
                    stressors: [],
                    resources: [],
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto px-4 py-4">
            {/* Crisis Overlay */}
            {crisis.show && (
                <CrisisOverlay resources={crisis.resources} onClose={() => setCrisis({ show: false, resources: [] })} />
            )}

            {/* Header */}
            <div className="glass px-5 py-3 mb-4 flex items-center gap-3">
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-400 to-calm-400 flex items-center justify-center text-lg">🌿</div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-sage-400 rounded-full border-2 border-calm-900" />
                </div>
                <div>
                    <p className="font-bold text-white text-sm">Aria</p>
                    <p className="text-calm-400 text-xs">AI Wellness Counselor · Always available</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-xs text-calm-400">
                    <span className="w-1.5 h-1.5 bg-sage-400 rounded-full animate-pulse" />
                    End-to-end anonymised
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 pb-2">
                {messages.map((msg) => (
                    <div key={msg.id}>
                        {msg.role === "user" ? (
                            <div className="flex justify-end mb-3">
                                <div className="flex flex-col items-end gap-1">
                                    <div className="bubble-user">{msg.text}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-end gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sage-400 to-calm-400 flex items-center justify-center text-sm flex-shrink-0">🌿</div>
                                <div className="flex flex-col gap-2 max-w-[78%]">
                                    <div className="bubble-ai whitespace-pre-wrap">{msg.text}</div>
                                    {msg.sentiment_score !== null && (
                                        <SentimentBadge score={msg.sentiment_score} stressors={msg.stressors} />
                                    )}
                                    {msg.resources?.length > 0 && (
                                        <div className="space-y-2 mt-1">
                                            <p className="text-xs text-calm-400 font-semibold uppercase tracking-wider pl-1">✨ Suggested for you</p>
                                            {msg.resources.map((r) => (
                                                <ResourceCard key={r.id} resource={r} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {loading && <TypingIndicator />}
                <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="glass px-4 py-3 mt-2">
                <div className="flex gap-3 items-end">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Share what's on your mind… (Enter to send)"
                        rows={1}
                        className="input-calm flex-1 resize-none max-h-36 leading-relaxed"
                        style={{ minHeight: "44px" }}
                        onInput={(e) => {
                            e.target.style.height = "44px";
                            e.target.style.height = Math.min(e.target.scrollHeight, 144) + "px";
                        }}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                        className="btn-primary px-4 py-2.5 flex-shrink-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
                <p className="text-calm-500 text-xs mt-2 text-center">
                    🔒 Messages are anonymised — no raw text is ever stored.
                </p>
            </div>
        </div>
    );
}
