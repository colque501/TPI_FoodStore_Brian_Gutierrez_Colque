import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export const Navbar = () => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuthStore();
  const cantidadCarrito = useCartStore((s) => s.cantidadTotal());

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <NavLink to="/" className="text-xl font-black tracking-tight text-blue-600 dark:text-blue-400">
            🍔 Food Store
          </NavLink>

          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" className={navItemClass}>Catálogo</NavLink>
            {usuario && (
              <NavLink to="/mis-pedidos" className={navItemClass}>Mis Pedidos</NavLink>
            )}
            {usuario?.role === "admin" && (
              <>
                <NavLink to="/admin/resumen" className={navItemClass}>Resumen</NavLink>
                <NavLink to="/admin/categorias" className={navItemClass}>Categorías</NavLink>
                <NavLink to="/admin/productos" className={navItemClass}>Productos</NavLink>
                <NavLink to="/admin/pedidos" className={navItemClass}>Gestión Pedidos</NavLink>
                <NavLink to="/admin/usuarios" className={navItemClass}>Usuarios</NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <NavLink
            to="/carrito"
            className="relative px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
          >
            🛒 Carrito
            {cantidadCarrito > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cantidadCarrito}
              </span>
            )}
          </NavLink>

          {usuario ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{usuario.full_name}</p>
                <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wider">{usuario.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink to="/login" className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600">
                Iniciar Sesión
              </NavLink>
              <NavLink to="/register" className="px-3 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                Registrarse
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};