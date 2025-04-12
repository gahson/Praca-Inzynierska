from auth_token import auth_token
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from io import BytesIO
import base64
from huggingface_hub import InferenceClient
from fastapi.responses import JSONResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

client = InferenceClient(
    model="stabilityai/stable-diffusion-3.5-large",
    token=auth_token
    
)

@app.get("/")
def generate(prompt: str, negative_prompt : str, width : str, height : str):
    image = client.text_to_image(prompt=prompt, negative_prompt=negative_prompt, guidance_scale=8.5, num_inference_steps=30, width=int(width), height=int(height))

    buffer = BytesIO()
    image.save(buffer, format="PNG")
    imgstr = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return JSONResponse(content={"image": imgstr})
