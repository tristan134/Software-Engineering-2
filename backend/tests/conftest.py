import os
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.app import app
from app.db.session import Base, get_db


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

    Wichtig: Wir deaktivieren das Produktiv-Startup, das sonst versucht, Postgres
    (host "db") zu erreichen. Tabellen werden stattdessen auf der Test-Engine
    erzeugt.
    """

    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db

    # Startup-Handler, der Postgres-Engine verwendet, für Tests entfernen.
    original_startup_handlers = list(app.router.on_startup)
    app.router.on_startup.clear()

    # Schema sicherstellen (idempotent) auf Test-Engine
    Base.metadata.create_all(bind=test_engine)

    try:
        with TestClient(app) as c:
            yield c
    finally:
        app.router.on_startup[:] = original_startup_handlers
        app.dependency_overrides.clear()
