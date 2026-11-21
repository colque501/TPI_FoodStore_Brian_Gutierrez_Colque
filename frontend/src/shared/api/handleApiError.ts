import axios from "axios";

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.detail) {
      if (typeof data.detail === "string") {
        return data.detail;
      }
      if (Array.isArray(data.detail) && data.detail.length > 0) {
        return data.detail.map((err: { msg?: string }) => err.msg || "Error de validación").join(", ");
      }
    }
    if (error.response?.status === 401) return "Credenciales inválidas o sesión expirada";
    if (error.response?.status === 403) return "No tienes permisos para realizar esta acción";
    if (error.response?.status === 404) return "Recurso no encontrado";
    if (error.response?.status === 500) return "Error interno del servidor";
  }
  return error instanceof Error ? error.message : "Ocurrió un error inesperado";
};