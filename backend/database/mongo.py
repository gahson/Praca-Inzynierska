from motor.motor_asyncio import AsyncIOMotorClient
from os import getenv
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")

MONGO_URL = getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client["pracainz"]
print("MONGO_URL =", MONGO_URL)