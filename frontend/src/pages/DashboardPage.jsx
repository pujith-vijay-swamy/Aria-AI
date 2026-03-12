import { useState, useEffect } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, Legend,
} from "recharts";
import api from "../api";

const DAYS_OPTIONS = [7, 14, 30];

const STRESSOR_COLORS = [
    "#7c96f1", "#72c69f", "#f9b97d", "#f87171", "#a78bfa", "#34d399", "#60a5fa", "#fb923c",
];

const MoodTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const score = payload[0].value;
    const emoji = score > 0.3 ? "😊" : score < -0.3 ? "😔" : "😐";
    return (
        <div className="glass-dark px-3 py-2 text-sm text-white shadow-lg">
            <p className="font-semibold text-calm-300">{label}</p>
            <p className="mt-0.5">
                {emoji} Mood score: <span className="font-bold">{score.toFixed(2)}</span>
            </p>
            {payload[0].payload.entry_count && (
                <p className="text-calm-400 text-xs">{payload[0].payload.entry_count} entries</p>
            )}
        </div>
    );
};

const StressorTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-dark px-3 py-2 text-sm text-white shadow-lg">
            <p className="font-semibold">{payload[0].payload.stressor}</p>
            <p className="text-calm-300">{payload[0].value} mentions</p>
        </div>
    );
};

const StatCard = ({ label, value, sub, icon }) => (
    <div className="glass p-4 flex items-center gap-4">
        <div className="text-3xl">{icon}</div>
        <div>
            <p className="text-calm-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
            <p className="text-white font-bold text-xl mt-0.5">{value}</p>
            {sub && <p className="text-calm-400 text-xs">{sub}</p>}
        </div>
    </div>
);

export default function DashboardPage() {
    const [days, setDays] = useState(7);
    const [moodData, setMoodData] = useState(null);
    const [stressorData, setStressorData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async (d) => {
        setLoading(true);
        try {
            const [moodRes, stressorRes] = await Promise.all([
                api.get(`/api/dashboard/mood-trends?days=${d}`),
                api.get(`/api/dashboard/stressors?days=30`),
            ]);
            setMoodData(moodRes.data);
            setStressorData(stressorRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(days); }, [days]);

    const avgScore = moodData?.overall_average ?? 0;
    const avgEmoji = avgScore > 0.3 ? "😊" : avgScore < -0.3 ? "😔" : "😐";

    const moodLabel = avgScore > 0.5
        ? "Feeling Good"
        : avgScore > 0.1
            ? "Mostly Okay"
            : avgScore > -0.2
                ? "Neutral"
                : avgScore > -0.5
                    ? "Under Stress"
                    : "High Distress";

    const topStressor = stressorData?.data?.[0]?.stressor ?? "—";

    return (
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-extrabold text-white">Your Wellness Dashboard</h1>
                <p className="text-calm-400 text-sm mt-0.5">All data is anonymised and only visible to you.</p>
            </div>

            {/* Stat Cards */}
            {!loading && moodData && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up">
                    <StatCard
                        icon={avgEmoji}
                        label="Average Mood"
                        value={moodLabel}
                        sub={`Score: ${avgScore.toFixed(2)}`}
                    />
                    <StatCard
                        icon="📅"
                        label="Days Tracked"
                        value={`${moodData.days_tracked} / ${days}`}
                        sub="Active conversation days"
                    />
                    <StatCard
                        icon="🎯"
                        label="Top Stressor"
                        value={topStressor}
                        sub="Most mentioned this month"
                    />
                </div>
            )}

            {/* Mood Trends */}
            <div className="glass p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-white">Mood Trends</h2>
                        <p className="text-calm-400 text-xs mt-0.5">Average daily sentiment score (−1 = very low, +1 = very positive)</p>
                    </div>
                    <div className="flex gap-2">
                        {DAYS_OPTIONS.map((d) => (
                            <button
                                key={d}
                                onClick={() => setDays(d)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${days === d
                                        ? "bg-calm-500 text-white"
                                        : "text-calm-400 hover:text-white hover:bg-white/10"
                                    }`}
                            >
                                {d}d
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="h-56 flex items-center justify-center text-calm-400 animate-pulse-soft">Loading chart…</div>
                ) : moodData?.data?.length ? (
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={moodData.data} margin={{ top: 5, right: 15, left: -20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7c96f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#7c96f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: "#a3b9f8", fontSize: 11 }}
                                tickFormatter={(v) => v.slice(5)}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                domain={[-1, 1]}
                                tick={{ fill: "#a3b9f8", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                tickCount={5}
                            />
                            <Tooltip content={<MoodTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="avg_score"
                                stroke="#7c96f1"
                                strokeWidth={2.5}
                                dot={{ fill: "#7c96f1", strokeWidth: 0, r: 4 }}
                                activeDot={{ r: 6, fill: "#a3b9f8" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-56 flex flex-col items-center justify-center text-calm-400 gap-2">
                        <span className="text-4xl">💬</span>
                        <p className="text-sm">No data yet — start chatting with Aria to see your trends!</p>
                    </div>
                )}
            </div>

            {/* Stressor Distribution */}
            <div className="glass p-6">
                <div className="mb-5">
                    <h2 className="text-lg font-bold text-white">Stressor Distribution</h2>
                    <p className="text-calm-400 text-xs mt-0.5">Most common sources of stress over the last 30 days</p>
                </div>

                {loading ? (
                    <div className="h-56 flex items-center justify-center text-calm-400 animate-pulse-soft">Loading chart…</div>
                ) : stressorData?.data?.length ? (
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={stressorData.data} margin={{ top: 5, right: 15, left: -20, bottom: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="stressor"
                                tick={{ fill: "#a3b9f8", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                angle={-30}
                                textAnchor="end"
                                interval={0}
                            />
                            <YAxis
                                tick={{ fill: "#a3b9f8", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip content={<StressorTooltip />} />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                {stressorData.data.map((_, i) => (
                                    <Cell key={i} fill={STRESSOR_COLORS[i % STRESSOR_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-56 flex flex-col items-center justify-center text-calm-400 gap-2">
                        <span className="text-4xl">🎯</span>
                        <p className="text-sm">No stressor data yet — keep chatting with Aria!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
