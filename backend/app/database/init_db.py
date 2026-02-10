from app.database.session import engine
from app.database.base import Base
from app.models import user, driver, ride

def init_db():
    Base.metadata.create_all(bind=engine)