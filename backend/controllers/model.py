
from diffusers import (
    StableDiffusionPipeline,
    StableDiffusionImg2ImgPipeline,
    AutoPipelineForImage2Image,
    AutoPipelineForInpainting,
    DDIMScheduler,
    DPMSolverMultistepScheduler ,
    UniPCMultistepScheduler ,
)
from huggingface_hub import hf_hub_download, login
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import torch
from io import BytesIO
import base64
from PIL import Image

HF_TOKEN = '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' # To be deleted
DEFAULT_MODEL = 'stable-diffusion-v1-5/stable-diffusion-v1-5'
DEFAULT_TEXT2IMAGE_SCHEDULER = UniPCMultistepScheduler
DEFAULT_IMG2IMG_SCHEDULER = DPMSolverMultistepScheduler 


models = [
    'CompVis/stable-diffusion-v1-4',
    'stable-diffusion-v1-5/stable-diffusion-v1-5',
    'stabilityai/stable-diffusion-2-1',
    'stabilityai/stable-diffusion-3-medium-diffusers',
    "stabilityai/stable-diffusion-xl-base-1.0"
]


def prepare_text_to_image_pipe():
    pipe = StableDiffusionPipeline.from_pretrained(
        DEFAULT_MODEL,
        use_safetensors=True,
        safety_checker=None,
        torch_dtype=torch.float16,
    ).to(device)
    pipe.scheduler = DEFAULT_TEXT2IMAGE_SCHEDULER.from_config(pipe.scheduler.config)
    
    return pipe


def prepare_img_to_img_pipe():
    pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
        DEFAULT_MODEL,
        use_safetensors=True,
        safety_checker=None,
        torch_dtype=torch.float16,
    ).to(device)
    pipe.scheduler = DEFAULT_IMG2IMG_SCHEDULER.from_config(pipe.scheduler.config, algorithm_type="sde-dpmsolver++")
    
    return pipe


device = 'cuda' if torch.cuda.is_available() else 'cpu'
models_router = APIRouter()
login(HF_TOKEN)
txt2img = prepare_text_to_image_pipe()
img2img = prepare_img_to_img_pipe()


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


'''
Documentation:
    - https://huggingface.co/docs/diffusers/v0.13.0/en/api/pipelines/stable_diffusion/text2img
    - https://huggingface.co/docs/diffusers/v0.13.0/en/api/pipelines/stable_diffusion/img2img
'''
@models_router.post('/generate/text-to-image')
def text_to_image(textToImageRequest : TextToImageRequest):

    # generating initial image
    image = txt2img(
        prompt=textToImageRequest.prompt,
        height=512,
        width=512,
        num_inference_steps=30,
        guidance_scale=textToImageRequest.guidance_scale,
        negative_prompt=textToImageRequest.negative_prompt,
        num_images_per_prompt=1,
        #eta
        generator=torch.Generator(device=device).manual_seed(textToImageRequest.seed),
        #latents
        #prompt_embeds
        #negative_prompt_embeds
        #output_type
        #return_dict
        callback=text_to_image_callback,
        callback_steps=1,
        #cross_attention_kwargs
    ).images[0]
        
    # refining generated image
    image = img2img(
        prompt=textToImageRequest.prompt+',high quality',
        image=image,
        strength=0.6,
        num_inference_steps=50,
        guidance_scale=10,
        negative_prompt=textToImageRequest.negative_prompt,
        num_images_per_prompt=1,
        #eta
        #generator
        #prompt_embeds
        #negative_prompt_embeds
        #output_type
        #return_dict
        callback=text_to_image_callback,
        callback_steps=1,
    ).images[0]
        
    # Upscaling
    image = image.resize((textToImageRequest.width, textToImageRequest.height), Image.BILINEAR)

    return JSONResponse(content={"image": image_to_string(image)})
   
def text_to_image_callback(step, timepstamp, latents):
    #print(step, timepstamp)
    ...


@models_router.post('/generate/image-to-image')
def edit_image(img2img: Img2Img):
    pipe = AutoPipelineForImage2Image.from_pretrained(
        img2img.model,
        use_safetensors=True,
        safety_checker=None,
        torch_dtype=torch.float16,
    ).to(device)
    
    pipe.scheduler = DDIMScheduler.from_config(pipe.scheduler.config)

    image = pipe(
        prompt=img2img.prompt,
        negative_prompt=img2img.negative_prompt,
        image=string_to_image(img2img.image),
        guidance_scale=img2img.guidance_scale, 
        generator=torch.Generator(device=device).manual_seed(img2img.seed),
    ).images[0]

    return JSONResponse(content={"image": image_to_string(image)})


@models_router.post('/generate/inpainting')
def image_inpainting(inpainting: Inpainting):
    pipe = AutoPipelineForInpainting.from_pretrained(
        inpainting.model,
        use_safetensors=True,
        safety_checker=None,
        torch_dtype=torch.float16,
    ).to(device)
    
    pipe.scheduler = DDIMScheduler.from_config(pipe.scheduler.config)
    
    image = pipe(
        prompt=inpainting.prompt,
        negative_prompt=inpainting.negative_prompt,
        image=string_to_image(inpainting.image),
        init_image=string_to_image(inpainting.mask_image),
        guidance_scale=inpainting.guidance_scale, 
        generator=torch.Generator(device=device).manual_seed(inpainting.seed),
    ).images[0]

    return JSONResponse(content={"image": image_to_string(image)})