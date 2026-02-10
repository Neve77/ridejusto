from fastapi import FastAPI
from app.api import rides, auth

app = FastAPI(
    title="RideJusto API",
    version="0.1.0"
)

app.include_router(auth.router)
app.include_router(rides.router)
