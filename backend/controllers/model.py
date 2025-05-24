
from diffusers import (
    StableDiffusionPipeline,
    StableDiffusionImg2ImgPipeline,
    StableDiffusionInpaintPipeline,
    AutoPipelineForImage2Image,
    AutoPipelineForInpainting,
    DDIMScheduler,
    DPMSolverMultistepScheduler ,
    UniPCMultistepScheduler ,
)
from huggingface_hub import login
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
DEFAULT_INPAINTING_SCHEDULER = DPMSolverMultistepScheduler
RESIZING_ALGORITHM = Image.BICUBIC
REFINER_POSITIVE_PROMPT = 'masterpiece, best quality, ultra detailed, 8k, photorealistic, sharp focus, intricate details, award winning, cinematic lighting, professional photo, realistic shadows, high dynamic range'
REFINER_NEGATIVE_PROMPT = 'low quality, blurry, pixelated, deformed, bad anatomy, oversaturated, underexposed, artifacts, watermark, jpeg artifacts, text, cartoon, out of focus, noisy, grainy, overcompressed'

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
    pipe.scheduler = DEFAULT_INPAINTING_SCHEDULER.from_config(pipe.scheduler.config, algorithm_type="sde-dpmsolver++")
    
    return pipe


def prepare_inpainting_pipe():
    pipe = StableDiffusionInpaintPipeline.from_pretrained(
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
inpainting = prepare_inpainting_pipe()


class TextToImageRequest(BaseModel):
    prompt: str
    negative_prompt : str
    guidance_scale : float
    width : int
    height : int
    seed : int
    
    
class Img2ImgRequest(BaseModel):
    prompt: str
    negative_prompt : str
    guidance_scale : float
    seed : int
    image : str
    
    
class Inpainting(BaseModel):
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
        prompt=textToImageRequest.prompt + REFINER_POSITIVE_PROMPT,
        image=image,
        strength=1.0,
        num_inference_steps=30,
        guidance_scale=10,
        negative_prompt=textToImageRequest.negative_prompt + REFINER_NEGATIVE_PROMPT,
        num_images_per_prompt=1,
        #eta
        generator=torch.Generator(device=device).manual_seed(textToImageRequest.seed),
        #prompt_embeds
        #negative_prompt_embeds
        #output_type
        #return_dict
        callback=text_to_image_callback,
        callback_steps=1,
    ).images[0]
        
    # Upscaling
    image = image.resize((textToImageRequest.width, textToImageRequest.height), RESIZING_ALGORITHM)

    return JSONResponse(content={"image": image_to_string(image)})
   
   
def text_to_image_callback(step, timepstamp, latents):
    ...



@models_router.post('/generate/image-to-image')
def edit_image(img2imgRequest: Img2ImgRequest):
    
    image = string_to_image(img2imgRequest.image)
    img_width, img_height = image.size
    
    # Resizing to model's native 512x512
    image = image.resize((512, 512), RESIZING_ALGORITHM)
    
    # Generating new image
    image = img2img(
        
        prompt=img2imgRequest.prompt,
        image=image,
        strength=1.0,
        num_inference_steps=30,
        guidance_scale=img2imgRequest.guidance_scale,
        negative_prompt=img2imgRequest.negative_prompt,
        num_images_per_prompt=1,
        #eta
        generator=torch.Generator(device=device).manual_seed(img2imgRequest.seed),
        #prompt_embeds
        #negative_prompt_embeds
        #output_type
        #return_dict
        callback=text_to_image_callback,
        callback_steps=1,
    ).images[0]
    
    # Resizing back to the original size
    image = image.resize((img_width, img_height), RESIZING_ALGORITHM)

    return JSONResponse(content={"image": image_to_string(image)})


@models_router.post('/generate/inpainting')
def image_inpainting(inpainting: Inpainting):
    
    image = string_to_image(inpainting.image)
    img_width, img_height = image.size
    
    mask = string_to_image(inpainting.mask_image)
    
    # Resizing to model's native 512x512
    image = image.resize((512, 512), RESIZING_ALGORITHM)
    mask = mask.resize((512, 512), RESIZING_ALGORITHM)
    
    # Generating image
    image = inpainting(
        
        prompt=inpainting.prompt,
        image=string_to_image(image) ,
        mask_image=string_to_image(mask),
        height=512,
        width=512,
        #padding_mask_crop 
        strength=1.0,
        #timesteps
        #sigmas
        guidance_scale=inpainting.guidance_scale, 
        negative_prompt=inpainting.negative_prompt,
        num_images_per_promp=1,
        #eta
        generator=torch.Generator(device=device).manual_seed(inpainting.seed),
        #latents
        #prompt_embeds
        #negative_prompt_embeds
        #ip_adapter_image
        #ip_adapter_image_embeds
        #output_type
        #return_dict
        #cross_attention_kwargs
        #clip_skip
        #callback_on_step_end
        #callback_on_step_end_tensor_inputs 

    ).images[0]
    
    # Resizing back to the original size
    image = image.resize((img_width, img_height), RESIZING_ALGORITHM)

    return JSONResponse(content={"image": image_to_string(image)})