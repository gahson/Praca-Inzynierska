from diffusers import AutoPipelineForText2Image, DPMSolverMultistepScheduler
from huggingface_hub import hf_hub_download, login
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import torch
from io import BytesIO
import base64

models = [
    'CompVis/stable-diffusion-v1-4',
    'stable-diffusion-v1-5/stable-diffusion-v1-5',
    'stabilityai/stable-diffusion-2-1',
    'stabilityai/stable-diffusion-3-medium-diffusers',
]

HF_TOKEN = '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' # To be deleted
device = 'cuda' if torch.cuda.is_available() else 'cpu'
models_router = APIRouter()
login(HF_TOKEN)


class GenerateRequest(BaseModel):
    model: str
    prompt: str
    negative_prompt : str
    guidance_scale : float
    width : int
    height : int
    seed : int


@models_router.get('/list')
def get_models():
    return models


@models_router.post('/generate')
def generate(generateRequest : GenerateRequest):
    
    pipe = AutoPipelineForText2Image.from_pretrained(
        generateRequest.model,
        use_safetensors=True,
        safety_checker=None,
        torch_dtype=torch.float16
    ).to(device)
    
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
    #pipe.enable_xformers_memory_efficient_attention()
    
    # Negative prompt robi halucynacje nawet z pustym stringiem
    image = pipe(
        prompt=generateRequest.prompt,
        negative_prompt=generateRequest.negative_prompt,
        guidance_scale=generateRequest.guidance_scale, 
        generator=torch.Generator(device=device).manual_seed(generateRequest.seed),
        width=generateRequest.width, 
        height=generateRequest.height,
    ).images[0]
        

    buffer = BytesIO()
    image.save(buffer, format="PNG")
    imgstr = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return JSONResponse(content={"image": imgstr})