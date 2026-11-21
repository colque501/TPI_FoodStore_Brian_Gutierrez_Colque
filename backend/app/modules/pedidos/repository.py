from datetime import datetime, timezone
from typing import Optional, Sequence, Tuple
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select
from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def get_with_items(self, pedido_id: int) -> Optional[Pedido]:
        statement = (
            select(Pedido)
            .where(Pedido.id == pedido_id)
            .options(selectinload(Pedido.items))
        )
        return self.session.exec(statement).first()

    def list_paginados(
        self,
        skip: int = 0,
        limit: int = 20,
        usuario_id: Optional[int] = None,
        estado: Optional[str] = None,
    ) -> Tuple[int, Sequence[Pedido]]:
        statement = (
            select(Pedido)
            .options(selectinload(Pedido.items))
            .order_by(col(Pedido.created_at).desc())
        )

        if usuario_id is not None:
            statement = statement.where(Pedido.usuario_id == usuario_id)

        if estado is not None:
            statement = statement.where(Pedido.estado == estado.strip().upper())

        count_statement = select(func.count()).select_from(statement.subquery())
        total = self.session.exec(count_statement).one()

        items = self.session.exec(statement.offset(skip).limit(limit)).all()
        return total, items

    def get_resumen(self) -> dict:
        ahora = datetime.now(timezone.utc)
        inicio_hoy = ahora.replace(hour=0, minute=0, second=0, microsecond=0)

        # Conteos por estado
        pendientes = self.session.exec(
            select(func.count(Pedido.id)).where(Pedido.estado == "PENDIENTE")
        ).one() or 0

        en_preparacion = self.session.exec(
            select(func.count(Pedido.id)).where(Pedido.estado == "EN_PREPARACION")
        ).one() or 0

        entregados = self.session.exec(
            select(func.count(Pedido.id)).where(Pedido.estado == "ENTREGADO")
        ).one() or 0

        cancelados = self.session.exec(
            select(func.count(Pedido.id)).where(Pedido.estado == "CANCELADO")
        ).one() or 0

        pedidos_hoy = self.session.exec(
            select(func.count(Pedido.id)).where(Pedido.created_at >= inicio_hoy)
        ).one() or 0

        # Suma de ingresos de pedidos entregados
        ingresos = self.session.exec(
            select(func.sum(Pedido.total)).where(Pedido.estado == "ENTREGADO")
        ).one() or 0.0

        return {
            "pendientes": pendientes,
            "en_preparacion": en_preparacion,
            "entregados": entregados,
            "cancelados": cancelados,
            "pedidos_hoy": pedidos_hoy,
            "ingresos_entregados": float(ingresos),
        }