from fastapi import APIRouter
from app.api.v1.endpoints import journey, days, activities


# Zentrales Routing: hier werden alle v1-Endpunkte unter /api/v1 gesammelt.
api_router = APIRouter(prefix="/api/v1")

api_router.include_router(journey.router)
api_router.include_router(days.router)
api_router.include_router(activities.router)
