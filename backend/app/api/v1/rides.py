from fastapi import APIRouter
from app.core.deps import get_current_user
from app.models.user import User

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
@router.post("/request")
def request_ride(
    ride: RideCreate,
    current_user: User = Depends(get_current_user)
):
    return {
        "message": "Corrida solicitada",
        "user_id": current_user.id
    }
