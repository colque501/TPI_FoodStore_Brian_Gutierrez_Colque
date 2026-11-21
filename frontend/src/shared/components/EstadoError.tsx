import { Button } from "@/shared/ui/Button";

export const EstadoError = ({
  mensaje = "Ocurrió un error al cargar la información",
  onRetry,
}: {
  mensaje?: string;
  onRetry?: () => void;
}) => (
  <div className="text-center py-10 px-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl my-4">
    <p className="text-red-700 dark:text-red-400 font-medium mb-3">{mensaje}</p>
    {onRetry && (
      <Button variant="danger" size="sm" onClick={onRetry}>
        Reintentar
      </Button>
    )}
  </div>
);