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
from schemas.generation import TextToImageRequest, Img2ImgRequest, ControlNetRequest, Inpainting, Outpainting

models= APIRouter()

model_versions = {
    '1.5' : 'stable-diffusion-1-5.safetensors',
    '1.5-inpainting' : 'sd-v1-5-inpainting.safetensors',
    '2.0-inpainting' : 'stable-diffusion-2-0-inpainting.safetensors',
    '2.1' : 'stable-diffusion-2-1.ckpt',
    '3.0' : 'stable-diffusion-3-medium.safetensors',
    'xl' : 'stable-diffusion-xl.safetensors',
    'xl-inpainting' : 'sd_xl_base_1.0_inpainting_0.1.safetensors',
    'controlnet' : 'dreamCreationVirtual3DECommerce_v10.safetensors',
    'dreamshaper-v8' : 'dreamshaper_8.safetensors',
}

model_version_to_input_size = {
    '1.5' : (512,512),
    '1.5-inpainting' : (512,512),
    '2.0-inpainting' : (512,512),
    '2.1' : (768,768),
    '3.0' : (1024,1024),
    'xl' : (1024,1024),
    'xl-inpainting' : (1024,1024),
    'controlnet' : (512,512),
    'dreamshaper-v8' : (512,512),
}

model_version_to_megapixels = {
    '1.5': 0.262,
    '1.5-inpainting': 0.262,
    '2.0-inpainting': 0.262,
    '2.1': 0.589,
    '3.0': 1.048,
    'xl': 1.048,
    'xl-inpainting': 1.048,
    'controlnet': 0.262,
    'dreamshaper-v8' : 0.262,
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
    
    # print(outputs, flush=True)
    
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
    
    # Image resizing
    if img2ImgRequest.scaling_mode == 'resize_and_pad':
        prompt_json['20']['inputs']['target_width'] = model_version_to_input_size[img2ImgRequest.model_version][0]
        prompt_json['20']['inputs']['target_height'] = model_version_to_input_size[img2ImgRequest.model_version][1]
        prompt_json['12']['inputs']['pixels'][0]='20'
    elif img2ImgRequest.scaling_mode == 'scale_to_megapixels':
        prompt_json['21']['inputs']['megapixels'] = model_version_to_megapixels[img2ImgRequest.model_version]
        prompt_json['12']['inputs']['pixels'][0]='21'
    else:
        prompt_json['12']['inputs']['pixels'][0]='10'

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
            "seed": img2ImgRequest.seed,
            "scaling_mode": img2ImgRequest.scaling_mode,
        }
    )

    return JSONResponse(content={"image": image_base64})
    

@models.post('/generate/control-net')
async def control_net(controlNetRequest: ControlNetRequest, current_user: dict = Depends(get_current_user)):
    if controlNetRequest.model_version not in model_versions:
        raise HTTPException(status_code=404, detail='Model version does not exist.')
    
    img2img_path = os.path.join('workflows_api', 'controlnet.json')
    
    if not os.path.exists(img2img_path):
        raise HTTPException(status_code=404, detail='File not found')
    
    prompt_json = {}
    
    with open(img2img_path, 'r') as f:
        prompt_json = json.load(f)
        
    image = string_to_image(controlNetRequest.image)
    image_width, image_height = image.size
    image_name = f'{uuid.uuid4()}.png'
    image.save(os.path.join('input_images', image_name))
        
    prompt_json['14']['inputs']['ckpt_name'] = model_versions[controlNetRequest.model_version]
    
    prompt_json['40']['inputs']['image'] = image_name
    
    # Image resizing
    if controlNetRequest.scaling_mode == 'resize_and_pad':
        prompt_json['33']['inputs']['target_width'] = model_version_to_input_size[controlNetRequest.model_version][0]
        prompt_json['33']['inputs']['target_height'] = model_version_to_input_size[controlNetRequest.model_version][1]
        prompt_json['35']['inputs']['image'][0]='33'
    elif controlNetRequest.scaling_mode == 'scale_to_megapixels':
        prompt_json['37']['inputs']['megapixels'] = model_version_to_megapixels[controlNetRequest.model_version]
        prompt_json['35']['inputs']['image'][0]='37'
    else:
        prompt_json['35']['inputs']['image'][0]='11'
    
    prompt_json['35']['inputs']['low_threshold'] = controlNetRequest.cannyLowThreshold
    prompt_json['35']['inputs']['high_threshold'] = controlNetRequest.cannyHighThreshold
    
    prompt_json['3']['inputs']['seed'] = controlNetRequest.seed
    prompt_json['3']['inputs']['steps'] = 30
    prompt_json['3']['inputs']['cfg'] = controlNetRequest.guidance_scale
    
    prompt_json['6']['inputs']['text'] = controlNetRequest.prompt
    prompt_json['7']['inputs']['text'] = controlNetRequest.negative_prompt    
    
    image_base64 = get_image(prompt_json)

    await save_image_record(
        user_id=str(current_user["_id"]),
        image_base64=image_base64,
        metadata={
            "model": controlNetRequest.model_version,
            "mode": "controlnet",
            "prompt": controlNetRequest.prompt,
            "negative_prompt": controlNetRequest.negative_prompt,
            "guidance_scale": controlNetRequest.guidance_scale,
            "canny_low_threshold": controlNetRequest.cannyLowThreshold,
            "canny_high_threshold": controlNetRequest.cannyHighThreshold,
            "width": image_width,
            "height": image_height,
            "seed": controlNetRequest.seed,
            "scaling_mode": controlNetRequest.scaling_mode,
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
    
    mask = mask.crop((0, 0, image.width, image.height))
    
    if image.size != mask.size:
        raise HTTPException(status_code=404, detail="Image size and mask size don't match!")
    
    image_width, image_height = image.size
    
    image_name = f'{uuid.uuid4()}.png'
    mask_name = f'{uuid.uuid4()}.png'
    
    # image.save('img.png')
    # mask.save('mask.png')
    
    image.save(os.path.join('input_images', image_name))
    mask.save(os.path.join('input_images', mask_name))

    prompt_json['29']['inputs']['ckpt_name'] = model_versions[inpainting.model_version]
    
    prompt_json['20']['inputs']['image'] = image_name
    prompt_json['37']['inputs']['image'] = mask_name
    
    # Image resizing
    if inpainting.scaling_mode == 'resize_and_pad':
        # Image
        prompt_json['58']['inputs']['target_width'] = model_version_to_input_size[inpainting.model_version][0]
        prompt_json['58']['inputs']['target_height'] = model_version_to_input_size[inpainting.model_version][1]
        prompt_json['51']['inputs']['pixels'][0]='58'
        
        # Mask
        prompt_json['60']['inputs']['target_width'] = model_version_to_input_size[inpainting.model_version][0]
        prompt_json['60']['inputs']['target_height'] = model_version_to_input_size[inpainting.model_version][1]
        prompt_json['62']['inputs']['image'][0]='60'
    elif inpainting.scaling_mode == 'scale_to_megapixels':
        # Image
        prompt_json['63']['inputs']['megapixels'] = model_version_to_megapixels[inpainting.model_version]
        prompt_json['51']['inputs']['pixels'][0]='63'
        
        # Mask
        prompt_json['64']['inputs']['megapixels'] = model_version_to_megapixels[inpainting.model_version]
        prompt_json['62']['inputs']['image'][0]='64'
    else:
        # Image
        prompt_json['51']['inputs']['pixels'][0]='20'
        
        # Mask
        prompt_json['51']['inputs']['mask'][0]='37'
    
    prompt_json['3']['inputs']['seed'] = inpainting.seed
    prompt_json['3']['inputs']['cfg'] = inpainting.guidance_scale
    
    prompt_json['6']['inputs']['text'] = inpainting.prompt
    prompt_json['7']['inputs']['text'] = inpainting.negative_prompt
    
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
                "height": image_height,
                "scaling_mode": inpainting.scaling_mode,
            }
        )
        print("Image record saved successfully")
    except Exception as e:
        print("Error saving image record:", e)
        raise HTTPException(status_code=500, detail=f"Failed to save image record: {e}")

    return JSONResponse(content={"image": image_base64})


@models.post('/generate/outpainting')
async def image_outpainting(outpainting: Outpainting, current_user: dict = Depends(get_current_user)):
    if outpainting.model_version not in model_versions:
        raise HTTPException(status_code=404, detail='Model version does not exist.')
    
    outpainting_path = os.path.join('workflows_api', 'outpainting.json')
    
    if not os.path.exists(outpainting_path):
        raise HTTPException(status_code=404, detail='File not found')
    
    prompt_json = {}
    
    with open(outpainting_path, 'r') as f:
        prompt_json = json.load(f)
        
    image = string_to_image(outpainting.image)
    
    image_width, image_height = image.size
    
    image_name = f'{uuid.uuid4()}.png'
    
    image.save(os.path.join('input_images', image_name))

    prompt_json['29']['inputs']['ckpt_name'] = model_versions[outpainting.model_version]

    prompt_json['20']['inputs']['image'] = image_name

    # Image resizing
    if outpainting.scaling_mode == 'resize_and_pad':
        prompt_json['40']['inputs']['target_width'] = model_version_to_input_size[outpainting.model_version][0]
        prompt_json['40']['inputs']['target_height'] = model_version_to_input_size[outpainting.model_version][1]
        prompt_json['30']['inputs']['image'][0] = '40'
    elif outpainting.scaling_mode == 'scale_to_megapixels':
        prompt_json['41']['inputs']['megapixels'] = model_version_to_megapixels[outpainting.model_version]
        prompt_json['30']['inputs']['image'][0] = '41'
    else:
        prompt_json['30']['inputs']['image'][0] = '20'
    
    prompt_json['3']['inputs']['seed'] = outpainting.seed
    prompt_json['3']['inputs']['cfg'] = outpainting.guidance_scale
    
    prompt_json['30']['inputs']['left'] = outpainting.pad_left
    prompt_json['30']['inputs']['right'] = outpainting.pad_right
    prompt_json['30']['inputs']['top'] = outpainting.pad_top
    prompt_json['30']['inputs']['bottom'] = outpainting.pad_bottom
    
    prompt_json['6']['inputs']['text'] = outpainting.prompt
    prompt_json['7']['inputs']['text'] = outpainting.negative_prompt
    
    image_base64 = get_image(prompt_json)
    
    try:
        await save_image_record(
            user_id=str(current_user["_id"]),
            image_base64=image_base64,
            metadata={
                "model": outpainting.model_version,
                "mode": "outpainting",
                "prompt": outpainting.prompt,
                "negative_prompt": outpainting.negative_prompt,
                "guidance_scale": outpainting.guidance_scale,
                "seed": outpainting.seed,
                'pad_right': outpainting.pad_right,
                'pad_left': outpainting.pad_left,
                'pad_top': outpainting.pad_top,
                'pad_bottom': outpainting.pad_bottom,
                "width": image_width,
                "height": image_height,
                "scaling_mode": outpainting.scaling_mode,
            }
        )
        print("Image record saved successfully")
    except Exception as e:
        print("Error saving image record:", e)
        raise HTTPException(status_code=500, detail=f"Failed to save image record: {e}")

    return JSONResponse(content={"image": image_base64})