import type { ReactNode } from "react";

interface CardProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-xl
        shadow-sm dark:shadow-none
        p-6
        transition-all duration-200
        hover:shadow-md dark:hover:shadow-none
        hover:border-gray-300 dark:hover:border-gray-600
        ${className}
      `}
    >
      {children}
    </div>
  );
}
