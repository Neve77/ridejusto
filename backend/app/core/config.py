import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ridejusto.db")
SECRET_KEY = os.getenv("SECRET_KEY", "ridejusto-secret")
ALGORITHM = "HS256"