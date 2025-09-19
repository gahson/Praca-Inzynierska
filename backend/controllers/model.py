import os
import json
import time
import torch
import requests
from PIL import Image
from dotenv import load_dotenv

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from fastapi import HTTPException
from huggingface_hub import login

from pipelines.pipeline_v1_4 import Pipeline_v1_4
from pipelines.pipeline_v1_5 import Pipeline_v1_5
from pipelines.pipeline_v2_0 import Pipeline_v2_0
from utils.auth_helpers import get_current_user
from utils.saving_images_helpers import image_to_string, string_to_image, save_image_record
from schemas.generation import TextToImageRequest, Img2ImgRequest, Inpainting


env_file = os.getenv('ENV_FILE', '.env')
load_dotenv(env_file)

HF_TOKEN = os.getenv("HF_TOKEN")

if not HF_TOKEN:
    raise ValueError('HF_TOKEN not set in .env')

RESIZING_ALGORITHM = Image.BICUBIC
REFINER_POSITIVE_PROMPT = 'masterpiece, best quality, ultra detailed, 8k, photorealistic, sharp focus, intricate details, award winning, cinematic lighting, professional photo, realistic shadows, high dynamic range'
REFINER_NEGATIVE_PROMPT = 'low quality, blurry, pixelated, deformed, bad anatomy, oversaturated, underexposed, artifacts, watermark, jpeg artifacts, text, cartoon, out of focus, noisy, grainy, overcompressed'

model_version_to_pipeline = {
    'v1.4' : Pipeline_v1_4,
    'v1.5' : Pipeline_v1_5,
    'v2.0' : Pipeline_v2_0,
    'runwayml/stable-diffusion-inpainting': Pipeline_v1_5
}

models= APIRouter()
login(HF_TOKEN)
device = 'cuda' if torch.cuda.is_available() else 'cpu'

def text_to_image_callback(step, timestamp, latents):
    pass

@models.post('/generate/text-to-image')
async def text_to_image(textToImageRequest: TextToImageRequest, current_user: dict = Depends(get_current_user)):
    #if textToImageRequest.model_version not in model_version_to_pipeline:
    #    raise HTTPException(status_code=404, detail="Model version does not exist.")
    txt2img_path = 'workflows/txt2img.json'
    
    if not os.path.exists(txt2img_path):
        raise HTTPException(status_code=404, detail='File not found')

    prompt_json = {}
    
    with open(txt2img_path, 'r') as f:
        prompt_json = json.load(f)
    
    prompt_json['3']['inputs']['seed'] = textToImageRequest.seed
    prompt_json['3']['inputs']['steps'] = 30
    prompt_json['3']['inputs']['cfg'] = 8
    prompt_json['3']['inputs']['sampler_name'] = 'euler'
    prompt_json['3']['inputs']['scheduler'] = 'normal'
    prompt_json['3']['inputs']['denoise'] = 1
    
    prompt_json['5']['inputs']['width'] = textToImageRequest.width
    prompt_json['5']['inputs']['height'] = textToImageRequest.height    
    prompt_json['5']['inputs']['barch_size'] = 1
    
    prompt_json['6']['inputs']['text'] = textToImageRequest.prompt
    prompt_json['7']['inputs']['text'] = textToImageRequest.negative_prompt    
    
    queue_payload = {'prompt': prompt_json}

    queue_response = requests.post('http://comfyui:8188/prompt', json=queue_payload)

    if not queue_response.ok:
        raise HTTPException(status_code=404, detail='Error queueing prompt')
    
    queue_response_json = queue_response.json()
        
    if 'prompt_id' not in queue_response_json:
        raise HTTPException(status_code=404, detail='Error obraining prompt_id')
    
    prompt_id = queue_response_json['prompt_id']
    
    # Poll the endpoint until a non-empty response is received
    max_attempts = 60
    for attempt in range(max_attempts):
        image_response = requests.get(f'http://comfyui:8188/history/{prompt_id}')
        if image_response.ok and image_response.content and image_response.content != b'{}':
            break
        time.sleep(1)
    else:
        raise HTTPException(status_code=504, detail='Timeout waiting for image generation response.')
     
    image_response_json = image_response.json()

    filename = image_response_json[prompt_id]['outputs']['9']['images'][0]['filename']
    
    image_path = os.path.join('images', filename)
    
    if not os.path.exists(image_path):
       raise HTTPException(status_code=404, detail=f"Image file {image_path} not found")

    image = Image.open(image_path)
    image_base64 = image_to_string(image)
            
    await save_image_record(
        user_id=str(current_user["_id"]),
        image_base64=image_base64,
        metadata={
            "model": 'v1-5-pruned-emaonly-fp16.safetensors',
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
    
    
    
    

# @models.post('/generate/text-to-image')
# async def text_to_image(textToImageRequest: TextToImageRequest, current_user: dict = Depends(get_current_user)):
#     if textToImageRequest.model_version not in model_version_to_pipeline:
#         raise HTTPException(status_code=404, detail="Model version does not exist.")
    
#     pipeline = model_version_to_pipeline[textToImageRequest.model_version]()
    
#     if pipeline is None:
#         raise HTTPException(status_code=500, detail="Model data is None. This shouldn't happen.")
    
#     txt2img, img2img, _, resolution, model = pipeline.get_model_data()
    
#     image = txt2img(
#         prompt=textToImageRequest.prompt,
#         height=resolution[0],
#         width=resolution[1],
#         num_inference_steps=30,
#         guidance_scale=textToImageRequest.guidance_scale,
#         negative_prompt=textToImageRequest.negative_prompt,
#         num_images_per_prompt=1,
#         generator=torch.Generator(device=device).manual_seed(textToImageRequest.seed),
#         #callback=text_to_image_callback,
#     ).images[0]

#     image = img2img(
#         prompt=textToImageRequest.prompt + REFINER_POSITIVE_PROMPT,
#         image=image,
#         strength=1.0,
#         num_inference_steps=30,
#         guidance_scale=10,
#         negative_prompt=textToImageRequest.negative_prompt + REFINER_NEGATIVE_PROMPT,
#         num_images_per_prompt=1,
#         generator=torch.Generator(device=device).manual_seed(textToImageRequest.seed),
#         #callback=text_to_image_callback,
#     ).images[0]

#     image = image.resize((textToImageRequest.width, textToImageRequest.height), RESIZING_ALGORITHM)
#     image_base64 = image_to_string(image)

#     await save_image_record(
#         user_id=str(current_user["_id"]),
#         image_base64=image_base64,
#         metadata={
#             "model": model,
#             "mode": "text2img",
#             "prompt": textToImageRequest.prompt,
#             "negative_prompt": textToImageRequest.negative_prompt,
#             "guidance_scale": textToImageRequest.guidance_scale,
#             "width": textToImageRequest.width,
#             "height": textToImageRequest.height,
#             "seed": textToImageRequest.seed
#         }
#     )

#     return JSONResponse(content={"image": image_base64})

@models.post('/generate/image-to-image')
async def edit_image(img2imgRequest: Img2ImgRequest, current_user: dict = Depends(get_current_user)):
    if img2imgRequest.model_version not in model_version_to_pipeline:
        raise HTTPException(status_code=404, detail="Model version does not exist.")
    
    pipeline = model_version_to_pipeline[img2imgRequest.model_version]()
    
    if pipeline is None:
        raise HTTPException(status_code=500, detail="Model data is None. This shouldn't happen.")
    
    _, img2img, _, resolution, model = pipeline.get_model_data()
    
    image = string_to_image(img2imgRequest.image)
    img_width, img_height = image.size
    image = image.resize(resolution, RESIZING_ALGORITHM)

    image = img2img(
        prompt=img2imgRequest.prompt,
        image=image,
        strength=1.0,
        num_inference_steps=30,
        guidance_scale=img2imgRequest.guidance_scale,
        negative_prompt=img2imgRequest.negative_prompt,
        num_images_per_prompt=1,
        generator=torch.Generator(device=device).manual_seed(img2imgRequest.seed),
        #callback=text_to_image_callback,
    ).images[0]

    image = image.resize((img_width, img_height), RESIZING_ALGORITHM)
    image_base64 = image_to_string(image)

    await save_image_record(
        user_id=str(current_user["_id"]),
        image_base64=image_base64,
        metadata={
            "model": model,
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


@models.post('/generate/inpainting')
async def image_inpainting(inpainting: Inpainting, current_user: dict = Depends(get_current_user)):
    print("=== Inpainting endpoint called ===")
    print("Model version requested:", inpainting.model_version)

    if inpainting.model_version not in model_version_to_pipeline:
        print("Model version not found in model_version_to_pipeline")
        raise HTTPException(status_code=404, detail="Model version does not exist.")

    try:
        pipeline = model_version_to_pipeline[inpainting.model_version]()
        print("Pipeline successfully initialized:", pipeline)
    except Exception as e:
        print("Error initializing pipeline:", e)
        raise HTTPException(status_code=500, detail=f"Cannot initialize pipeline: {e}")

    if pipeline is None:
        print("Pipeline is None!")
        raise HTTPException(status_code=500, detail="Model data is None. This shouldn't happen.")

    try:
        _, _, inpainting_pipe, resolution, model = pipeline.get_model_data()
        print("Pipeline model data loaded:", resolution, model)
    except Exception as e:
        print("Error getting model data from pipeline:", e)
        raise HTTPException(status_code=500, detail=f"Cannot get model data: {e}")

    try:
        image = string_to_image(inpainting.image)
        mask = string_to_image(inpainting.mask_image)
        img_width, img_height = image.size
        print("Original image size:", img_width, img_height)
        print("Original mask size:", mask.size)

        image = image.resize(resolution, RESIZING_ALGORITHM)
        mask = mask.resize(resolution, RESIZING_ALGORITHM)
        print("Resized image size:", image.size)
        print("Resized mask size:", mask.size)

        assert image.size == mask.size, f"Image and mask sizes must match. Got {image.size} and {mask.size}"

        image = inpainting_pipe(
            prompt=inpainting.prompt,
            image=image,
            mask_image=mask,
            strength=1.0,
            guidance_scale=inpainting.guidance_scale,
            negative_prompt=inpainting.negative_prompt,
            num_images_per_prompt=1,
            generator=torch.Generator(device=device).manual_seed(inpainting.seed),
        ).images[0]

        image = image.resize((img_width, img_height), RESIZING_ALGORITHM)
        image_base64 = image_to_string(image)
        print("Inpainting completed successfully")

    except Exception as e:
        print("Error during inpainting:", e)
        raise HTTPException(status_code=500, detail=f"Inpainting failed: {e}")

    try:
        await save_image_record(
            user_id=str(current_user["_id"]),
            image_base64=image_base64,
            metadata={
                "model": model,
                "mode": "inpainting",
                "prompt": inpainting.prompt,
                "negative_prompt": inpainting.negative_prompt,
                "guidance_scale": inpainting.guidance_scale,
                "seed": inpainting.seed,
                "width": img_width,
                "height": img_height
            }
        )
        print("Image record saved successfully")
    except Exception as e:
        print("Error saving image record:", e)
        raise HTTPException(status_code=500, detail=f"Failed to save image record: {e}")

    return JSONResponse(content={"image": image_base64})
