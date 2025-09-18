FROM pytorch/pytorch

RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /comfyui

RUN git clone https://github.com/comfyanonymous/ComfyUI.git .

RUN pip install --no-cache-dir -r requirements.txt

COPY extra_model_paths.yaml  extra_model_paths.yaml.example

# 2GB
RUN mkdir -p models/checkpoints && \
    curl -L -o models/checkpoints/v1-5-pruned-emaonly-fp16.safetensors \
    "https://huggingface.co/Comfy-Org/stable-diffusion-v1-5-archive/resolve/main/v1-5-pruned-emaonly-fp16.safetensors?download=true"

# TODO: INSTALL OTHER RELEVANT MODELS