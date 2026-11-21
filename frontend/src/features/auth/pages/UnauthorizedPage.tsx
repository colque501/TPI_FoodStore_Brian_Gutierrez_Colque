import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/Button";

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-black text-rose-600 mb-2">403</h1>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        Acceso Denegado
      </h2>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
        No posees los permisos necesarios para acceder a este módulo.
      </p>
      <Link to="/">
        <Button variant="primary">Volver al Catálogo</Button>
      </Link>
    </div>
  );
};