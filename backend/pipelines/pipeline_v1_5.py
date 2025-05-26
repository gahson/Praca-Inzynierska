import torch
import gc
from diffusers import (
    StableDiffusionPipeline,
    StableDiffusionImg2ImgPipeline,
    StableDiffusionInpaintPipeline,
    DPMSolverMultistepScheduler,
    UniPCMultistepScheduler,
)

class Pipeline_v1_5():
    
    MODEL='stable-diffusion-v1-5/stable-diffusion-v1-5'
    DEFAULT_TEXT2IMAGE_SCHEDULER = UniPCMultistepScheduler
    DEFAULT_IMG2IMG_SCHEDULER = DPMSolverMultistepScheduler
    DEFAULT_INPAINTING_SCHEDULER = DPMSolverMultistepScheduler
    DEFAULT_RESOLUTION = (512,512)


    def __init__(self):
            
        self.txt2img = StableDiffusionPipeline.from_pretrained(
            self.MODEL,
            use_safetensors=True,
            safety_checker=None,
            torch_dtype=torch.float16,
        ).to('cuda' if torch.cuda.is_available() else 'cpu')
        self.txt2img.scheduler = self.DEFAULT_TEXT2IMAGE_SCHEDULER.from_config(self.txt2img.scheduler.config)
        
        self.img2img = StableDiffusionImg2ImgPipeline.from_pretrained(
            self.MODEL,
            use_safetensors=True,
            safety_checker=None,
            torch_dtype=torch.float16,
        ).to('cuda' if torch.cuda.is_available() else 'cpu')
        self.img2img.scheduler = self.DEFAULT_IMG2IMG_SCHEDULER.from_config(self.img2img.scheduler.config, algorithm_type="sde-dpmsolver++")
                
        self.inpainting = StableDiffusionInpaintPipeline.from_pretrained(
            self.MODEL,
            use_safetensors=True,
            safety_checker=None,
            torch_dtype=torch.float16,
        ).to('cuda' if torch.cuda.is_available() else 'cpu')
        self.inpainting.scheduler = self.DEFAULT_INPAINTING_SCHEDULER.from_config(self.inpainting.scheduler.config, algorithm_type="sde-dpmsolver++")
                
    def clear(self):
        del self.txt2img
        del self.img2img
        del self.inpainting
        gc.collect()
                
    def get_model_data(self):
        return (self.txt2img, self.img2img, self.inpainting, self.DEFAULT_RESOLUTION, self.MODEL)