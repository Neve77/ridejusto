from pydantic import BaseModel
from enum import Enum


class PaymentMethod(str, Enum):
    pix = "pix"
    credit = "credit"
    debit = "debit"
    cash = "cash"


class RideRequest(BaseModel):
    origin: str
    destination: str
    payment_method: PaymentMethod
