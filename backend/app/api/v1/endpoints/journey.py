import app.db.schemas as schemas
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import models
from app.db.schemas import JourneyCreate, Journey

router = APIRouter(prefix="/journey", tags=["journey"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_journey(payload: JourneyCreate, db: Session = Depends(get_db)):
    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="title darf nicht leer sein")

    if (
        payload.start_date
        and payload.end_date
        and payload.end_date < payload.start_date
    ):
        raise HTTPException(
            status_code=400, detail="end_date darf nicht vor start_date liegen"
        )

    journey = Journey(
        title=payload.title.strip(),
        price=payload.price,
        start_date=payload.start_date,
        end_date=payload.end_date,
        description=payload.description or "",
    )

    db.add(journey)
    db.commit()
    db.refresh(journey)
    return journey


@router.get("/{journey_id}", response_model=Journey)
def get_journey(journey_id: int, db: Session = Depends(get_db)):
    journey = db.query(models.Journey).filter(models.Journey.id == journey_id).first()

    if journey is None:
        raise HTTPException(status_code=404, detail="Reise nicht gefunden")

    return journey


@router.put("/{journey_id}", response_model=schemas.Journey)
def update_journey(
    journey_id: int,
    payload: schemas.JourneyUpdate,
    db: Session = Depends(get_db),
):
    journey = db.get(models.Journey, journey_id)
    if not journey:
        raise HTTPException(status_code=404, detail="Journey nicht gefunden")

    if payload.title is not None:
        t = payload.title.strip()
        if not t:
            raise HTTPException(status_code=400, detail="title darf nicht leer sein")
        journey.title = t

    if payload.start_date is not None:
        journey.start_date = payload.start_date

    if payload.end_date is not None:
        journey.end_date = payload.end_date

    if (
        journey.start_date
        and journey.end_date
        and journey.end_date < journey.start_date
    ):
        raise HTTPException(
            status_code=400, detail="end_date darf nicht vor start_date liegen"
        )

    if payload.price is not None:
        journey.price = payload.price

    if payload.description is not None:
        journey.description = payload.description or ""

    db.commit()
    db.refresh(journey)
    return journey
