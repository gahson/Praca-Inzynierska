FROM ubuntu:22.04

RUN apt-get update && apt-get upgrade -y

RUN apt-get install -y nginx curl supervisor gnupg python3 openssh-server openvpn

# RUN rm -rf /var/lib/apt/lists/*
# RUN apt clean

# vpn client
COPY vpn-tls/docker-client.conf /etc/openvpn/client/
COPY --chmod=744 run-openvpn.sh /usr/local/bin/
COPY vpn-tls/ca.crt /etc/openvpn/tls/ca.crt
COPY vpn-tls/docker-client.crt /etc/openvpn/tls/docker-client.crt
# FIXME: load secret differently
COPY --chmod=600 vpn-tls/docker-client.key /etc/openvpn/tls/docker-client.key
    
# nginx
ENV nginx_vhost /etc/nginx/sites-available/default
ENV nginx_conf /etc/nginx/nginx.conf

COPY default ${nginx_vhost}
RUN echo "\ndaemon off;" >> ${nginx_conf}

RUN chown -R www-data:www-data /var/www/html

# ssh
RUN mkdir /run/sshd

COPY id_ed25519.pub /root/.ssh/authorized_keys

RUN chmod 600 /root/.ssh/authorized_keys

RUN chmod 700 /root/.ssh

# mongodb
RUN curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor

COPY mongodb-org-8.2.list /etc/apt/sources.list.d/mongodb-org-8.2.list

RUN apt-get update

RUN apt-get install -y mongodb-org 

# Copy supervisor configuration
ENV supervisor_conf /etc/supervisor/supervisord.conf

COPY supervisord.conf ${supervisor_conf}
    
# Volume configuration
VOLUME ["/etc/nginx/sites-enabled", "/etc/nginx/certs", "/etc/nginx/conf.d", "/var/log/nginx", "/var/www/html"]

# Copy start.sh script and define default command for the container
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]

# Expose Port for the Application 
EXPOSE 22 80 443