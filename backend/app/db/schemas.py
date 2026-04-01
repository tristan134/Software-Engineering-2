from datetime import time, date
import datetime as dt
from pydantic import BaseModel, ConfigDict, field_serializer
from typing import List, Optional
from decimal import Decimal


# =========================================================
# JOURNEY (Reise)
# =========================================================


class JourneyBase(BaseModel):
    title: str
    price: Optional[Decimal] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None


class JourneyCreate(JourneyBase):
    pass


class JourneyUpdate(BaseModel):
    title: Optional[str] = None
    price: Optional[Decimal] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None


class Journey(JourneyBase):
    id: int
    days: List["Day"] = []

    model_config = ConfigDict(from_attributes=True)


class ShowJourneySummarize(JourneyBase):
    id: int

    # Preisformatierung
    @field_serializer("price")
    def serialize_price(self, v: Optional[Decimal]):
        if v is None:
            return None
        return float(v)


# =========================================================
# DAY (Tag)
# =========================================================


class DayBase(BaseModel):
    title: str
    journey_id: int
    date: date


class DayCreate(DayBase):
    pass


class DayUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[dt.date] = None


class Day(DayBase):
    id: int
    activities: List["Activity"] = []

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# ACTIVITY (Aktivität)
# =========================================================


class ActivityBase(BaseModel):
    title: str
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    day_id: int


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(BaseModel):
    title: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None


class Activity(ActivityBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
