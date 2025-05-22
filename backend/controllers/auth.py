from fastapi import APIRouter, HTTPException, Depends
from bson.objectid import ObjectId

from backend.schemas.user import UserCreate, UserLogin
from backend.utils.auth_helpers import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)
from backend.database.mongo import db

auth_router = APIRouter()

@auth_router.post("/register")
async def register(user: UserCreate):
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_data = {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "password": hash_password(user.password),
        "gallery": [],
        "prompts": []
    }

    result = await db.users.insert_one(user_data)
    return {"message": "User registered successfully", "user_id": str(result.inserted_id)}


@auth_router.post("/login")
async def login(user: UserLogin):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(str(db_user["_id"]))

    return {
        "access_token": token,
        "first_name": db_user["first_name"],
        "last_name": db_user["last_name"],
        "email": db_user["email"]
    }


@auth_router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "user_id": str(current_user["_id"]),
        "first_name": current_user["first_name"],
        "last_name": current_user["last_name"],
        "email": current_user["email"],
    }
