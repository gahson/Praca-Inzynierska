#!/bin/sh

apt-get install -y git

rm -rf /praca
git clone --dept=1 https://github.com/gahson/Praca-Inzynierska /praca

cp --recursive /praca/backend /backend/
cp --recursive /praca/frontend /frontend/

supervisorctl restart uvicorn-backend
supervisorctl restart node-frontend
