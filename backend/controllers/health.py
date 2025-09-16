from fastapi import APIRouter

health = APIRouter()

@health.get("")
async def health_check():
    return {"status": "ok", "message": "Backend is alive"}