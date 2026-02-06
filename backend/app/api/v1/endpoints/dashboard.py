from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db import models
from app.db.schemas import AllJourneys

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/all", response_model=List[AllJourneys])
def get_all_journeys(db: Session = Depends(get_db)):
    return db.query(models.Journey).all()
