#FROM python:3.13
FROM pytorch/pytorch

RUN apt-get update && apt-get install -y curl

WORKDIR /backend

COPY requirements.txt requirements.txt

RUN pip install --timeout=1000 -r requirements.txt

COPY . .