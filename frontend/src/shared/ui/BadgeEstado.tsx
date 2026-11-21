import React from "react";

interface BadgeEstadoProps {
  estado: "PENDIENTE" | "EN_PREPARACION" | "ENTREGADO" | "CANCELADO" | string;
}

export const BadgeEstado: React.FC<BadgeEstadoProps> = ({ estado }) => {
  const config = {
    PENDIENTE: {
      label: "Pendiente",
      classes: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300 dark:border-amber-800",
    },
    EN_PREPARACION: {
      label: "En Preparación",
      classes: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-300 dark:border-blue-800",
    },
    ENTREGADO: {
      label: "Entregado",
      classes: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
    },
    CANCELADO: {
      label: "Cancelado",
      classes: "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300 dark:border-rose-800",
    },
  }[estado] || {
    label: estado,
    classes: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.classes}`}>
      {config.label}
    </span>
  );
};