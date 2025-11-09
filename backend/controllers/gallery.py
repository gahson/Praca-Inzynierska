from fastapi import APIRouter, Depends, HTTPException, Query
from utils.auth_helpers import get_current_user
from database.mongo import db
from bson import ObjectId

gallery_router = APIRouter()

@gallery_router.get("/")
async def get_gallery(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100),current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])

    images = await db.generated_images.find({"user_id": ObjectId(user_id)}).sort("created_at", -1).skip((page - 1) * page_size).limit(page_size).to_list()
    images_num = await db.generated_images.count_documents({"user_id": ObjectId(user_id)})
    
    return {
        "page": page,
        "page_size": page_size,
        "total_pages": (images_num + page_size - 1) // page_size,
        "images": [
            {
                "id": str(img["_id"]),
                "image_base64": img["image_base64"],
                "model": img.get("model"),
                "mode": img.get("mode"),
                "prompt": img.get("prompt"),
                "negative_prompt": img.get("negative_prompt"),
                "guidance_scale": img.get("guidance_scale"),
                "canny_low_threshold": img.get("canny_low_threshold"),
                "canny_high_threshold": img.get("canny_high_threshold"),
                "pad_left": img.get("pad_left"),
                "pad_right": img.get("pad_right"),
                "pad_top": img.get("pad_top"),
                "pad_bottom": img.get("pad_bottom"),
                "seed": img.get("seed"),
                "width": img.get("width"),
                "height": img.get("height"),
                "created_at": img.get("created_at"),
                "scaling_mode": img.get("scaling_mode"),
            }
            for img in images
        ]
    }

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
