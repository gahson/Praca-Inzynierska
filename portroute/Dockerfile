# FROM praca-inzynierska-comfyui
FROM mramut/ainterior

COPY --chmod=744 forward-ports.sh /usr/local/bin/
COPY portroute.supervisord.conf /etc/supervisor/conf.d/

COPY --chmod=744 update-praca.sh /usr/local/bin/
