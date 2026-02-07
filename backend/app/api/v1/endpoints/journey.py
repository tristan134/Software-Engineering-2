from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Journey
from app.db.schemas import JourneyCreate

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
