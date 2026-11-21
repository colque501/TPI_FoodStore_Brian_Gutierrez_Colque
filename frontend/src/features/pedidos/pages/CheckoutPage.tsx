import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/store/cartStore";
import { pedidosApi } from "../api/pedidosApi";
import { handleApiError } from "@/shared/api/handleApiError";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Card } from "@/shared/ui/Card";

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { items, total, vaciar } = useCartStore();
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);

  if (items.length === 0) {
    navigate("/carrito");
    return null;
  }

  const form = useForm({
    defaultValues: {
      direccion_entrega: "",
      forma_pago: "EFECTIVO" as "EFECTIVO" | "TRANSFERENCIA",
      notas: "",
    },
    onSubmit: async ({ value }) => {
      setErrorGlobal(null);
      try {
        await pedidosApi.crearPedido({
          items: items.map((i) => ({
            producto_id: i.producto_id,
            cantidad: i.cantidad,
          })),
          direccion_entrega: value.direccion_entrega,
          forma_pago: value.forma_pago,
          notas: value.notas || undefined,
        });

        // Invalida la caché para que TanStack Query refresque pedidos y stock
        await queryClient.invalidateQueries({ queryKey: ["mis-pedidos"] });
        await queryClient.invalidateQueries({ queryKey: ["productos"] });

        vaciar();
        navigate("/mis-pedidos");
      } catch (err) {
        setErrorGlobal(handleApiError(err));
      }
    },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Confirmar Pedido</h1>
        <p className="text-sm text-slate-500">Ingresá los datos para la entrega de tu comida</p>
      </div>

      {errorGlobal && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-lg">
          {errorGlobal}
        </div>
      )}

      <Card className="p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="direccion_entrega"
            validators={{
              onChange: ({ value }) =>
                value.length < 5 || value.length > 200
                  ? "La dirección debe tener entre 5 y 200 caracteres"
                  : undefined,
            }}
          >
            {(field) => (
              <Input
                label="Dirección de Entrega"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors?.[0]}
                placeholder="Calle 123, Depto 4B"
              />
            )}
          </form.Field>

          <form.Field name="forma_pago">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Forma de Pago
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => field.handleChange("EFECTIVO")}
                    className={`p-3 rounded-lg border text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition ${
                      field.state.value === "EFECTIVO"
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                        : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    💵 Efectivo
                  </button>

                  <button
                    type="button"
                    onClick={() => field.handleChange("TRANSFERENCIA")}
                    className={`p-3 rounded-lg border text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition ${
                      field.state.value === "TRANSFERENCIA"
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                        : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    💳 Transferencia
                  </button>
                </div>
              </div>
            )}
          </form.Field>

          <form.Field name="notas">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  rows={2}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="ej: Timbre roto, llamar por teléfono."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </form.Field>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Total a pagar:</span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                ${total().toLocaleString("es-AR")}
              </span>
            </div>

            <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!canSubmit}
                  loading={isSubmitting}
                >
                  Confirmar y Pedir
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </Card>
    </div>
  );
};