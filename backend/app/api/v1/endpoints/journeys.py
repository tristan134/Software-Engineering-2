from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db import models
from app.db.schemas import ShowJourneySummarize, Journey

router = APIRouter(prefix="/journeys", tags=["journeys"])


@router.get("", response_model=List[ShowJourneySummarize])
def get_all_journeys(db: Session = Depends(get_db)):
    return db.query(models.Journey).all()


@router.delete("/{journey_id}", status_code=204)
def delete_journey(journey_id: int, db: Session = Depends(get_db)):
    journey = db.query(models.Journey).filter(models.Journey.id == journey_id).first()

    if journey is None:
        raise HTTPException(status_code=404, detail="Reise nicht gefunden")

    db.delete(journey)
    db.commit()
    return


@router.get("/{journey_id}", response_model=Journey)
def get_full_journey(journey_id: int, db: Session = Depends(get_db)):
    journey = db.query(models.Journey).filter(models.Journey.id == journey_id).first()

    if journey is None:
        raise HTTPException(status_code=404, detail="Reise nicht gefunden")

    return journey
