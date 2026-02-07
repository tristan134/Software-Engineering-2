from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Journey, Day
from app.db.schemas import DayCreate, DayUpdate
import app.db.schemas as schemas

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


@router.put("/{day_id}", response_model=schemas.Day)
def update_day(day_id: int, payload: schemas.DayUpdate, db: Session = Depends(get_db)):
    day = db.get(Day, day_id)
    if not day:
        raise HTTPException(status_code=404, detail="Day nicht gefunden")

    journey = db.get(Journey, day.journey_id)
    if not journey:
        raise HTTPException(status_code=404, detail="Journey nicht gefunden")

    if payload.title is not None:
        t = payload.title.strip()
        if not t:
            raise HTTPException(status_code=400, detail="Titel darf nicht leer sein")
        day.title = t

    if payload.date is not None:
        if journey.start_date and payload.date < journey.start_date:
            raise HTTPException(status_code=400, detail="day.date liegt vor journey.start_date")
        if journey.end_date and payload.date > journey.end_date:
            raise HTTPException(status_code=400, detail="day.date liegt nach journey.end_date")
        day.date = payload.date

    db.commit()
    db.refresh(day)
    return day


@router.delete("/{day_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_day(day_id: int, db: Session = Depends(get_db)):
    day = db.get(Day, day_id)
    if not day:
        raise HTTPException(status_code=404, detail="Day nicht gefunden")
    db.delete(day)
    db.commit()
    return