import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { EstadoVacio } from "@/shared/components/EstadoVacio";

export const CarritoPage = () => {
  const navigate = useNavigate();
  const { items, cambiarCantidad, quitar, vaciar, total } = useCartStore();
  const usuario = useAuthStore((s) => s.usuario);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-6">
        <EstadoVacio
          titulo="Tu carrito está vacío"
          mensaje="Agregá platos del menú para armar tu pedido."
        />
        <div className="text-center mt-6">
          <Link to="/">
            <Button variant="primary">Ver Catálogo</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tu Carrito de Compras</h1>
        <button
          onClick={vaciar}
          className="text-xs font-semibold text-rose-500 hover:text-rose-700 cursor-pointer"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <Card key={item.producto_id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                {item.imagen_url && (
                  <img
                    src={item.imagen_url}
                    alt={item.nombre}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{item.nombre}</h3>
                  <p className="text-xs text-slate-500">
                    ${item.precio_unitario.toLocaleString("es-AR")} c/u
                  </p>
                </div>
              </div>

              {/* Selector de cantidad */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                  className="w-7 h-7 rounded-md border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  -
                </button>
                <span className="text-sm font-semibold w-6 text-center">{item.cantidad}</span>
                <button
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                  disabled={item.cantidad >= item.stock_disponible}
                  className="w-7 h-7 rounded-md border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-sm disabled:opacity-40 cursor-pointer"
                >
                  +
                </button>
              </div>

              <div className="text-right min-w-20">
                <span className="font-black text-sm block">
                  ${(item.precio_unitario * item.cantidad).toLocaleString("es-AR")}
                </span>
                <button
                  onClick={() => quitar(item.producto_id)}
                  className="text-[11px] text-red-500 hover:underline cursor-pointer"
                >
                  Eliminar
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Resumen de Compra */}
        <div>
          <Card className="p-6 space-y-4">
            <h2 className="font-bold text-base text-slate-900 dark:text-white">Resumen del Pedido</h2>

            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span>${total().toLocaleString("es-AR")}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>Envío</span>
              <span className="text-emerald-600 font-semibold">Gratis</span>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between font-black text-lg text-slate-900 dark:text-white">
              <span>Total</span>
              <span>${total().toLocaleString("es-AR")}</span>
            </div>

            <Button
              variant="primary"
              className="w-full mt-4"
              onClick={() => {
                if (!usuario) {
                  navigate("/login");
                } else {
                  navigate("/checkout");
                }
              }}
            >
              {usuario ? "Continuar al Checkout" : "Iniciar Sesión para Pedir"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};