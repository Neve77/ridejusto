from sqlalchemy import Column, Integer, Boolean, Float, ForeignKey
from app.database.base import Base

class Driver(Base):
    __tablename__ = "drivers"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    online = Column(Boolean, default=False)
    balance = Column(Float, default=0)