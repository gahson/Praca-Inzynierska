import torch
import gc
from diffusers import (
    AutoPipelineForText2Image,
    AutoPipelineForImage2Image,
    AutoPipelineForInpainting,
)

class Pipeline_v1_4:
    MODEL = 'CompVis/stable-diffusion-v1-4'
    DEFAULT_RESOLUTION = (512, 512)

    def __init__(self):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.dtype = torch.float16 if torch.cuda.is_available() else torch.float32

        # Load all pipelines with the same config
        self.txt2img = AutoPipelineForText2Image.from_pretrained(
            self.MODEL,
            use_safetensors=True,
            safety_checker=None,
            torch_dtype=self.dtype,
        ).to(self.device)

        self.img2img = AutoPipelineForImage2Image.from_pretrained(
            self.MODEL,
            use_safetensors=True,
            safety_checker=None,
            torch_dtype=self.dtype,
        ).to(self.device)

        self.inpainting = AutoPipelineForInpainting.from_pretrained(
            self.MODEL,
            use_safetensors=True,
            safety_checker=None,
            torch_dtype=self.dtype,
        ).to(self.device)

    def clear(self):
        """Clean up memory."""
        del self.txt2img
        del self.img2img
        del self.inpainting
        gc.collect()

    def get_model_data(self):
        return (
            self.txt2img,
            self.img2img,
            self.inpainting,
            self.DEFAULT_RESOLUTION,
            self.MODEL
        )

    def __del__(self):
        self.clear()
