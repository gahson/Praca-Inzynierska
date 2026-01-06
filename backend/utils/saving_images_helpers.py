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

async def save_image_record(user_id: str, image_base64: str, metadata: dict, canvas_id: str = None):
    """
    Save image into `generated_images` and optionally push a snapshot into a canvas.

    Returns: inserted image ObjectId
    """
    record = {
        "user_id": ObjectId(user_id),
        "image_base64": image_base64,
        "created_at": datetime.utcnow(),
        **metadata
    }
    result = await images_collection.insert_one(record)

    # If canvas_id provided, push snapshot into canvases.images
    if canvas_id:
        try:
            canvases_coll = db["canvases"]
            await canvases_coll.update_one(
                {"_id": ObjectId(canvas_id), "user_id": ObjectId(user_id)},
                {
                    "$push": {
                        "images": {
                            "image_id": result.inserted_id,
                            "image_base64": image_base64,
                            "metadata": metadata,
                            "created_at": datetime.utcnow(),
                        }
                    }
                }
            )
        except Exception:
            pass

    return result.inserted_id