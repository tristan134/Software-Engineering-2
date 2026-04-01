import os
from typing import Generator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.app import app
from app.db.session import Base, get_db

from contextlib import asynccontextmanager
from collections.abc import AsyncIterator


@pytest.fixture(scope="session")
def test_engine():
    """SQLite Test-Engine (file-basiert), damit alle Connections dieselbe DB sehen."""
    db_url = os.getenv("TEST_DATABASE_URL", "sqlite:///./test.db")
    connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}
    engine = create_engine(db_url, connect_args=connect_args)
    Base.metadata.create_all(bind=engine)
    return engine


@pytest.fixture(scope="function")
def db_session(test_engine) -> Generator[Session, None, None]:
    """Neue Transaktion pro Test, am Ende Rollback für Isolation."""
    testing_session_local = sessionmaker(
        autocommit=False, autoflush=False, bind=test_engine
    )

    connection = test_engine.connect()
    transaction = connection.begin()
    session = testing_session_local(bind=connection)

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture(scope="function")
def client(db_session: Session, test_engine) -> Generator[TestClient, None, None]:
    """FastAPI TestClient mit überschriebenem get_db Dependency.

    In der App wird das Schema im `lifespan` erzeugt (prod Engine).
    Für Tests überschreiben wir den Lifespan-Kontext, damit keine Verbindung zur
    Produktiv-DB aufgebaut wird und stattdessen die Test-Engine genutzt wird.
    """

    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db

    # Lifespan überschreiben, damit keine prod Engine genutzt wird.
    original_lifespan_context = getattr(app.router, "lifespan_context", None)

    @asynccontextmanager
    async def _test_lifespan(_: FastAPI) -> AsyncIterator[None]:
        Base.metadata.create_all(bind=test_engine)
        yield

    app.router.lifespan_context = _test_lifespan

    try:
        with TestClient(app) as c:
            yield c
    finally:
        if original_lifespan_context is not None:
            app.router.lifespan_context = original_lifespan_context
        app.dependency_overrides.clear()
