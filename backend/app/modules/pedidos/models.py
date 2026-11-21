from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modules.usuarios.models import Usuario
    from app.modules.productos.models import Producto


class Pedido(SQLModel, table=True):
    __tablename__ = "pedidos"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id", nullable=False)
    estado: str = Field(default="PENDIENTE", nullable=False)  # PENDIENTE, EN_PREPARACION, ENTREGADO, CANCELADO
    forma_pago: str = Field(nullable=False)                   # EFECTIVO, TRANSFERENCIA
    direccion_entrega: str = Field(min_length=5, max_length=200, nullable=False)
    notas: Optional[str] = Field(default=None)
    total: float = Field(default=0.0, ge=0.0, nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )

    usuario: Optional["Usuario"] = Relationship(back_populates="pedidos")
    items: List["DetallePedido"] = Relationship(
        back_populates="pedido",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalles_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id", nullable=False)
    producto_id: int = Field(foreign_key="productos.id", nullable=False)
    cantidad: int = Field(ge=1, nullable=False)
    nombre_producto: str = Field(nullable=False)
    precio_unitario: float = Field(ge=0.0, nullable=False)
    subtotal: float = Field(ge=0.0, nullable=False)

    pedido: Optional[Pedido] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship(back_populates="detalles")