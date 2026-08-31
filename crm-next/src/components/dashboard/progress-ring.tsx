"use client";

export function ProgressRing({
  percent,
  color,
  size = 96,
  thickness = 9,
  children,
}: {
  percent: number;
  color: string;
  size?: number;
  thickness?: number;
  children?: React.ReactNode;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${color} ${clamped * 3.6}deg, var(--muted) 0deg)`,
        }}
      />
      <div
        className="absolute rounded-full bg-card"
        style={{
          inset: thickness,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
