from typing import List
from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaUpdate, CategoriaRead
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def list_activas(self) -> List[CategoriaRead]:
        with self.uow as uow:
            categorias = uow.categorias.get_activas()
            return [CategoriaRead.model_validate(c) for c in categorias]

    def get_by_id(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada()
            return CategoriaRead.model_validate(categoria)

    def create(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(data.nombre):
                raise NombreDuplicado()
            categoria = Categoria(
                nombre=data.nombre,
                descripcion=data.descripcion,
                activo=True,
            )
            uow.categorias.add(categoria)
            uow.session.flush()
            uow.session.refresh(categoria)
            return CategoriaRead.model_validate(categoria)

    def update(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada()

            if data.nombre is not None and data.nombre != categoria.nombre:
                existente = uow.categorias.get_by_nombre(data.nombre)
                if existente and existente.id != categoria_id:
                    raise NombreDuplicado()
                categoria.nombre = data.nombre

            if data.descripcion is not None:
                categoria.descripcion = data.descripcion

            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def delete_logico(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada()
            categoria.activo = False
            uow.categorias.add(categoria)