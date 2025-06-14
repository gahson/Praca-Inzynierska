import torch
from diffusers import StableDiffusionDepth2ImgPipeline
from diffusers.utils import load_image, make_image_grid

pipeline = StableDiffusionDepth2ImgPipeline.from_pretrained(
    "stabilityai/stable-diffusion-2-depth",
    torch_dtype=torch.float16,
    use_safetensors=True,
).to("cuda")


init_image = load_image('house_interior.png')
prompt = "wooden house interior, cozy, warm lighting, detailed textures"
image = pipeline(prompt=prompt, image=init_image, strength=1.0, num_inference_steps=60).images[0]
image.save("output.png")
