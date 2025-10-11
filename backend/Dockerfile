#FROM pytorch/pytorch

FROM praca-inzynierska-combined

COPY --chmod=0755 run-uvicorn-backend.sh /

RUN mkdir -p /etc/supervisor/conf.d/
COPY unicorn-backend.supervisord.conf /etc/supervisor/conf.d/

RUN mkdir -p /backend

WORKDIR /backend

RUN apt-get install -y python3-pip && pip3 install torch

COPY requirements.txt requirements.txt

RUN pip install --timeout=1000 -r requirements.txt

COPY . .