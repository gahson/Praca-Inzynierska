from fastapi import FastAPI

from backend.controllers.gallery import gallery_router
from backend.controllers.prompts import prompts_router
from backend.controllers.auth import auth_router
from backend.controllers.model import models_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(gallery_router, prefix="/gallery", tags=["gallery"])
app.include_router(prompts_router, prefix="/prompts", tags=["prompts"])
app.include_router(auth_router, prefix="/auth", tags=["auth"])

app.include_router(models_router, prefix='/model', tags=['model'])