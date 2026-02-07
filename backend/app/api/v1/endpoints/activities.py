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

    if (
        payload.start_time
        and payload.end_time
        and payload.end_time < payload.start_time
    ):
        raise HTTPException(
            status_code=400, detail="Enddatum darf nicht vor Startdatum liegen"
        )

    title = payload.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Titel darf nicht leer sein")

    act = Activity(
        title=title,
        day_id=payload.day_id,
        start_time=payload.start_time,
        end_time=payload.end_time,
    )
    db.add(act)
    db.commit()
    db.refresh(act)
    return act


@router.get("/by-day/{day_id}", response_model=list[schemas.Activity])
def list_activities_for_day(day_id: int, db: Session = Depends(get_db)):
    day = db.get(Day, day_id)
    if not day:
        raise HTTPException(status_code=404, detail="Day nicht gefunden")
    return day.activities  # vorausgesetzt Relationship existiert


@router.put("/{activity_id}", response_model=schemas.Activity)
def update_activity(
    activity_id: int, payload: schemas.ActivityUpdate, db: Session = Depends(get_db)
):
    act = db.get(Activity, activity_id)
    if not act:
        raise HTTPException(status_code=404, detail="Aktivität nicht gefunden")

    # title optional updaten
    if payload.title is not None:
        title = payload.title.strip()
        if not title:
            raise HTTPException(status_code=400, detail="Titel darf nicht leer sein")
        act.title = title

    # times optional updaten
    if payload.start_time is not None:
        act.start_time = payload.start_time
    if payload.end_time is not None:
        act.end_time = payload.end_time

    if act.start_time and act.end_time and act.end_time < act.start_time:
        raise HTTPException(
            status_code=400, detail="Endzeit darf nicht vor Startzeit liegen"
        )

    db.commit()
    db.refresh(act)
    return act


@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    act = db.get(Activity, activity_id)
    if not act:
        raise HTTPException(status_code=404, detail="Aktivität nicht gefunden")

    db.delete(act)
    db.commit()
    return
