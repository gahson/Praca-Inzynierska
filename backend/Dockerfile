FROM python:3.13

RUN apt update && apt upgrade -y

WORKDIR /backend

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY . .