from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoUpdate,
    ProductoStockUpdate,
    ProductoRead,
    ProductosPaginados,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.productos.service import (
    ProductoService,
    ProductoNoEncontrado,
    CategoriaNoExisteOInactiva,
)

router = APIRouter(prefix="/productos", tags=["Catálogo - Productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: Annotated[ProductoService, Depends(get_producto_service)],
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    categoria_id: Optional[int] = Query(default=None),
    disponible: Optional[bool] = Query(default=None),
):
    return service.search(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
    )


@router.get("/{id}", response_model=ProductoRead)
def obtener_producto(
    id: int,
    service: Annotated[ProductoService, Depends(get_producto_service)],
):
    try:
        return service.get_by_id(id)
    except ProductoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(
    data: ProductoCreate,
    service: Annotated[ProductoService, Depends(get_producto_service)],
    _: Annotated[Usuario, Depends(require_role(["admin"]))],
):
    try:
        return service.create(data)
    except CategoriaNoExisteOInactiva:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La categoría especificada no existe o está dada de baja",
        )


@router.put("/{id}", response_model=ProductoRead)
def actualizar_producto(
    id: int,
    data: ProductoUpdate,
    service: Annotated[ProductoService, Depends(get_producto_service)],
    _: Annotated[Usuario, Depends(require_role(["admin"]))],
):
    try:
        return service.update(id, data)
    except ProductoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )
    except CategoriaNoExisteOInactiva:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La categoría especificada no existe o está dada de baja",
        )


@router.patch("/{id}/stock", response_model=ProductoRead)
def actualizar_stock_producto(
    id: int,
    data: ProductoStockUpdate,
    service: Annotated[ProductoService, Depends(get_producto_service)],
    _: Annotated[Usuario, Depends(require_role(["admin"]))],
):
    try:
        return service.update_stock(id, data)
    except ProductoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    id: int,
    service: Annotated[ProductoService, Depends(get_producto_service)],
    _: Annotated[Usuario, Depends(require_role(["admin"]))],
):
    try:
        service.delete_logico(id)
    except ProductoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )