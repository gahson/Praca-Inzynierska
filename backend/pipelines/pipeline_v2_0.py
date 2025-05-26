import torch
import gc
from diffusers import (
    DiffusionPipeline,
)


class Pipeline_v2_0():

    MODEL='stabilityai/stable-diffusion-2-base'
    DEFAULT_RESOLUTION = (512,512)

    def __init__(self):
            
        self.pipe = DiffusionPipeline.from_pretrained(
            self.MODEL,
            use_safetensors=True,
            safety_checker=None,
            torch_dtype=torch.float16,
        ).to('cuda' if torch.cuda.is_available() else 'cpu')
                
    def clear(self):
        del self.pipe
        gc.collect()
                
    def get_model_data(self):
        return (self.pipe, self.pipe, self.pipe, self.DEFAULT_RESOLUTION, self.MODEL)