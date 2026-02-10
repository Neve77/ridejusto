from fastapi import APIRouter
from app.schemas.ride import RideRequest

router = APIRouter(prefix="/rides", tags=["Rides"])


@router.post("/request")
def request_ride(data: RideRequest):
    return {
        "message": "Corrida solicitada com sucesso",
        "origin": data.origin,
        "destination": data.destination,
        "payment_method": data.payment_method
    }
