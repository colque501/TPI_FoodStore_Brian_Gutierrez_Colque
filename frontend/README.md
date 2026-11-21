# Food Store Frontend

Cliente Single Page Application (SPA) desarrollado con **React 19**, **TypeScript** y **Vite**, organizado bajo arquitectura modular por features con gestión de estado global y de servidor.

---

## 🛠️ Tecnologías y Librerías
* **React 19 & TypeScript:** Tipado estricto y componentes funcionales.
* **Vite:** Herramienta de compilación y servidor ultrarrápido.
* **Tailwind CSS v4:** Estilos utilitarios responsivos.
* **Zustand:** Estado global de sesión (`authStore`) y carrito persistente (`cartStore`).
* **TanStack Query (v5):** Caching, sincronización de servidor e invalidaciones reactivas.
* **TanStack Form:** Formularios validados (Login, Register, Checkout, ABMs).
* **TanStack Table (v8):** Tablas de gestión con paginación para el panel de administración.
* **Axios:** Cliente HTTP con `withCredentials: true` e interceptor de sesión expirada (401/400).
* **React Router DOM (v7):** Enrutamiento declarativo y rutas protegidas (`ProtectedRoute`).

---

## 📂 Estructura del Módulo Frontend
```text
frontend/src/
├── features/
│   ├── auth/          # Login, Register, Unauthorized y API
│   ├── productos/     # Catálogo, tarjetas, filtros y ABM Admin
│   ├── categorias/    # ABM Admin de categorías con modal
│   ├── pedidos/       # Carrito, Checkout, Mis Pedidos, Gestión y Resumen
│   └── usuarios/      # Panel de administración de usuarios y bloqueo
├── shared/
│   ├── api/           # axiosInstance, queryClient y handleApiError
│   ├── components/    # Skeleton, EstadoVacio, EstadoError
│   ├── layout/        # Navbar y MainLayout responsivo
│   └── ui/            # Button, Input, Card, Modal, BadgeEstado
├── store/
│   ├── authStore.ts   # Sesión del usuario con persistencia en localStorage
│   └── cartStore.ts   # Carrito de compras con sincronización local
├── routes/
│   ├── AppRouter.tsx     # Definición central de rutas
│   └── ProtectedRoute.tsx # Guardián de autenticación y RBAC
├── App.tsx
├── main.tsx
└── index.css
```

## 💻 Ejecución Local

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev

# Compilar para producción (validación de tipos)
pnpm build