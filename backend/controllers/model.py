import os
import json
import time
import uuid
import torch
import requests
from PIL import Image, ImageOps
from dotenv import load_dotenv

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
    '2.0-inpainting' : 'stable-diffusion-2-0-inpainting.safetensors',
    '2.1' : 'stable-diffusion-2-1.ckpt',
    '3.0' : 'stable-diffusion-3-medium.safetensors',
    'xl' : 'stable-diffusion-xl.safetensors'
}

def get_image(prompt_json):
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

    # Dynamically find the SaveImage node in the outputs
    if prompt_id not in image_response_json:
        raise HTTPException(status_code=404, detail=f'No history found for prompt_id: {prompt_id}')
    
    outputs = image_response_json[prompt_id].get('outputs', {})
    if not outputs:
        raise HTTPException(status_code=404, detail='No outputs found in workflow response')
    
    # Find the first SaveImage node output
    filename = None
    for node_id, node_output in outputs.items():
        if 'images' in node_output and len(node_output['images']) > 0:
            filename = node_output['images'][0]['filename']
            break
    
    if not filename:
        # Debug information
        print(f"Debug - Available outputs: {list(outputs.keys())}")
        print(f"Debug - Outputs content: {outputs}")
        raise HTTPException(status_code=404, detail='No image output found in workflow response')
    
    image_path = os.path.join('output_images', filename)
    
    if not os.path.exists(image_path):
       raise HTTPException(status_code=404, detail=f"Image file {image_path} not found")

    image = Image.open(image_path)
    image_base64 = image_to_string(image)
    
    return image_base64
    

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
    
    img2img_path = os.path.join('workflows_api', 'img2img.json')
    
    if not os.path.exists(img2img_path):
        raise HTTPException(status_code=404, detail='File not found')
    
    prompt_json = {}
    
    with open(img2img_path, 'r') as f:
        prompt_json = json.load(f)
        
    image = string_to_image(img2ImgRequest.image)
    image_width, image_height = image.size
    image_name = f'{uuid.uuid4()}.png'
    image.save(os.path.join('input_images', image_name))
        
    prompt_json['14']['inputs']['ckpt_name'] = model_versions[img2ImgRequest.model_version]
    
    prompt_json['10']['inputs']['image'] = image_name
    
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