docker build -t praca-inzynierska-combined ./combined

# docker run --cap-add=NET_ADMIN -d -p 8080:80 -p 7022:22 --name praca-inzynierska-combined-1 praca-inzynierska-combined

docker build -t praca-inzynierska-backend ./backend

