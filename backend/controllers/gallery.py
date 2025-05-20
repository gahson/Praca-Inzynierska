from fastapi import APIRouter, Depends, HTTPException
from backend.utils.auth_helpers import get_current_user
from ..database.mongo import db
from bson.objectid import ObjectId

gallery_router = APIRouter()

@gallery_router.get("/")
async def get_gallery(current_user: dict = Depends(get_current_user)):
    return current_user.get("gallery", [])

@gallery_router.post("/")
async def add_image(image: str, current_user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$push": {"gallery": image}}
    )
    return {"message": "Image added"}

@gallery_router.delete("/{index}")
async def delete_image(index: int, current_user: dict = Depends(get_current_user)):
    gallery = current_user.get("gallery", [])
    if index >= len(gallery) or index < 0:
        raise HTTPException(status_code=404, detail="Image not found")

    gallery.pop(index)
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"gallery": gallery}}
    )
    return {"message": "Image deleted"}

# PUT (optional) – jeśli np. edytujesz opis, tagi, itd.
