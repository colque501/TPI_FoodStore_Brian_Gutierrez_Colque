from sqlmodel import select
from app.core.database import session_factory, create_all_tables
from app.core.security import get_password_hash

# Importa TODOS los modelos para que SQLAlchemy resuelva todas las relaciones
from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.pedidos.models import Pedido, DetallePedido


def seed_database():
    create_all_tables()
    with session_factory() as session:
        # 1. Usuario Admin
        admin_user = session.exec(
            select(Usuario).where(Usuario.username == "admin")
        ).first()

        if not admin_user:
            admin_user = Usuario(
                username="admin",
                full_name="Administrador Principal",
                email="admin@foodstore.com",
                hashed_password=get_password_hash("Admin1234!"),
                role="admin",
                disabled=False,
            )
            session.add(admin_user)
            print("Usuario 'admin' creado exitosamente.")
        else:
            print("Usuario 'admin' ya existe.")

        # 2. Categorías
        categorias_data = [
            {"nombre": "Hamburguesas", "descripcion": "Hamburguesas artesanales de carne y pollo"},
            {"nombre": "Pizzas", "descripcion": "Pizzas caseras a la piedra"},
            {"nombre": "Bebidas", "descripcion": "Gaseosas, aguas y cervezas artesanales"},
            {"nombre": "Postres", "descripcion": "Dulces y postres artesanales"},
        ]

        categorias_map = {}
        for cat in categorias_data:
            existente = session.exec(
                select(Categoria).where(Categoria.nombre == cat["nombre"])
            ).first()
            if not existente:
                nueva_cat = Categoria(
                    nombre=cat["nombre"],
                    descripcion=cat["descripcion"],
                    activo=True,
                )
                session.add(nueva_cat)
                session.flush()
                session.refresh(nueva_cat)
                categorias_map[cat["nombre"]] = nueva_cat
                print(f"Categoría '{cat['nombre']}' creada.")
            else:
                categorias_map[cat["nombre"]] = existente

        # 3. Productos (mínimo 8 con stock y fotos reales)
        productos_data = [
            {
                "nombre": "Hamburguesa Clásica",
                "descripcion": "Medallón de carne 180g, lechuga, tomate y queso cheddar.",
                "precio_base": 8500.0,
                "imagen_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
                "stock": 25,
                "categoria": "Hamburguesas",
            },
            {
                "nombre": "Hamburguesa Doble Bacon",
                "descripcion": "Doble medallón de 120g, doble queso cheddar y panceta crocante.",
                "precio_base": 10500.0,
                "imagen_url": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600",
                "stock": 20,
                "categoria": "Hamburguesas",
            },
            {
                "nombre": "Pizza Muzzarella",
                "descripcion": "Salsa de tomate casera, queso muzzarella y aceitunas verdes.",
                "precio_base": 9200.0,
                "imagen_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600",
                "stock": 15,
                "categoria": "Pizzas",
            },
            {
                "nombre": "Pizza Especial Napolitana",
                "descripcion": "Muzzarella, rodajas de tomate natural, ajo y albahaca fresca.",
                "precio_base": 11000.0,
                "imagen_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600",
                "stock": 12,
                "categoria": "Pizzas",
            },
            {
                "nombre": "Pizza Fugazzeta Rellena",
                "descripcion": "Cebolla caramelizada, doble muzzarella y orégano.",
                "precio_base": 11800.0,
                "imagen_url": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600",
                "stock": 10,
                "categoria": "Pizzas",
            },
            {
                "nombre": "Coca Cola 500ml",
                "descripcion": "Bebida gaseosa en botella descartable.",
                "precio_base": 2200.0,
                "imagen_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600",
                "stock": 50,
                "categoria": "Bebidas",
            },
            {
                "nombre": "Cerveza Artesanal IPA 473ml",
                "descripcion": "Lata de cerveza con aroma a lúpulo y amargor equilibrado.",
                "precio_base": 3800.0,
                "imagen_url": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600",
                "stock": 30,
                "categoria": "Bebidas",
            },
            {
                "nombre": "Tiramisú Artesanal",
                "descripcion": "Bizcochos con café, crema de queso mascarpone y cacao amargo.",
                "precio_base": 4200.0,
                "imagen_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600",
                "stock": 18,
                "categoria": "Postres",
            },
            {
                "nombre": "Flan Casero con Dulce de Leche",
                "descripcion": "Flan tradicional de huevos acompañado de abundante dulce de leche.",
                "precio_base": 3600.0,
                "imagen_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRet3DVKeUWbrsmmZ36WvRHrXsw1RsY121mGnp_BpZUA5IDnPbf-j0ifRJQ&s=10",
                "stock": 14,
                "categoria": "Postres",
            },
        ]

        for prod in productos_data:
            cat_obj = categorias_map[prod["categoria"]]
            existente_prod = session.exec(
                select(Producto).where(Producto.nombre == prod["nombre"])
            ).first()

            if not existente_prod:
                nuevo_prod = Producto(
                    categoria_id=cat_obj.id,
                    nombre=prod["nombre"],
                    descripcion=prod["descripcion"],
                    precio_base=prod["precio_base"],
                    imagen_url=prod["imagen_url"],
                    stock=prod["stock"],
                    disponible=True,
                    activo=True,
                )
                session.add(nuevo_prod)
                print(f"Producto '{prod['nombre']}' creado.")
            else:
                print(f"Producto '{prod['nombre']}' ya existe.")

        session.commit()
        print("Carga de seed completada exitosamente.")


if __name__ == "__main__":
    seed_database()