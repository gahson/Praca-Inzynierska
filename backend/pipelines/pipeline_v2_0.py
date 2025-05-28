import torch
import gc
from diffusers import (
    DiffusionPipeline,
)


class Pipeline_v2_0():

    MODEL='stabilityai/stable-diffusion-2-base'
    DEFAULT_RESOLUTION = (512,512)

    def __init__(self):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.dtype = torch.float16 if self.device == 'cuda' else torch.float32

        self.pipe = DiffusionPipeline.from_pretrained(
            self.MODEL,
            use_safetensors=True,
            safety_checker=None,
            torch_dtype=self.dtype,
        ).to(self.device)
                
    def clear(self):
        del self.pipe
        gc.collect()
                
    def get_model_data(self):
        return (self.pipe, self.pipe, self.pipe, self.DEFAULT_RESOLUTION, self.MODEL)