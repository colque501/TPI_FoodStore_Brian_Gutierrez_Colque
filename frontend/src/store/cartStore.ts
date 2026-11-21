import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  stock_disponible: number;
  imagen_url?: string;
}

interface CartState {
  items: CartItem[];
  agregar: (item: Omit<CartItem, "cantidad">, cantidad?: number) => void;
  quitar: (producto_id: number) => void;
  cambiarCantidad: (producto_id: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
  cantidadTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (item, cantidad = 1) => {
        const { items } = get();
        const existente = items.find((i) => i.producto_id === item.producto_id);

        if (existente) {
          const nuevaCantidad = Math.min(
            existente.cantidad + cantidad,
            item.stock_disponible
          );
          set({
            items: items.map((i) =>
              i.producto_id === item.producto_id
                ? { ...i, cantidad: nuevaCantidad }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              { ...item, cantidad: Math.min(cantidad, item.stock_disponible) },
            ],
          });
        }
      },

      quitar: (producto_id) => {
        set({ items: get().items.filter((i) => i.producto_id !== producto_id) });
      },

      cambiarCantidad: (producto_id, cantidad) => {
        if (cantidad <= 0) {
          get().quitar(producto_id);
          return;
        }
        set({
          items: get().items.map((i) => {
            if (i.producto_id === producto_id) {
              const cantAjustada = Math.min(cantidad, i.stock_disponible);
              return { ...i, cantidad: cantAjustada };
            }
            return i;
          }),
        });
      },

      vaciar: () => set({ items: [] }),

      total: () => {
        return get().items.reduce(
          (acc, item) => acc + item.precio_unitario * item.cantidad,
          0
        );
      },

      cantidadTotal: () => {
        return get().items.reduce((acc, item) => acc + item.cantidad, 0);
      },
    }),
    {
      name: "cart-storage",
    }
  )
);