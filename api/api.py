from auth_token import auth_token
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from io import BytesIO
import base64
from huggingface_hub import InferenceClient
from fastapi.responses import JSONResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[""],
    allow_methods=[""],
    allow_headers=["*"]
)

client = InferenceClient(
    model="stabilityai/stable-diffusion-3.5-large",
    token=auth_token
)

@app.get("/")
def generate(
    prompt: str,
    guidance_scale: float = 8.5,  # Default value for guidance_scale
    num_inference_steps: int = 30,  # Default value for inference steps
    width: int = Query(512, ge=64),  # Default width is 512, minimum is 64
    height: int = Query(512, ge=64)  # Default height is 512, minimum is 64
):
    # Generowanie obrazu na podstawie parametrów
    image = client.text_to_image(
        prompt=prompt,
        guidance_scale=guidance_scale,
        num_inference_steps=num_inference_steps,
        width=width,
        height=height
    )

    # Konwersja obrazu na format base64
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    imgstr = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return JSONResponse(content={"image": imgstr})