from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from app.db.session import get_db
from app.db.models import Journey, Day
from app.db.schemas import DayCreate
import app.db.schemas as schemas

router = APIRouter(prefix="/days", tags=["days"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_day(payload: DayCreate, db: Session = Depends(get_db)):
    """Einen neuen Tag zu einer Reise hinzufügen."""
    journey = db.get(Journey, payload.journey_id)
    if not journey:
        raise HTTPException(status_code=404, detail="Reise nicht gefunden")

    # Duplikate verhindern: pro Reise darf ein Datum nur einmal existieren.
    existing = db.scalar(
        select(Day.id).where(
            Day.journey_id == payload.journey_id,
            Day.date == payload.date,
        )
    )
    if existing is not None:
        raise HTTPException(
            status_code=400,
            detail="Bitte ein anderes Datum wählen. Dieser Tag ist bereits vorhanden.",
        )

    # Tage müssen im Reisezeitraum liegen (wenn Start/Ende gesetzt sind).
    if payload.date and journey.start_date and payload.date < journey.start_date:
        raise HTTPException(
            status_code=400, detail="Datum liegt vor dem Startdatum der Reise"
        )
    if payload.date and journey.end_date and payload.date > journey.end_date:
        raise HTTPException(
            status_code=400, detail="Datum liegt hinter dem Enddatum der Reise"
        )

    stripped_title = payload.title.strip()
    if not stripped_title:
        raise HTTPException(status_code=400, detail="Titel darf nicht leer sein")

    day = Day(title=stripped_title, journey_id=payload.journey_id, date=payload.date)
    db.add(day)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Bitte ein anderes Datum wählen. Dieser Tag ist bereits vorhanden.",
        )

    db.refresh(day)
    return day


@router.get("/by-journey/{journey_id}")
def list_days_for_journey(journey_id: int, db: Session = Depends(get_db)):
    """Alle Tage einer Reise auflisten."""
    journey = db.get(Journey, journey_id)
    if not journey:
        raise HTTPException(status_code=404, detail="Reise nicht gefunden")
    return journey.days


@router.put("/{day_id}", response_model=schemas.Day)
def update_day(day_id: int, payload: schemas.DayUpdate, db: Session = Depends(get_db)):
    """Tag aktualisieren."""
    day = db.get(Day, day_id)
    if not day:
        raise HTTPException(status_code=404, detail="Tag nicht gefunden")

    journey = db.get(Journey, day.journey_id)
    if not journey:
        raise HTTPException(status_code=404, detail="Reise nicht gefunden")

    if payload.title is not None:
        t = payload.title.strip()
        if not t:
            raise HTTPException(status_code=400, detail="Titel darf nicht leer sein")
        day.title = t

    if payload.date is not None:
        # Duplikate verhindern (anderer Day mit gleichem Datum in derselben Reise)
        existing = db.scalar(
            select(Day.id).where(
                Day.journey_id == day.journey_id,
                Day.date == payload.date,
                Day.id != day.id,
            )
        )
        if existing is not None:
            raise HTTPException(
                status_code=400,
                detail="Bitte ein anderes Datum wählen. Dieser Tag ist bereits vorhanden.",
            )

        if journey.start_date and payload.date < journey.start_date:
            raise HTTPException(
                status_code=400, detail="Datum liegt vor dem Startdatum der Reise"
            )
        if journey.end_date and payload.date > journey.end_date:
            raise HTTPException(
                status_code=400, detail="Datum liegt hinter dem Enddatum der Reise"
            )
        day.date = payload.date

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Bitte ein anderes Datum wählen. Dieser Tag ist bereits vorhanden.",
        )

    db.refresh(day)
    return day


@router.delete("/{day_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_day(day_id: int, db: Session = Depends(get_db)):
    """Tag löschen."""
    day = db.get(Day, day_id)
    if not day:
        raise HTTPException(status_code=404, detail="Tag nicht gefunden")
    db.delete(day)
    db.commit()
    return
