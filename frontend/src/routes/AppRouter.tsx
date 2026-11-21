import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/shared/layout/MainLayout";
import { ProtectedRoute } from "./ProtectedRoute";

// Auth
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { UnauthorizedPage } from "@/features/auth/pages/UnauthorizedPage";

// Cliente
import { CatalogoPage } from "@/features/productos/pages/CatalogoPage";
import { CarritoPage } from "@/features/pedidos/pages/CarritoPage";
import { CheckoutPage } from "@/features/pedidos/pages/CheckoutPage";
import { MisPedidosPage } from "@/features/pedidos/pages/MisPedidosPage";

// Admin
import { AdminResumenPage } from "@/features/pedidos/pages/AdminResumenPage";
import { AdminCategoriasPage } from "@/features/categorias/pages/AdminCategoriasPage";
import { AdminProductosPage } from "@/features/productos/pages/AdminProductosPage";
import { AdminPedidosPage } from "@/features/pedidos/pages/AdminPedidosPage";
import { AdminUsuariosPage } from "@/features/usuarios/pages/AdminUsuariosPage";

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Rutas Públicas */}
        <Route path="/" element={<CatalogoPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/carrito" element={<CarritoPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Rutas de Cliente Protegidas */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-pedidos"
          element={
            <ProtectedRoute>
              <MisPedidosPage />
            </ProtectedRoute>
          }
        />

        {/* Rutas de Admin Protegidas */}
        <Route
          path="/admin/resumen"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminResumenPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categorias"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminCategoriasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/productos"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminProductosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pedidos"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPedidosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUsuariosPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};