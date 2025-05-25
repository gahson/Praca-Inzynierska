# Pozostały importy
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from huggingface_hub import login
from backend.schemas.generation import TextToImageRequest, Img2ImgRequest, Inpainting
from backend.utils.auth_helpers import get_current_user
from backend.utils.saving_images_helpers import image_to_string, string_to_image, save_image_record
import torch
from PIL import Image
import base64
from io import BytesIO

from diffusers import (
    StableDiffusionPipeline,
    StableDiffusionImg2ImgPipeline,
    StableDiffusionInpaintPipeline,
    DDIMScheduler,
    DPMSolverMultistepScheduler,
    UniPCMultistepScheduler,
)

HF_TOKEN = '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'
DEFAULT_MODEL = 'stable-diffusion-v1-5/stable-diffusion-v1-5'
DEFAULT_TEXT2IMAGE_SCHEDULER = UniPCMultistepScheduler
DEFAULT_IMG2IMG_SCHEDULER = DPMSolverMultistepScheduler
DEFAULT_INPAINTING_SCHEDULER = DPMSolverMultistepScheduler
RESIZING_ALGORITHM = Image.BICUBIC
REFINER_POSITIVE_PROMPT = 'masterpiece, best quality, ultra detailed, 8k, photorealistic, sharp focus, intricate details, award winning, cinematic lighting, professional photo, realistic shadows, high dynamic range'
REFINER_NEGATIVE_PROMPT = 'low quality, blurry, pixelated, deformed, bad anatomy, oversaturated, underexposed, artifacts, watermark, jpeg artifacts, text, cartoon, out of focus, noisy, grainy, overcompressed'

def text_to_image_callback(step, timestamp, latents):
    pass

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
inpainting_pipe = prepare_inpainting_pipe()

@models_router.post('/generate/text-to-image')
async def text_to_image(textToImageRequest: TextToImageRequest, current_user: dict = Depends(get_current_user)):
    image = txt2img(
        prompt=textToImageRequest.prompt,
        height=512,
        width=512,
        num_inference_steps=30,
        guidance_scale=textToImageRequest.guidance_scale,
        negative_prompt=textToImageRequest.negative_prompt,
        num_images_per_prompt=1,
        generator=torch.Generator(device=device).manual_seed(textToImageRequest.seed),
        callback=text_to_image_callback,
        callback_steps=1,
    ).images[0]

    image = img2img(
        prompt=textToImageRequest.prompt + REFINER_POSITIVE_PROMPT,
        image=image,
        strength=1.0,
        num_inference_steps=30,
        guidance_scale=10,
        negative_prompt=textToImageRequest.negative_prompt + REFINER_NEGATIVE_PROMPT,
        num_images_per_prompt=1,
        generator=torch.Generator(device=device).manual_seed(textToImageRequest.seed),
        callback=text_to_image_callback,
        callback_steps=1,
    ).images[0]

    image = image.resize((textToImageRequest.width, textToImageRequest.height), RESIZING_ALGORITHM)
    image_base64 = image_to_string(image)

    await save_image_record(
        user_id=str(current_user["_id"]),
        image_base64=image_base64,
        metadata={
            "model": DEFAULT_MODEL,
            "mode": "text2img",
            "prompt": textToImageRequest.prompt,
            "negative_prompt": textToImageRequest.negative_prompt,
            "guidance_scale": textToImageRequest.guidance_scale,
            "width": textToImageRequest.width,
            "height": textToImageRequest.height,
            "seed": textToImageRequest.seed
        }
    )

    return JSONResponse(content={"image": image_base64})

@models_router.post('/generate/image-to-image')
async def edit_image(img2imgRequest: Img2ImgRequest, current_user: dict = Depends(get_current_user)):
    image = string_to_image(img2imgRequest.image)
    img_width, img_height = image.size
    image = image.resize((512, 512), RESIZING_ALGORITHM)

    image = img2img(
        prompt=img2imgRequest.prompt,
        image=image,
        strength=1.0,
        num_inference_steps=30,
        guidance_scale=img2imgRequest.guidance_scale,
        negative_prompt=img2imgRequest.negative_prompt,
        num_images_per_prompt=1,
        generator=torch.Generator(device=device).manual_seed(img2imgRequest.seed),
        callback=text_to_image_callback,
        callback_steps=1,
    ).images[0]

    image = image.resize((img_width, img_height), RESIZING_ALGORITHM)
    image_base64 = image_to_string(image)

    await save_image_record(
        user_id=str(current_user["_id"]),
        image_base64=image_base64,
        metadata={
            "model": DEFAULT_MODEL,
            "mode": "img2img",
            "prompt": img2imgRequest.prompt,
            "negative_prompt": img2imgRequest.negative_prompt,
            "guidance_scale": img2imgRequest.guidance_scale,
            "seed": img2imgRequest.seed,
            "width": img_width,
            "height": img_height
        }
    )

    return JSONResponse(content={"image": image_base64})

@models_router.post('/generate/inpainting')
async def image_inpainting(inpainting: Inpainting, current_user: dict = Depends(get_current_user)):
    image = string_to_image(inpainting.image)
    mask = string_to_image(inpainting.mask_image)
    img_width, img_height = image.size

    image = image.resize((512, 512), RESIZING_ALGORITHM)
    mask = mask.resize((512, 512), RESIZING_ALGORITHM)

    image = inpainting_pipe(
        prompt=inpainting.prompt,
        image=image,
        mask_image=mask,
        height=512,
        width=512,
        strength=1.0,
        guidance_scale=inpainting.guidance_scale,
        negative_prompt=inpainting.negative_prompt,
        num_images_per_prompt=1,
        generator=torch.Generator(device=device).manual_seed(inpainting.seed),
    ).images[0]

    image = image.resize((img_width, img_height), RESIZING_ALGORITHM)
    image_base64 = image_to_string(image)

    await save_image_record(
        user_id=str(current_user["_id"]),
        image_base64=image_base64,
        metadata={
            "model": DEFAULT_MODEL,
            "mode": "inpainting",
            "prompt": inpainting.prompt,
            "negative_prompt": inpainting.negative_prompt,
            "guidance_scale": inpainting.guidance_scale,
            "seed": inpainting.seed,
            "width": img_width,
            "height": img_height
        }
    )

    return JSONResponse(content={"image": image_base64})
