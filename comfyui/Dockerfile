FROM pytorch/pytorch

RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /comfyui

RUN git clone https://github.com/comfyanonymous/ComfyUI.git .

RUN pip install --no-cache-dir -r requirements.txt

COPY extra_model_paths.yaml  extra_model_paths.yaml.example

RUN rm -rf input && ln -s input_images input
RUN rm -rf output && ln -s output_images output