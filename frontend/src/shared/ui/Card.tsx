import React, { HTMLAttributes } from "react";

export const Card: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden transition-colors ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};