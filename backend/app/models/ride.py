from sqlalchemy import Column, Integer, Float, String
from app.database.base import Base

class Ride(Base):
    __tablename__ = "rides"
    id = Column(Integer, primary_key=True)
    passenger_id = Column(Integer)
    driver_id = Column(Integer, nullable=True)
    distance_km = Column(Float)
    price = Column(Float)
    status = Column(String)