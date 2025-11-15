#FROM pytorch/pytorch
FROM pytorch/pytorch:2.9.1-cuda12.6-cudnn9-runtime

RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /comfyui

RUN git clone https://github.com/comfyanonymous/ComfyUI.git .
RUN pip install --no-cache-dir -r requirements.txt

# Installing ComfyUI Manager

WORKDIR /comfyui/custom_nodes
RUN git clone https://github.com/ltdrdata/ComfyUI-Manager.git

# Clearing default directories to allow mounting docker volumes there
RUN rm -rf input/
RUN rm -rf output/
RUN rm -rf models/