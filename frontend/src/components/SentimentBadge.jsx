export default function SentimentBadge({ score, stressors }) {
    const isPositive = score > 0.2;
    const isNegative = score < -0.2;

    const emoji = isPositive ? "😊" : isNegative ? "😔" : "😐";
    const label = isPositive ? "Positive" : isNegative ? "Low" : "Neutral";
    const colorClass = isPositive
        ? "bg-sage-500/20 border-sage-500/40 text-sage-300"
        : isNegative
            ? "bg-red-500/10 border-red-500/30 text-red-300"
            : "bg-calm-500/10 border-calm-500/20 text-calm-300";

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className={`pill border ${colorClass}`}>
                {emoji} {label} ({score.toFixed(2)})
            </span>
            {stressors?.map((s) => (
                <span key={s} className="pill bg-warm-500/10 border border-warm-500/20 text-warm-300">
                    🎯 {s}
                </span>
            ))}
        </div>
    );
}
