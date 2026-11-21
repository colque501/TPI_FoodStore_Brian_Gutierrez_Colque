import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { productosApi } from "../api/productosApi";
import { ProductoCard } from "../components/ProductoCard";
import { Skeleton } from "@/shared/components/Skeleton";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { EstadoError } from "@/shared/components/EstadoError";
import { Input } from "@/shared/ui/Input";

export const CatalogoPage = () => {
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const pageSize = 12;

  const { data: categorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: productosApi.getCategorias,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["productos", { categoria_id: categoriaId, search, skip: page * pageSize, limit: pageSize }],
    queryFn: () =>
      productosApi.getProductos({
        categoria_id: categoriaId,
        search: search.trim() || undefined,
        disponible: true,
        skip: page * pageSize,
        limit: pageSize,
      }),
  });

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Nuestro Menú</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Elegí lo que más te guste y hacé tu pedido online
          </p>
        </div>

        <div className="w-full md:w-72">
          <Input
            placeholder="Buscar hamburguesa, pizza..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
      </div>

      {/* Filtro por Categorías */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => {
            setCategoriaId(undefined);
            setPage(0);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            categoriaId === undefined
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
          }`}
        >
          Todas
        </button>

        {categorias?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setCategoriaId(cat.id);
              setPage(0);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              categoriaId === cat.id
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            }`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* Grilla de Productos */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 p-4 space-y-3">
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <EstadoError onRetry={() => refetch()} />
      ) : data?.items.length === 0 ? (
        <EstadoVacio titulo="No encontramos productos" mensaje="Probá buscando otra palabra o categoría." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data?.items.map((prod) => (
              <ProductoCard key={prod.id} producto={prod} />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
              >
                Anterior
              </button>
              <span className="text-xs text-slate-500 font-medium">
                Página {page + 1} de {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};