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
- Backend: FastAPI (python)
- Frontend: React + ChakraUI
- Database: PostgreSQL
- Containerization: Docker

### How to run

It is recommended to run this application on either native or wsl Ubuntu

## Preparation
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

3. Build & run container in the developement mode (Use after making changes to the docker related files or when installing new packages/modules):
    - docker compose down && docker compose up --build

4. 3. Run container in the developement mode:
    - docker compose down && docker compose up

### TODO
- https://docs.google.com/spreadsheets/d/14Qgea61NWSY51Ych7NmncooW5y2MEWiRMU0njNSEz4M/edit?gid=0#gid=0