#!/bin/bash
# Usage: ./download_models.sh <HF_TOKEN>

set -e

HF_TOKEN=$1

if [ -z "$HF_TOKEN" ]; then
    echo "Usage: $0 <HF_TOKEN>"
    exit 1
fi

TARGET_DIR="models"
mkdir -p "$TARGET_DIR"

cd "$TARGET_DIR"

# Stable Diffusion 1.5 - 2GB
curl -L -H "Authorization: Bearer ${HF_TOKEN}" \
    -o stable-diffusion-1-5.safetensors\
    "https://huggingface.co/Comfy-Org/stable-diffusion-v1-5-archive/resolve/main/v1-5-pruned-emaonly-fp16.safetensors?download=true"

# Stable Diffusion 2.1 - 6GB
curl -L -H "Authorization: Bearer ${HF_TOKEN}" \
    -o stable-diffusion-2-1.ckpt \
    "https://huggingface.co/stabilityai/stable-diffusion-2-1-unclip/resolve/main/sd21-unclip-l.ckpt?download=true"

# Stable Diffusion 3.0 medium - 6GB
curl -L -H "Authorization: Bearer ${HF_TOKEN}" \
    -o stable-diffusion-3-medium.safetensors \
    "https://huggingface.co/stabilityai/stable-diffusion-3-medium/resolve/main/sd3_medium_incl_clips.safetensors?download=true"

# Stable Diffusion XL - 7GB
curl -L -H "Authorization: Bearer ${HF_TOKEN}" \
    -o stable-diffusion-xl.safetensors \
    "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors?download=true"

echo "All models downloaded and save in $TARGET_DIR"
