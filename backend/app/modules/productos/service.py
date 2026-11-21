from typing import Optional
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoUpdate,
    ProductoStockUpdate,
    ProductoRead,
    ProductosPaginados,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class CategoriaNoExisteOInactiva(Exception):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search_activos(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )
            return ProductosPaginados(
                total=total,
                items=[ProductoRead.model_validate(p) for p in items],
            )

    def get_by_id(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_with_categoria(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado()
            return ProductoRead.model_validate(producto)

    def create(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(data.categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoExisteOInactiva()

            producto = Producto(
                categoria_id=data.categoria_id,
                nombre=data.nombre,
                descripcion=data.descripcion,
                precio_base=data.precio_base,
                imagen_url=data.imagen_url,
                stock=data.stock,
                disponible=data.disponible,
                activo=True,
            )
            uow.productos.add(producto)
            uow.session.flush()
            uow.session.refresh(producto)
            prod_cargado = uow.productos.get_with_categoria(producto.id)
            return ProductoRead.model_validate(prod_cargado)

    def update(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado()

            if data.categoria_id is not None:
                nueva_cat = uow.categorias.get_by_id(data.categoria_id)
                if not nueva_cat or not nueva_cat.activo:
                    raise CategoriaNoExisteOInactiva()
                producto.categoria_id = data.categoria_id

            if data.nombre is not None:
                producto.nombre = data.nombre
            if data.descripcion is not None:
                producto.descripcion = data.descripcion
            if data.precio_base is not None:
                producto.precio_base = data.precio_base
            if data.imagen_url is not None:
                producto.imagen_url = data.imagen_url
            if data.stock is not None:
                producto.stock = data.stock
            if data.disponible is not None:
                producto.disponible = data.disponible

            uow.productos.add(producto)
            uow.session.flush()
            prod_cargado = uow.productos.get_with_categoria(producto.id)
            return ProductoRead.model_validate(prod_cargado)

    def update_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado()

            producto.stock = data.stock
            producto.disponible = data.disponible
            uow.productos.add(producto)
            uow.session.flush()
            prod_cargado = uow.productos.get_with_categoria(producto.id)
            return ProductoRead.model_validate(prod_cargado)

    def delete_logico(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado()
            producto.activo = False
            uow.productos.add(producto)