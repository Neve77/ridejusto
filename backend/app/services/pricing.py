def calculate_price(distance_km: float):
    if distance_km <= 5:
        return 12
    elif distance_km <= 10:
        return 18
    elif distance_km <= 15:
        return 25
    return 25 + (distance_km - 15) * 2