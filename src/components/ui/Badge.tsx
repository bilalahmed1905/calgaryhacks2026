interface BadgeProps {
  label: string;
  variant?: "default" | "primary" | "accent" | "success" | "warning" | "muted";
  className?: string;
}

export function Badge({
  label,
  variant = "default",
  className = "",
}: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-text",
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/20 text-accent-dark",
    success: "bg-success/10 text-success",
    warning: "bg-amber-100 text-amber-800",
    muted: "bg-gray-50 text-text-muted",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variants[variant]} ${className}`}
    >
      {label}
    </span>
  );
}
