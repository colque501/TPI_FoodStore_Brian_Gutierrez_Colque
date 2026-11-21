import React from "react";
import { Producto } from "../types";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";

interface ProductoCardProps {
  producto: Producto;
}

export const ProductoCard: React.FC<ProductoCardProps> = ({ producto }) => {
  const agregar = useCartStore((s) => s.agregar);
  const puedeComprar = producto.activo && producto.disponible && producto.stock > 0;

  const handleAgregar = () => {
    agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
      stock_disponible: producto.stock,
      imagen_url: producto.imagen_url,
    });
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🍕</div>
        )}
        {producto.categoria && (
          <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
            {producto.categoria.nombre}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1">
          {producto.nombre}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 flex-1">
          {producto.descripcion || "Sin descripción"}
        </p>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Precio</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">
              ${producto.precio_base.toLocaleString("es-AR")}
            </span>
          </div>

          <div>
            {puedeComprar ? (
              <Button size="sm" variant="primary" onClick={handleAgregar}>
                + Agregar
              </Button>
            ) : (
              <span className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-md">
                Sin Stock
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};