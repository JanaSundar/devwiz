"use client";

export function LoadingShimmer() {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-4 bg-gradient-to-r from-bg-tertiary via-bg-secondary to-bg-tertiary rounded animate-pulse"
          style={{
            animationDelay: `${i * 0.1}s`,
            backgroundSize: "200% 100%",
            animation: "shimmer 2s infinite",
          }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          50% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
