import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({
  children,
  className = "",
  onClick,
  hover = false,
}: CardProps) {
  return (
    <div
      className={`bg-surface rounded-2xl border border-border shadow-sm ${
        hover
          ? "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
          : ""
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
