from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    CancelacionNoPermitida,
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoNoEncontrado,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    data: PedidoCreate,
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
):
    try:
        return service.crear_pedido(usuario=current_user, data=data)
    except ProductoNoEncontrado as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El producto con ID {e.producto_id} no existe o no está activo",
        )
    except ProductoNoDisponible as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El producto '{e.nombre}' no se encuentra disponible actualmente",
        )
    except StockInsuficiente as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stock insuficiente para '{e.nombre}'. Disponible: {e.disponible}, Solicitado: {e.solicitado}",
        )
    except ProductoRepetido:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se permite repetir el mismo producto en el pedido",
        )


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    estado: Optional[str] = Query(default=None),
):
    return service.listar_pedidos(
        usuario=current_user,
        skip=skip,
        limit=limit,
        estado=estado,
    )


# Declarado ANTES de /{id} para evitar colisión de ruta
@router.get("/resumen", response_model=ResumenPedidos)
def obtener_resumen_negocio(
    _: Annotated[Usuario, Depends(require_role(["admin"]))],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
):
    return service.obtener_resumen()


@router.get("/{id}", response_model=PedidoRead)
def obtener_pedido(
    id: int,
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
):
    try:
        return service.obtener_por_id(pedido_id=id, usuario=current_user)
    except PedidoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado",
        )
    except PedidoAjeno:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para acceder a este pedido",
        )


@router.patch("/{id}/estado", response_model=PedidoRead)
def cambiar_estado_pedido(
    id: int,
    data: CambioEstado,
    _: Annotated[Usuario, Depends(require_role(["admin"]))],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
):
    try:
        return service.cambiar_estado_admin(pedido_id=id, data=data)
    except PedidoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado",
        )
    except TransicionInvalida as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transición inválida: no se puede pasar de '{e.estado_actual}' a '{e.nuevo_estado}'",
        )


@router.patch("/{id}/cancelar", response_model=PedidoRead)
def cancelar_pedido_propio(
    id: int,
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
):
    try:
        return service.cancelar_propio(pedido_id=id, usuario=current_user)
    except PedidoNoEncontrado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado",
        )
    except PedidoAjeno:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para cancelar un pedido ajeno",
        )
    except CancelacionNoPermitida:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden cancelar pedidos que se encuentren en estado PENDIENTE",
        )