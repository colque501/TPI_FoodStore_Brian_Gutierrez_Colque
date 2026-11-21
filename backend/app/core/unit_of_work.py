from types import TracebackType
from typing import Optional, Type
from sqlmodel import Session
from app.core.database import session_factory


class UnitOfWork:
    def __init__(self, session_creator=session_factory):
        self.session_creator = session_creator
        self.session: Optional[Session] = None

    def __enter__(self):
        self.session = self.session_creator()
        return self

    def __exit__(
        self,
        exc_type: Optional[Type[BaseException]],
        exc_val: Optional[BaseException],
        exc_tb: Optional[TracebackType],
    ):
        if exc_type is not None:
            if self.session:
                self.session.rollback()
        else:
            if self.session:
                self.session.commit()
        if self.session:
            self.session.close()
            self.session = None