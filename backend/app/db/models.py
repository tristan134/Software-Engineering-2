from sqlalchemy import String, Text, Date, ForeignKey, Time, Numeric
from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base
import datetime
from decimal import Decimal


class Journey(Base):
    __tablename__ = "journey"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    start_date: Mapped[datetime.date] = mapped_column(Date)
    end_date: Mapped[datetime.date] = mapped_column(Date)
    description: Mapped[str] = mapped_column(Text)

    days: Mapped[list["Day"]] = relationship(
        back_populates="journey", cascade="all, delete"
    )


class Day(Base):
    __tablename__ = "days"
    __table_args__ = (
        UniqueConstraint("journey_id", "date", name="uq_days_journey_date"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)

    date: Mapped[datetime.date] = mapped_column(Date, nullable=False)

    journey_id: Mapped[int] = mapped_column(ForeignKey("journey.id"), nullable=False)

    journey: Mapped["Journey"] = relationship(back_populates="days")
    activities: Mapped[list["Activity"]] = relationship(
        back_populates="day",
        cascade="all, delete-orphan",
        order_by="Activity.start_time",
    )


class Activity(Base):
    __tablename__ = "activity"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)

    start_time: Mapped[datetime.time | None] = mapped_column(Time, nullable=True)
    end_time: Mapped[datetime.time | None] = mapped_column(Time, nullable=True)

    day_id: Mapped[int] = mapped_column(ForeignKey("days.id"), nullable=False)

    day: Mapped["Day"] = relationship(back_populates="activities")
    files: Mapped[list["FileUpload"]] = relationship(
        back_populates="activity", cascade="all, delete-orphan"
    )


class FileUpload(Base):
    __tablename__ = "file_uploads"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    activity_id: Mapped[int] = mapped_column(ForeignKey("activity.id"))
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_url: Mapped[str] = mapped_column(Text, nullable=False)

    activity: Mapped["Activity"] = relationship(back_populates="files")
