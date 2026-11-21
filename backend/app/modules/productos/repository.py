from typing import Optional, Sequence, Tuple
from sqlmodel import Session, select, func, col
from sqlalchemy.orm import selectinload
from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def get_with_categoria(self, producto_id: int) -> Optional[Producto]:
        statement = (
            select(Producto)
            .where(Producto.id == producto_id)
            .options(selectinload(Producto.categoria))
        )
        return self.session.exec(statement).first()

    def search_activos(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> Tuple[int, Sequence[Producto]]:
        statement = (
            select(Producto)
            .where(Producto.activo == True)
            .options(selectinload(Producto.categoria))
        )

        if search:
            statement = statement.where(
                col(Producto.nombre).ilike(f"%{search.strip()}%")
            )

        if categoria_id is not None:
            statement = statement.where(Producto.categoria_id == categoria_id)

        if disponible is not None:
            statement = statement.where(Producto.disponible == disponible)

        count_statement = select(func.count()).select_from(statement.subquery())
        total = self.session.exec(count_statement).one()

        items = self.session.exec(statement.offset(skip).limit(limit)).all()
        return total, items