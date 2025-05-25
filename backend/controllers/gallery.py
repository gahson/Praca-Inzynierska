from fastapi import APIRouter, Depends, HTTPException
from backend.utils.auth_helpers import get_current_user
from backend.database.mongo import db
from bson import ObjectId

gallery_router = APIRouter()

@gallery_router.get("/")
async def get_gallery(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    images = await db.generated_images.find({"user_id": ObjectId(user_id)}).to_list(length=100)

    return [
        {
            "id": str(img["_id"]),
            "image_base64": img["image_base64"],
            "model": img.get("model"),
            "mode": img.get("mode"),
            "prompt": img.get("prompt"),
            "negative_prompt": img.get("negative_prompt"),
            "guidance_scale": img.get("guidance_scale"),
            "seed": img.get("seed"),
            "width": img.get("width"),
            "height": img.get("height"),
            "created_at": img.get("created_at"),
        }
        for img in images
    ]

@gallery_router.delete("/{image_id}")
async def delete_image(image_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    image = await db.generated_images.find_one({"_id": ObjectId(image_id)})

    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    if image["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this image")

    await db.generated_images.delete_one({"_id": ObjectId(image_id)})

    return {"message": "Image deleted"}
