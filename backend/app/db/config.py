# Database configs
import os

POSTGRES_USER = os.getenv("POSTGRES_USER", "journeo_user")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "journeo_password")
POSTGRES_DB = os.getenv("POSTGRES_DB", "journeo_db")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "db")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")

DATABASE_URL = (
    f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}"f"@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
)