export const EstadoVacio = ({
  titulo = "No hay datos",
  mensaje = "No se encontraron elementos para mostrar.",
}: {
  titulo?: string;
  mensaje?: string;
}) => (
  <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
    <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{titulo}</p>
    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{mensaje}</p>
  </div>
);