interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  color?: "primary" | "accent" | "success";
}

export function ProgressBar({
  value,
  className = "",
  color = "primary",
}: ProgressBarProps) {
  const colors = {
    primary: "bg-primary",
    accent: "bg-accent",
    success: "bg-success",
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${colors[color]}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
