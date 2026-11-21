# Food Store API - Backend

API RESTful construida con **FastAPI**, **SQLModel** y **PostgreSQL**, diseñada bajo una arquitectura modular por features con desacoplamiento mediante **BaseRepository** y **Unit of Work**.

---

## 🛠️ Tecnologías y Librerías
* **Python 3.11+**
* **FastAPI:** Framework web asíncrono y generación de OpenAPI/Swagger.
* **SQLModel & SQLAlchemy:** Mapeo objeto-relacional y validación tipada.
* **psycopg2-binary:** Driver de conexión a PostgreSQL.
* **passlib / bcrypt:** Hashing seguro de contraseñas.
* **PyJWT:** Generación y validación de tokens JWT.
* **pydantic-settings:** Gestión de variables de entorno mediante `.env`.

---

## 📂 Estructura del Módulo Backend
```text
backend/
├── app/
│   ├── core/                  # Infraestructura transversal
│   │   ├── config.py          # Settings con BaseSettings
│   │   ├── database.py        # Engine de SQLModel y session_factory
│   │   ├── security.py        # Passlib/bcrypt y codificación JWT
│   │   ├── base_repository.py # Repositorio genérico CRUD
│   │   ├── unit_of_work.py    # Manejador de contexto transaccional
│   │   └── deps.py            # Inyección de dependencias (HttpOnly + RBAC)
│   ├── modules/
│   │   ├── auth/              # Login, Register, Logout y /me
│   │   ├── usuarios/          # Modelo Usuario y ABM admin
│   │   ├── categorias/        # Modelo Categoria y repositorio
│   │   ├── productos/         # Modelo Producto, control stock y paginación
│   │   └── pedidos/           # Modelo Pedido, Detalle y Reglas de Negocio
│   ├── db/
│   │   └── seed.py            # Poblado idempotente de datos iniciales
│   └── main.py                # Instancia FastAPI, CORS y routers
├── requirements.txt
├── .env.example
└── .env