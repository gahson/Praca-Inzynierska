from datetime import datetime
from bson import ObjectId
from io import BytesIO
import base64
from PIL import Image

from database.mongo import db
images_collection = db["generated_images"]

def image_to_string(image):
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")

def string_to_image(base64_str):
    image_data = base64.b64decode(base64_str)
    return Image.open(BytesIO(image_data)).convert("RGB")

async def save_image_record(user_id: str, image_base64: str, metadata: dict):
    record = {
        "user_id": ObjectId(user_id),
        "image_base64": image_base64,
        "created_at": datetime.utcnow(),

        **metadata
    }
    await images_collection.insert_one(record)