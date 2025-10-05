from typing import List, Optional
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: Optional[str]
    first_name: str
    last_name: str
    email: EmailStr
    gallery: List[str] = []
    prompts: List[str] = []
    role: str

    model_config = {
        "from_attributes": True
    }

