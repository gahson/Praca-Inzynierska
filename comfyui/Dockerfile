FROM praca-inzynierska-frontend

RUN apt-get install -y git python3

WORKDIR /comfyui

RUN git clone https://github.com/comfyanonymous/ComfyUI.git .
RUN pip install --no-cache-dir -r requirements.txt

# Clearing default directories to allow mounting docker volumes there
RUN rm -rf input/ && ln -sf /backend/input_images ./input
RUN rm -rf output/ && ln -sf /backend/output_images ./output
RUN rm -rf models/

# Installing ComfyUI Manager

WORKDIR /comfyui/custom_nodes
RUN git clone https://github.com/ltdrdata/ComfyUI-Manager.git

COPY comfyui.supervisord.conf /etc/supervisor/conf.d/