from fastapi import APIRouter, Depends, HTTPException
from backend.utils.auth_helpers import get_current_user
from backend.database.mongo import db

prompts_router = APIRouter()

@prompts_router.get("/")
async def get_prompts(current_user: dict = Depends(get_current_user)):
    return current_user.get("prompts", [])

@prompts_router.post("/")
async def add_prompt(prompt: str, current_user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$push": {"prompts": prompt}}
    )
    return {"message": "Prompt saved"}

@prompts_router.delete("/{index}")
async def delete_prompt(index: int, current_user: dict = Depends(get_current_user)):
    prompts = current_user.get("prompts", [])
    if index >= len(prompts) or index < 0:
        raise HTTPException(status_code=404, detail="Prompt not found")

    prompts.pop(index)
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"prompts": prompts}}
    )
    return {"message": "Prompt deleted"}
