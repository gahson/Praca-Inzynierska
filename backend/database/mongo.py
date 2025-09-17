from os import getenv
from dotenv import load_dotenv

from motor.motor_asyncio import AsyncIOMotorClient

env_file = getenv('ENV_FILE', '.env')
load_dotenv(env_file)

MONGO_URL = getenv("MONGO_URL", "mongodb://localhost:27017")

client = AsyncIOMotorClient(MONGO_URL)
db = client["pracainz"]
print("MONGO_URL =", MONGO_URL)