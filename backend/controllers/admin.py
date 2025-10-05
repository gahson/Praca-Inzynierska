from fastapi import APIRouter, HTTPException, Depends
from database.mongo import db
from utils.auth_helpers import get_current_user
from bson import ObjectId

admin_router = APIRouter()

@admin_router.get("/users")
async def get_users(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    users_cursor = db.users.find(
        {}, 
        {"first_name": 1, "last_name": 1, "email": 1, "role": 1}
    )
    users = await users_cursor.to_list(length=None)

    result = [
        {
            "id": str(user["_id"]),
            "first_name": user.get("first_name"),
            "last_name": user.get("last_name"),
            "email": user.get("email"),
            "role": user.get("role"),
        }
        for user in users
    ]

    return {"users": result}


@admin_router.get("/user/{user_id}/details")
async def get_user_details(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied: Admins only")

    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    images = await db.generated_images.find({"user_id": ObjectId(user_id)}).to_list(length=100)

    gallery = [
        {
            "id": str(img["_id"]),
            "image_base64": img.get("image_base64"),
            "prompt": img.get("prompt"),
            "model": img.get("model"),
            "mode": img.get("mode"),
            "guidance_scale": img.get("guidance_scale"),
            "width": img.get("width"),
            "height": img.get("height"),
            "created_at": img.get("created_at"),
        }
        for img in images
    ]

    return {
        "user_id": str(user["_id"]),
        "email": user["email"],
        "first_name": user.get("first_name"),
        "last_name": user.get("last_name"),
        "role": user.get("role"),
        "gallery": gallery,
        "prompts": user.get("prompts", []),
    }


@admin_router.patch("/user/{user_id}")
async def update_user(user_id: str, data: dict, current_user: dict = Depends(get_current_user)):

    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    allowed_fields = {"first_name", "last_name", "email", "role"}
    update_data = {k: v for k, v in data.items() if k in allowed_fields and v is not None}

    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields provided for update")

    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})

    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})

    return {
        "message": "User updated successfully",
        "user": {
            "id": str(updated_user["_id"]),
            "first_name": updated_user.get("first_name"),
            "last_name": updated_user.get("last_name"),
            "email": updated_user.get("email"),
            "role": updated_user.get("role"),
        },
    }

@admin_router.delete("/user/{user_id}/image/{image_id}")
async def delete_user_image(user_id: str, image_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    if not ObjectId.is_valid(user_id) or not ObjectId.is_valid(image_id):
        raise HTTPException(status_code=400, detail="Invalid ID format")

    image = await db.generated_images.find_one({"_id": ObjectId(image_id), "user_id": ObjectId(user_id)})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found or does not belong to this user")

    await db.generated_images.delete_one({"_id": ObjectId(image_id)})

    return {"message": "Image deleted successfully", "image_id": image_id}