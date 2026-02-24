from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import api_router
from app.db.session import Base, engine

app = FastAPI(title="Journeo", version="1.0.0")
app.include_router(api_router)


@app.on_event("startup")
def _create_tables() -> None:
    Base.metadata.create_all(bind=engine)


origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
