import os
import json
import requests

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

comfyui = APIRouter()

# THIS IS ONLY EXAMPLE ENDPOINT TO TEST OUT COMFYUI API
@comfyui.get("/txt2img")
async def txt2img():
    txt2img_path = 'workflows/example.json'
    
    if not os.path.exists(txt2img_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    prompt_text = ""
    with open(txt2img_path, 'r') as f:
        prompt_text = f.read()
    
    p = {"prompt": json.loads(prompt_text)}

    response = requests.post("http://comfyui:8188/prompt", json=p)

    if response.ok:
        return JSONResponse(content=response.json(), status_code=200)
    else:
        raise HTTPException(status_code=404, detail="Error trying to communicate with ComfyUI")