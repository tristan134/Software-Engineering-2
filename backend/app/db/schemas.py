from datetime import datetime, time, date
from pydantic import BaseModel, ConfigDict, field_serializer
from typing import List, Optional
from decimal import Decimal


# =========================================================
# JOURNEY
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

    # formatting price
    @field_serializer("price")
    def serialize_price(self, v: Optional[Decimal]):
        if v is None:
            return None
        return float(v)


# ---------------------------------------------------------
# DAY
# ---------------------------------------------------------

class DayBase(BaseModel):
    title: str
    journey_id: int
    date: date


class DayCreate(DayBase):
    pass


class DayUpdate(BaseModel):
    title: Optional[str] = None


class Day(DayBase):
    id: int
    activities: List["Activity"] = []

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------
# ACTIVITY
# ---------------------------------------------------------

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
    files: List["FileUpload"] = []

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------
# FILE UPLOAD
# ---------------------------------------------------------

class FileUploadBase(BaseModel):
    activity_id: int
    file_name: str
    file_url: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None


class FileUploadCreate(FileUploadBase):
    pass


class FileUploadUpdate(BaseModel):
    file_name: Optional[str] = None
    file_url: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None


class FileUpload(FileUploadBase):
    id: int
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)