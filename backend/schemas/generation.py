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


class ControlNetRequest(BaseModel):
    model_version: str
    prompt: str
    negative_prompt: str
    guidance_scale: float
    seed: int
    image: str


class Inpainting(BaseModel):
    model_version: str
    prompt: str
    negative_prompt: str
    guidance_scale: float
    seed: int
    image: str
    mask_image: str
