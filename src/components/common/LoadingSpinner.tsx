import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  className?: string;
}

export function LoadingSpinner({
  size = 32,
  message,
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 size={size} className="animate-spin text-primary" />
      {message && (
        <p className="text-text-muted text-sm animate-pulse">{message}</p>
      )}
    </div>
  );
}
