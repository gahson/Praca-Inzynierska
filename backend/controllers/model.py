from diffusers import AutoPipelineForText2Image, AutoPipelineForImage2Image, AutoPipelineForInpainting, DPMSolverMultistepScheduler
from huggingface_hub import hf_hub_download, login
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import torch
from io import BytesIO
import base64
from PIL import Image

models = [
    'CompVis/stable-diffusion-v1-4',
    'stable-diffusion-v1-5/stable-diffusion-v1-5',
    'stabilityai/stable-diffusion-2-1',
    'stabilityai/stable-diffusion-3-medium-diffusers',
    "stabilityai/stable-diffusion-xl-base-1.0"
]


HF_TOKEN = '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' # To be deleted
device = 'cuda' if torch.cuda.is_available() else 'cpu'
models_router = APIRouter()
login(HF_TOKEN)


class TextToImageRequest(BaseModel):
    model: str
    prompt: str
    negative_prompt : str
    guidance_scale : float
    width : int
    height : int
    seed : int
    
    
class Img2Img(BaseModel):
    model: str
    prompt: str
    negative_prompt : str
    guidance_scale : float
    seed : int
    image : str
    
    
class Inpainting(BaseModel):
    model: str
    prompt: str
    negative_prompt : str
    guidance_scale : float
    seed : int
    image : str
    mask_image : str


def image_to_string(image):
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def string_to_image(base64_str):
    image_data = base64.b64decode(base64_str)
    return Image.open(BytesIO(image_data))


@models_router.get('/list')
def get_models():
    return models


@models_router.post('/generate/text-to-image')
def text_to_image(textToImageRequest : TextToImageRequest):
    
    pipe = AutoPipelineForText2Image.from_pretrained(
        textToImageRequest.model,
        use_safetensors=True,
        safety_checker=None,
        torch_dtype=torch.float16,
    ).to(device)
    
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)

    image = pipe(
        prompt=textToImageRequest.prompt,
        negative_prompt=textToImageRequest.negative_prompt,
        guidance_scale=textToImageRequest.guidance_scale, 
        generator=torch.Generator(device=device).manual_seed(textToImageRequest.seed),
        width=textToImageRequest.width, 
        height=textToImageRequest.height,
    ).images[0]
        
    return JSONResponse(content={"image": image_to_string(image)})
   

@models_router.post('/generate/image-to-image')
def edit_image(img2img: Img2Img):
    pipe = AutoPipelineForImage2Image.from_pretrained(
        img2img.model,
        use_safetensors=True,
        safety_checker=None,
        torch_dtype=torch.float16,
    ).to(device)
    
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)

    image = pipe(
        prompt=img2img.prompt,
        negative_prompt=img2img.negative_prompt,
        image=string_to_image(img2img.image),
        guidance_scale=img2img.guidance_scale, 
        generator=torch.Generator(device=device).manual_seed(img2img.seed),
    ).images[0]

    return JSONResponse(content={"image": image_to_string(image)})


@models_router.post('/generate/inpainting')
def edit_image(inpainting: Inpainting):
    pipe = AutoPipelineForInpainting.from_pretrained(
        inpainting.model,
        use_safetensors=True,
        safety_checker=None,
        torch_dtype=torch.float16,
    ).to(device)
    
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
    
    image = pipe(
        prompt=inpainting.prompt,
        negative_prompt=inpainting.negative_prompt,
        image=string_to_image(inpainting.image),
        init_image=string_to_image(inpainting.mask_image),
        guidance_scale=inpainting.guidance_scale, 
        generator=torch.Generator(device=device).manual_seed(inpainting.seed),
    ).images[0]

    return JSONResponse(content={"image": image_to_string(image)})