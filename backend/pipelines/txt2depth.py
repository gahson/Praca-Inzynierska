import torch
import gc
from diffusers import StableDiffusionLDM3DPipeline


class Txt2Depth:
    MODEL = 'Intel/ldm3d-4c'
    DEFAULT_RESOLUTION = (512, 512)

    def __init__(self):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.dtype = torch.float16 if self.device == 'cuda' else torch.float32

        self.txt2depth = StableDiffusionLDM3DPipeline.from_pretrained(
            self.MODEL,
            use_safetensors=False,
            torch_dtype=self.dtype,
        ).to(self.device)

    def clear(self):
        del self.txt2depth
        torch.cuda.empty_cache()
        gc.collect()

    def get_model_data(self):
        return self.txt2depth, self.DEFAULT_RESOLUTION, self.MODEL