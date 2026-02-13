from fastapi import APIRouter
from app.api.v1.endpoints import journey, days, activities, journeys

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(journey.router)
api_router.include_router(days.router)
api_router.include_router(activities.router)
api_router.include_router(journeys.router)
