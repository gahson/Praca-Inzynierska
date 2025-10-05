from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from controllers.gallery import gallery_router
from controllers.prompts import prompts_router
from controllers.auth import auth_router
from controllers.model import models
from controllers.health import health
from controllers.admin import admin_router

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
app.include_router(models, prefix='/model', tags=['model'])
app.include_router(health, prefix='/health', tags=['health'])
app.include_router(admin_router, prefix='/admin', tags=['admin'])