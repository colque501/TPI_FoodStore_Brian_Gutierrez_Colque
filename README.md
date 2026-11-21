# Food Store - Trabajo Práctico Integrador Final
**Tecnicatura Universitaria en Programación (TUP) - UTN Regional La Plata**  
**Materia:** Programación 4  
**Integrantes:** Brian Gutierrez Colque

---

## 📌 Descripción del Proyecto
Food Store es una plataforma full-stack para pedidos gastronómicos en línea compuesta por una API REST construida en **FastAPI** (con persistencia transaccional mediante **SQLModel/PostgreSQL**, patrón Repositorio y **Unit of Work**) y un cliente web interactivo desarrollado en **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, **Zustand** y **TanStack Query / Form / Table**.

La plataforma contempla control de acceso basado en roles (**RBAC** con tokens JWT en cookies `HttpOnly`), catálogo dinámico con control de stock, checkout transaccional y un panel de administración con máquina de estados estricta y métricas de negocio en tiempo real.

---

## Link a Video
- https://youtu.be/dIdZeGBzuKM


## Link a GitHub
- 

---

## 🏗️ Arquitectura General

```text
TPI_FoodStore/
├── backend/               # FastAPI + SQLModel + PostgreSQL (UoW y Repositorios)
├── frontend/              # React + TypeScript + Vite + Tailwind (Feature-based)
├── api_tests.http         # Archivo de pruebas de endpoints para REST Client
└── README.md              # Documentación general de entrega 

```

## Puesta en Marcha Rápida
1. Base de Datos
Tener PostgreSQL ejecutándose localmente y crear la base de datos:

SQL
CREATE DATABASE foodstore_db;

---

## Backend
cd backend
python -m venv .venv
# Activar entorno virtual:
# Windows (PowerShell): .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Poblar base de datos con admin, categorías y productos iniciales
python -m app.db.seed

# Iniciar servidor FastAPI
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

Swagger UI: http://127.0.0.1:8000/docs

---

## Frontend

cd frontend
pnpm install
pnpm dev

Aplicación Web: http://localhost:5173/

---

## 🔑 Credenciales Iniciales (Seed Idempotente)

- Administrador:

- Usuario: admin

- Contraseña: Admin1234!

- Acceso: Panel /admin/resumen, /admin/categorias, /admin/productos, /admin/pedidos, /admin/usuarios.

### Cliente:

- Se puede registrar cualquier usuario nuevo desde /register o iniciar sesión para acceder al catálogo, checkout y /mis-pedidos.
