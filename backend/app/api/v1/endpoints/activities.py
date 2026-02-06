from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Day, Activity
from app.db.schemas import ActivityCreate
import app.db.schemas as schemas

router = APIRouter(prefix="/activities", tags=["activities"])


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.Activity)
def create_activity(payload: ActivityCreate, db: Session = Depends(get_db)):
    day = db.get(Day, payload.day_id)
    if not day:
        raise HTTPException(status_code=404, detail="Day nicht gefunden")

    if payload.start_time and payload.end_time and payload.end_time < payload.start_time:
        raise HTTPException(status_code=400, detail="Enddatum darf nicht vor Startdatum liegen")

    title = payload.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Titel darf nicht leer sein")

    act = Activity(
        title=title,
        day_id=payload.day_id,
        start_time=payload.start_time,
        end_time=payload.end_time
    )
    db.add(act)
    db.commit()
    db.refresh(act)
    return act
