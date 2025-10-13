import os
import json
import time
import uuid
import torch
import requests
from PIL import Image, ImageOps
from dotenv import load_dotenv
import base64

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from fastapi import HTTPException
from huggingface_hub import login

from utils.auth_helpers import get_current_user
from utils.saving_images_helpers import image_to_string, string_to_image, save_image_record
from schemas.generation import TextToImageRequest, Img2ImgRequest, Inpainting

models= APIRouter()

model_versions = {
    '1.5' : 'stable-diffusion-1-5.safetensors',
    '1.5-inpainting' : 'sd-v1-5-inpainting.safetensors',
    '2.0-inpainting' : 'stable-diffusion-2-0-inpainting.safetensors',
    '2.1' : 'stable-diffusion-2-1.ckpt',
    '3.0' : 'stable-diffusion-3-medium.safetensors',
    'xl' : 'stable-diffusion-xl.safetensors',
    'xl-inpainting' : 'sd_xl_base_1.0_inpainting_0.1.safetensors',
}

def get_image(prompt_json):
    COMFY = os.getenv("COMFY_URL", "http://comfyui:8188")

    queue_payload = {"prompt": prompt_json}
    r = requests.post(f"{COMFY}/prompt", json=queue_payload)
    if not r.ok:
        raise HTTPException(status_code=502, detail="Error queueing prompt")
    data = r.json()
    prompt_id = data.get("prompt_id")
    if not prompt_id:
        raise HTTPException(status_code=502, detail="No prompt_id returned")

    max_attempts = 60
    for _ in range(max_attempts):
        h = requests.get(f"{COMFY}/history/{prompt_id}")
        if h.ok and h.content and h.content != b"{}":
            hist = h.json()
            item = hist.get(prompt_id, {})
            outputs = item.get("outputs", {})
            images = []
            for node_out in outputs.values():
                images.extend(node_out.get("images", []))
            if images:
                meta = images[0]
                filename  = meta.get("filename")
                subfolder = meta.get("subfolder", "")
                img_type  = meta.get("type", "output")

                view = requests.get(
                    f"{COMFY}/view",
                    params={"filename": filename, "subfolder": subfolder, "type": img_type},
                    stream=True,
                )
                if not view.ok:
                    raise HTTPException(status_code=502, detail=f"Failed to fetch image via /view (filename={filename})")

                image_base64 = base64.b64encode(view.content).decode("utf-8")
                return image_base64
        time.sleep(1)

    raise HTTPException(status_code=504, detail="Timeout waiting for image generation response.")
    

@models.post('/generate/text-to-image')
async def text_to_image(textToImageRequest: TextToImageRequest, current_user: dict = Depends(get_current_user)):
    if textToImageRequest.model_version not in model_versions:
        raise HTTPException(status_code=404, detail='Model version does not exist.')
    
    txt2img_path = os.path.join('workflows_api', 'txt2img.json')
    
    if not os.path.exists(txt2img_path):
        raise HTTPException(status_code=404, detail='File not found')

    prompt_json = {}
    
    with open(txt2img_path, 'r') as f:
        prompt_json = json.load(f)
    
    prompt_json['4']['inputs']['ckpt_name'] = model_versions[textToImageRequest.model_version]
    
    prompt_json['3']['inputs']['seed'] = textToImageRequest.seed
    prompt_json['3']['inputs']['steps'] = 30
    prompt_json['3']['inputs']['cfg'] = textToImageRequest.guidance_scale
    
    prompt_json['5']['inputs']['width'] = textToImageRequest.width
    prompt_json['5']['inputs']['height'] = textToImageRequest.height    
    prompt_json['5']['inputs']['barch_size'] = 1
    
    prompt_json['6']['inputs']['text'] = textToImageRequest.prompt
    prompt_json['7']['inputs']['text'] = textToImageRequest.negative_prompt    
    
    image_base64 = get_image(prompt_json)
            
    await save_image_record(
        user_id=str(current_user["_id"]),
        image_base64=image_base64,
        metadata={
            "model": textToImageRequest.model_version,
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
    
    
@models.post('/generate/image-to-image')
async def edit_image(img2ImgRequest: Img2ImgRequest, current_user: dict = Depends(get_current_user)):
    if img2ImgRequest.model_version not in model_versions:
        raise HTTPException(status_code=404, detail='Model version does not exist.')
    
    img2img_path = os.path.join('workflows_api', 'controlnet_example.json')
    
    if not os.path.exists(img2img_path):
        raise HTTPException(status_code=404, detail='File not found')
    
    prompt_json = {}
    
    with open(img2img_path, 'r') as f:
        prompt_json = json.load(f)
        
    image = string_to_image(img2ImgRequest.image)
    image_width, image_height = image.size
    image_name = f'{uuid.uuid4()}.png'
    image.save(os.path.join('input_images', image_name))
        
    #prompt_json['14']['inputs']['ckpt_name'] = model_versions[img2ImgRequest.model_version]
    
    prompt_json['11']['inputs']['image'] = image_name

    prompt_json['3']['inputs']['seed'] = img2ImgRequest.seed
    prompt_json['3']['inputs']['steps'] = 30
    prompt_json['3']['inputs']['cfg'] = img2ImgRequest.guidance_scale
    
    prompt_json['6']['inputs']['text'] = img2ImgRequest.prompt
    prompt_json['7']['inputs']['text'] = img2ImgRequest.negative_prompt    
    
    image_base64 = get_image(prompt_json)

    await save_image_record(
        user_id=str(current_user["_id"]),
        image_base64=image_base64,
        metadata={
            "model": img2ImgRequest.model_version,
            "mode": "text2img",
            "prompt": img2ImgRequest.prompt,
            "negative_prompt": img2ImgRequest.negative_prompt,
            "guidance_scale": img2ImgRequest.guidance_scale,
            "width": image_width,
            "height": image_height,
            "seed": img2ImgRequest.seed
        }
    )

    return JSONResponse(content={"image": image_base64})
    
    
@models.post('/generate/inpainting')
async def image_inpainting(inpainting: Inpainting, current_user: dict = Depends(get_current_user)):
    if inpainting.model_version not in model_versions:
        raise HTTPException(status_code=404, detail='Model version does not exist.')
    
    inpainting_path = os.path.join('workflows_api', 'inpainting.json')
    
    if not os.path.exists(inpainting_path):
        raise HTTPException(status_code=404, detail='File not found')
    
    prompt_json = {}
    
    with open(inpainting_path, 'r') as f:
        prompt_json = json.load(f)
        
    image = string_to_image(inpainting.image)
    mask = string_to_image(inpainting.mask_image)
    
    r, g, b, a = mask.split()
    new_alpha = Image.eval(r, lambda px: 0 if px == 255 else 255)
    mask = Image.new("RGBA", mask.size, (255, 255, 255, 255))
    mask.putalpha(new_alpha)

    mask = mask.resize((image.width, image.height), Image.NEAREST)
    
    if image.size != mask.size:
        raise HTTPException(status_code=404, detail="Image size and mask size don't match!")
    
    image_width, image_height = image.size
    
    image_name = f'{uuid.uuid4()}.png'
    mask_name = f'{uuid.uuid4()}.png'
    
    image.save(os.path.join('input_images', image_name))
    mask.save(os.path.join('input_images', mask_name))

    prompt_json['29']['inputs']['ckpt_name'] = model_versions[inpainting.model_version]
    
    prompt_json['3']['inputs']['seed'] = inpainting.seed
    prompt_json['3']['inputs']['cfg'] = inpainting.guidance_scale
    
    prompt_json['6']['inputs']['text'] = inpainting.prompt
    prompt_json['7']['inputs']['text'] = inpainting.negative_prompt
    
    prompt_json['20']['inputs']['image'] = image_name
    prompt_json['37']['inputs']['image'] = mask_name
    
    image_base64 = get_image(prompt_json)

    try:
        await save_image_record(
            user_id=str(current_user["_id"]),
            image_base64=image_base64,
            metadata={
                "model": inpainting.model_version,
                "mode": "inpainting",
                "prompt": inpainting.prompt,
                "negative_prompt": inpainting.negative_prompt,
                "guidance_scale": inpainting.guidance_scale,
                "seed": inpainting.seed,
                "width": image_width,
                "height": image_height
            }
        )
        print("Image record saved successfully")
    except Exception as e:
        print("Error saving image record:", e)
        raise HTTPException(status_code=500, detail=f"Failed to save image record: {e}")

    return JSONResponse(content={"image": image_base64})