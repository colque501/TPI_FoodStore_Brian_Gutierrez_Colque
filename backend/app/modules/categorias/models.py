from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    __tablename__ = "categorias"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True, min_length=2, max_length=100, nullable=False)
    descripcion: Optional[str] = Field(default=None)
    activo: bool = Field(default=True, nullable=False)

    productos: List["Producto"] = Relationship(back_populates="categoria")