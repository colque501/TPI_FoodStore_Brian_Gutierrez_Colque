from datetime import datetime, timezone
from typing import Optional
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    DetallePedidoRead,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario


# Excepciones de Dominio con mapeo directo a códigos HTTP
class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int):
        self.producto_id = producto_id


class ProductoNoDisponible(Exception):
    def __init__(self, nombre: str):
        self.nombre = nombre


class StockInsuficiente(Exception):
    def __init__(self, nombre: str, disponible: int, solicitado: int):
        self.nombre = nombre
        self.disponible = disponible
        self.solicitado = solicitado


class ProductoRepetido(Exception):
    pass


class TransicionInvalida(Exception):
    def __init__(self, estado_actual: str, nuevo_estado: str):
        self.estado_actual = estado_actual
        self.nuevo_estado = nuevo_estado


class CancelacionNoPermitida(Exception):
    pass


class PedidoService:
    # Máquina de estados según especificación y UML
    TRANSICIONES_VALIDAS = {
        "PENDIENTE": ["EN_PREPARACION", "CANCELADO"],
        "EN_PREPARACION": ["ENTREGADO", "CANCELADO"],
        "ENTREGADO": [],  # Terminal
        "CANCELADO": [],  # Terminal
    }

    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def crear_pedido(self, usuario: Usuario, data: PedidoCreate) -> PedidoRead:
        # RN-01: Al menos un ítem y ningún producto repetido
        ids_vistos = set()
        for item in data.items:
            if item.producto_id in ids_vistos:
                raise ProductoRepetido()
            ids_vistos.add(item.producto_id)

        with self.uow as uow:
            # 1. Crear el Pedido cabecera con total provisional en 0
            ahora = datetime.now(timezone.utc)
            nuevo_pedido = Pedido(
                usuario_id=usuario.id,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0.0,
                created_at=ahora,
                updated_at=ahora,
            )
            uow.pedidos.add(nuevo_pedido)
            uow.session.flush()  # Obtiene el ID autoincremental sin hacer commit

            total_calculado = 0.0

            # 2. Procesar ítems, validar disponibilidad, stock y descontar en la misma transacción
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if not producto or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)

                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)

                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock, item.cantidad)

                # RN-01: Descontar stock
                producto.stock -= item.cantidad
                uow.productos.add(producto)

                # RN-05: Línea inmutable (copia nombre y precio actual del producto)
                subtotal_linea = round(producto.precio_base * item.cantidad, 2)
                total_calculado = round(total_calculado + subtotal_linea, 2)

                detalle = DetallePedido(
                    pedido_id=nuevo_pedido.id,
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal_linea,
                )
                uow.session.add(detalle)

            # 3. Fijar total acumulado del pedido
            nuevo_pedido.total = total_calculado
            uow.pedidos.add(nuevo_pedido)
            uow.session.flush()

            # 4. Obtener pedido completo con líneas y convertir a schema dentro del bloque UoW
            pedido_cargado = uow.pedidos.get_with_items(nuevo_pedido.id)
            return PedidoRead.model_validate(pedido_cargado)

    def listar_pedidos(
        self,
        usuario: Usuario,
        skip: int = 0,
        limit: int = 20,
        estado: Optional[str] = None,
    ) -> PedidosPaginados:
        with self.uow as uow:
            # RN-04: Cliente ve solo sus pedidos; Admin ve todos
            filtro_usuario = None if usuario.role == "admin" else usuario.id
            total, pedidos = uow.pedidos.list_paginados(
                skip=skip,
                limit=limit,
                usuario_id=filtro_usuario,
                estado=estado,
            )
            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(p) for p in pedidos],
            )

    def obtener_por_id(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_with_items(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado()

            # RN-04: El cliente solo puede ver su propio pedido
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()

            return PedidoRead.model_validate(pedido)

    def cambiar_estado_admin(self, pedido_id: int, data: CambioEstado) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_with_items(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado()

            nuevo_estado = data.estado.upper()
            transiciones_posibles = self.TRANSICIONES_VALIDAS.get(pedido.estado, [])

            # RN-02: Transiciones válidas y estados terminales
            if nuevo_estado not in transiciones_posibles:
                raise TransicionInvalida(pedido.estado, nuevo_estado)

            # RN-03: Si la transición es hacia CANCELADO, restituir el stock de cada ítem
            if nuevo_estado == "CANCELADO":
                for item in pedido.items:
                    producto = uow.productos.get_by_id(item.producto_id)
                    if producto:
                        producto.stock += item.cantidad
                        uow.productos.add(producto)

            pedido.estado = nuevo_estado
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)
            uow.session.flush()

            pedido_cargado = uow.pedidos.get_with_items(pedido.id)
            return PedidoRead.model_validate(pedido_cargado)

    def cancelar_propio(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_with_items(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado()

            # RN-04: Debe ser el dueño
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()

            # RN-04: El dueño solo cancela en PENDIENTE
            if pedido.estado != "PENDIENTE":
                raise CancelacionNoPermitida()

            # RN-03: Restitución de stock de todas sus líneas en la misma transacción
            for item in pedido.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto:
                    producto.stock += item.cantidad
                    uow.productos.add(producto)

            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)
            uow.session.flush()

            pedido_cargado = uow.pedidos.get_with_items(pedido.id)
            return PedidoRead.model_validate(pedido_cargado)

    def obtener_resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            datos = uow.pedidos.get_resumen()
            return ResumenPedidos.model_validate(datos)