from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from utils.auth_helpers import get_current_user
from database.mongo import db
from bson import ObjectId
from datetime import datetime

canvases_router = APIRouter()

class CreateCanvasRequest(BaseModel):
    name: str

class AddImageRequest(BaseModel):
    image_base64: str
    metadata: dict = {}
    parent_id: str = None

@canvases_router.post("/")
async def create_canvas(req: CreateCanvasRequest, current_user: dict = Depends(get_current_user)):
    user_id = ObjectId(str(current_user["_id"]))
    doc = {
        "user_id": user_id,
        "name": req.name,
        "created_at": datetime.utcnow(),
        "images": []
    }
    res = await db["canvases"].insert_one(doc)

    try:
        await db.users.update_one({"_id": user_id}, {"$push": {"canvases": res.inserted_id}})
    except Exception:
        pass

    return {"id": str(res.inserted_id), "name": req.name}
@canvases_router.get("/")
async def list_canvases(current_user: dict = Depends(get_current_user)):
    user_id = ObjectId(str(current_user["_id"]))
    items = await db["canvases"].find({"user_id": user_id}).to_list(None)
    
    return [{"id": str(i["_id"]), "name": i.get("name"), "images_count": len(i.get("images", [])), "created_at": i.get("created_at")} for i in items]

@canvases_router.get("/{canvas_id}")
async def get_canvas(canvas_id: str, current_user: dict = Depends(get_current_user)):
    c = await db["canvases"].find_one({"_id": ObjectId(canvas_id)})

    if not c or c["user_id"] != current_user["_id"]:
        raise HTTPException(status_code=404, detail="Canvas not found")
    images = []

    for img in c.get("images", []):
        image_id = img.get("image_id")
        images.append({
            "image_id": str(image_id) if image_id else None,
            "parent_id": img.get("parent_id"),
            "image_base64": img.get("image_base64"),
            "metadata": img.get("metadata"),
            "created_at": img.get("created_at")
        })
    return {
        "id": str(c["_id"]),
        "name": c.get("name"),
        "created_at": c.get("created_at"),
        "images": images
    }

@canvases_router.patch("/{canvas_id}")
async def update_canvas(canvas_id: str, req: CreateCanvasRequest, current_user: dict = Depends(get_current_user)):
    c = await db["canvases"].find_one({"_id": ObjectId(canvas_id)})

    if not c or c["user_id"] != current_user["_id"]:
        raise HTTPException(status_code=404, detail="Canvas not found")
    await db["canvases"].update_one(
        {"_id": ObjectId(canvas_id)},
        {"$set": {"name": req.name}}
    )
    return {"id": canvas_id, "name": req.name}

@canvases_router.delete("/{canvas_id}")
async def delete_canvas(canvas_id: str, current_user: dict = Depends(get_current_user)):
    c = await db["canvases"].find_one({"_id": ObjectId(canvas_id)})

    if not c or c["user_id"] != current_user["_id"]:
        raise HTTPException(status_code=404, detail="Canvas not found")
    await db["canvases"].delete_one({"_id": ObjectId(canvas_id)})

    try:
        await db.users.update_one({"_id": current_user["_id"]}, {"$pull": {"canvases": ObjectId(canvas_id)}})
    except Exception:
        pass

    return {"message": "Canvas deleted"}

@canvases_router.post("/{canvas_id}/images")
async def add_image_to_canvas(canvas_id: str, req: AddImageRequest, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    image_id = ObjectId()
    
    image_data = {
        "image_id": image_id,
        "image_base64": req.image_base64,
        "metadata": req.metadata or {},
        "created_at": datetime.utcnow()
    }
    if req.parent_id:
        image_data["parent_id"] = req.parent_id
    
    update_res = await db["canvases"].update_one(
        {"_id": ObjectId(canvas_id), "user_id": ObjectId(user_id)},
        {"$push": {"images": image_data} }
    )
    if update_res.modified_count == 0:
        raise HTTPException(status_code=404, detail="Canvas not found or not owned by user")
    return {"image_id": str(image_id)}

@canvases_router.delete("/{canvas_id}/images/{image_id}")
async def remove_image_from_canvas(canvas_id: str, image_id: str, current_user: dict = Depends(get_current_user)):

    try:
        result = await db["canvases"].update_one(
            {"_id": ObjectId(canvas_id), "user_id": ObjectId(str(current_user["_id"]))},
            {"$pull": {"images": {"image_id": ObjectId(image_id)}}}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Canvas or image not found")
        return {"message": "Image removed from canvas"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))