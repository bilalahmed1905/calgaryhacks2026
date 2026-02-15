interface ProgressDotsProps {
  total: number;
  current: number; // 1-indexed
  className?: string;
}

export function ProgressDots({
  total,
  current,
  className = "",
}: ProgressDotsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const isActive = step === current;
        const isCompleted = step < current;

        return (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-primary scale-125 shadow-md shadow-primary/30"
                  : isCompleted
                  ? "bg-primary"
                  : "bg-gray-300"
              }`}
            />
            {i < total - 1 && (
              <div
                className={`w-8 h-0.5 transition-all duration-300 ${
                  isCompleted ? "bg-primary" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
