from datetime import datetime
from typing import List, Literal, Optional
from pydantic import field_validator
from sqlmodel import Field, SQLModel


class ItemPedidoCreate(SQLModel):
    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    items: List[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: str
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: Optional[str] = None

    @field_validator("forma_pago")
    @classmethod
    def validar_forma_pago(cls, v: str) -> str:
        valor = v.strip().upper()
        if valor not in ("EFECTIVO", "TRANSFERENCIA"):
            raise ValueError("La forma de pago debe ser EFECTIVO o TRANSFERENCIA")
        return valor


class CambioEstado(SQLModel):
    estado: Literal["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"]


class DetallePedidoRead(SQLModel):
    id: int
    producto_id: int
    cantidad: int
    nombre_producto: str
    precio_unitario: float
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: Optional[str]
    total: float
    created_at: datetime
    updated_at: datetime
    items: List[DetallePedidoRead] = []


class PedidosPaginados(SQLModel):
    total: int
    items: List[PedidoRead]


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float