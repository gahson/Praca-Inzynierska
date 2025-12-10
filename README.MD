### AInterior
A team project developed for our engineering thesis. The application focuses on helping
interior architects to use artificial intelligence models in their work.

### Features
- Many AI model to chose
- Highly custiomizable
- Text to image, image to image, inpainting workflows
- Gallery with all pictures created by user
- Prompt gallery with all prompts written by user

### Techstack
- Backend: Python + FastAPI
- Frontend: React + Tailwindcss
- Database: MongoDB
- Containerization: Docker

## How to run

It is recommended to run this application on either native or wsl Ubuntu

### Preparation
1. Install docker with this instructions https://docs.docker.com/engine/install/ubuntu/ (In case of buildix issue: https://forums.docker.com/t/tips-for-how-to-fix-my-borked-cli-plugins/144327/3)

2. Install NVIDIA Container Toolkit  
    a. Add NVIDIA GPG key and repository

        curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \
        sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
        curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
        sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
        sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

    b. Update package list

        sudo apt-get update

    c. Install the toolkit

        sudo apt-get install -y nvidia-container-toolkit

    d. Configure the runtime
        
        sudo nvidia-ctk runtime configure --runtime=docker
        sudo systemctl restart docker
        sudo nvidia-ctk runtime configure --runtime=containerd
        sudo systemctl restart containerd

3. Generate read only api token on https://huggingface.co/settings/tokens.

4. Generate api token on https://civitai.com/user/account.

5. In main directory create `api_keys.env` file with following contents:

    ```
    HF_TOKEN=<hf_api_token>
    CIVITAI_TOKEN=<civitai_api_token>
    ```
    
6. Run `sudo ./download_models.sh`to download all the models (This needs to be run only once)

4. Build & run (Use after making changes to the docker related files or when installing new packages/modules) FIRST RUN WILL TAKE A LONG TIME!!!:
    - Developement mode: `docker compose down && docker compose up --build`  
    or
    - Production mode: `docker compose down && docker compose -f docker-compose-production.yml up --build -d`

5. Run:
    - Developement mode: `docker compose down && docker compose up`  
or
    - Production mode:`docker compose down && docker compose -f docker-compose-production.yml up -d`

### How to forward frontend via ssh:
1. ssh -L 80:localhost:80 username1@host1 username2@host2

### How to run tests

1. ``` cd frontend ```
2. ```  sudo apt install npm ```
3. ``` npm run test:ui ``` or ``` npm run test ```

## TODO
- https://docs.google.com/spreadsheets/d/14Qgea61NWSY51Ych7NmncooW5y2MEWiRMU0njNSEz4M/edit?gid=0#gid=0