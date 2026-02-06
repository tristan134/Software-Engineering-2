from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Journey, Day
from app.db.schemas import DayCreate

router = APIRouter(prefix="/days", tags=["days"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_day(payload: DayCreate, db: Session = Depends(get_db)):
    journey = db.get(Journey, payload.journey_id)
    if not journey:
        raise HTTPException(status_code=404, detail="Journey nicht gefunden")

    if payload.date and journey.start_date and payload.date < journey.start_date:
        raise HTTPException(status_code=400, detail="day.date liegt vor journey.start_date")
    if payload.date and journey.end_date and payload.date > journey.end_date:
        raise HTTPException(status_code=400, detail="day.date liegt nach journey.end_date")

    stripped_title = payload.title.strip()
    if not stripped_title:
        raise HTTPException(status_code=400, detail="Titel darf nicht leer sein")

    day = Day(
        title=stripped_title,
        journey_id=payload.journey_id,
        date=payload.date
    )
    db.add(day)
    db.commit()
    db.refresh(day)
    return day


@router.get("/by-journey/{journey_id}")
def list_days_for_journey(journey_id: int, db: Session = Depends(get_db)):
    journey = db.get(Journey, journey_id)
    if not journey:
        raise HTTPException(status_code=404, detail="Journey nicht gefunden")
    return journey.days
