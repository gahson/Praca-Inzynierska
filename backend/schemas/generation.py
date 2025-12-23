from pydantic import BaseModel

class TextToImageRequest(BaseModel):
    model_version: str
    prompt: str
    negative_prompt: str
    guidance_scale: float
    width: int
    height: int
    seed: int


class Img2ImgRequest(BaseModel):
    model_version: str
    prompt: str
    negative_prompt: str
    guidance_scale: float
    seed: int
    image: str
    scaling_mode: str


class ControlNetRequest(BaseModel):
    model_version: str
    prompt: str
    negative_prompt: str
    guidance_scale: float
    cannyLowThreshold: float
    cannyHighThreshold: float
    seed: int
    image: str
    scaling_mode: str


class Inpainting(BaseModel):
    model_version: str
    prompt: str
    negative_prompt: str
    guidance_scale: float
    seed: int
    image: str
    mask_image: str
    

class Outpainting(BaseModel):
    model_version: str
    prompt: str
    negative_prompt: str
    guidance_scale: float
    seed: int
    pad_right: int
    pad_left: int
    pad_top: int
    pad_bottom: int
    image: str
    scaling_mode: str