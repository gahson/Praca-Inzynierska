#!/bin/bash
# Usage: ./download_models.sh <HF_TOKEN>

set -e

source api_keys.env

mkdir -p "models"
cd "models"

mkdir -p "checkpoints"
mkdir -p "loras"
mkdir -p "vae"
mkdir -p "text_encoders"
mkdir -p "diffusion_models"
mkdir -p "clip_vision"
mkdir -p "style_models"
mkdir -p "embeddings"
mkdir -p "diffusers"
mkdir -p "vae_approx"
mkdir -p "controlnet"
mkdir -p "gligen"
mkdir -p "upscale_models"
mkdir -p "hypernetworks"
mkdir -p "photomaker"
mkdir -p "classifiers"
mkdir -p "model_patches"
mkdir -p "audio_encoders"

# Checkpoints

cd "checkpoints"

# Stable Diffusion 1.5 - 2GB
if [ -f "stable-diffusion-1-5.safetensors" ]; then
    echo "stable-diffusion-1-5.safetensors exists"
else
    curl -L -H "Authorization: Bearer ${HF_TOKEN}" \
        -o stable-diffusion-1-5.safetensors \
        "https://huggingface.co/Comfy-Org/stable-diffusion-v1-5-archive/resolve/main/v1-5-pruned-emaonly-fp16.safetensors?download=true"
fi

# Stable Diffusion 1.5-inpainting - 4.5GB
if [ -f "sd-v1-5-inpainting.safetensors" ]; then
    echo "sd-v1-5-inpainting.safetensors exists"
else
    curl -L -H "Authorization: Bearer ${HF_TOKEN}" \
        -o sd-v1-5-inpainting.safetensors \
        "https://huggingface.co/webui/stable-diffusion-inpainting/resolve/main/sd-v1-5-inpainting.safetensors?download=true"
fi


# Stable Diffusion 2.0-inpainting - 5GB
if [ -f "stable-diffusion-2-0-inpainting.safetensors" ]; then
    echo "stable-diffusion-2-0-inpainting.safetensors exists"
else
    curl -L -H "Authorization: Bearer ${HF_TOKEN}" \
        -o stable-diffusion-2-0-inpainting.safetensors \
        "https://huggingface.co/stabilityai/stable-diffusion-2-inpainting/resolve/main/512-inpainting-ema.safetensors?download=true"
fi

# NO LONGER AVILABLE
# Stable Diffusion 2.1 - 6GB
# if [ -f "stable-diffusion-2-1.ckpt" ]; then
#     echo "stable-diffusion-2-1.ckpt exists"
# else
#     curl -L -H "Authorization: Bearer ${HF_TOKEN}" \
#         -o stable-diffusion-2-1.ckpt \
#         "https://huggingface.co/stabilityai/stable-diffusion-2-1-unclip/resolve/main/sd21-unclip-l.ckpt?download=true"
# fi

Stable Diffusion 2.1 - 6GB
if [ -f "stable-diffusion-2-1.ckpt" ]; then
    echo "stable-diffusion-2-1.ckpt exists"
else
    curl -L -H "Authorization: Bearer ${HF_TOKEN}" \
        -o stable-diffusion-2-1.ckpt \
        "https://huggingface.co/sd2-community/stable-diffusion-2-1-unclip/resolve/main/sd21-unclip-l.ckpt?download=true"
fi

# Stable Diffusion 3.0 medium - 6GB
if [ -f "stable-diffusion-3-medium.safetensors" ]; then
    echo "stable-diffusion-3-medium.safetensors exists"
else
    curl -L -H "Authorization: Bearer ${HF_TOKEN}" \
        -o stable-diffusion-3-medium.safetensors \
        "https://huggingface.co/stabilityai/stable-diffusion-3-medium/resolve/main/sd3_medium_incl_clips.safetensors?download=true"
fi

# Stable Diffusion XL - 7GB
if [ -f "stable-diffusion-xl.safetensors" ]; then
    echo "stable-diffusion-xl.safetensors exists"
else
    curl -L -H "Authorization: Bearer ${HF_TOKEN}" \
        -o stable-diffusion-xl.safetensors \
        "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors?download=true"
fi

# Stable Diffusion XL - inpainting - 7GB
if [ -f "sd_xl_base_1.0_inpainting_0.1.safetensors" ]; then
    echo "sd_xl_base_1.0_inpainting_0.1.safetensors exists"
else
    curl -L -H "Authorization: Bearer ${HF_TOKEN}" \
        -o sd_xl_base_1.0_inpainting_0.1.safetensors \
        "https://huggingface.co/wangqyqq/sd_xl_base_1.0_inpainting_0.1.safetensors/resolve/main/sd_xl_base_1.0_inpainting_0.1.safetensors?download=true"
fi


# Dream Creation Virtual 3DE Commerce
if [ -f "dreamCreationVirtual3DECommerce_v10.safetensors" ]; then
    echo "dreamCreationVirtual3DECommerce_v10.safetensors exists"
else
    curl -L -H "Authorization: Bearer ${CIVITAI_TOKEN}" \
        -o dreamCreationVirtual3DECommerce_v10.safetensors \
        "https://civitai.com/api/download/models/731340?type=Model&format=SafeTensor&size=full&fp=fp16"
fi

# vae

cd ".."
cd "vae"

if [ -f "vae-ft-mse-840000-ema-pruned.safetensors" ]; then
    echo "vae-ft-mse-840000-ema-pruned.safetensors exists"
else
    curl -L -H "Authorization: Bearer ${HF_TOKEN}" \
        -o vae-ft-mse-840000-ema-pruned.safetensors \
        "https://huggingface.co/stabilityai/sd-vae-ft-mse-original/resolve/main/vae-ft-mse-840000-ema-pruned.safetensors?download=true"
fi

# controlnet

cd ".."
cd "controlnet"

if [ -f "control_v11p_sd15_scribble_fp16.safetensors" ]; then
    echo "control_v11p_sd15_scribble_fp16.safetensors exists"
else
    curl -L -H "Authorization: Bearer ${HF_TOKEN}" \
        -o control_v11p_sd15_scribble_fp16.safetensors \
        "https://huggingface.co/comfyanonymous/ControlNet-v1-1_fp16_safetensors/resolve/main/control_v11p_sd15_scribble_fp16.safetensors?download=true"
fi


echo "All models downloaded and saved in $TARGET_DIR"
