FROM ubuntu:22.04

RUN apt-get update && apt-get upgrade -y

RUN apt install -y nginx curl supervisor gnupg python3

# RUN rm -rf /var/lib/apt/lists/*
# RUN apt clean
    
# Define the ENV variable
ENV nginx_vhost /etc/nginx/sites-available/default
ENV nginx_conf /etc/nginx/nginx.conf
ENV supervisor_conf /etc/supervisor/supervisord.conf

# Enable PHP-fpm on nginx virtualhost configuration
COPY default ${nginx_vhost}
RUN echo "\ndaemon off;" >> ${nginx_conf}
    
RUN curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor

COPY mongodb-org-8.2.list /etc/apt/sources.list.d/mongodb-org-8.2.list

RUN apt-get update

RUN apt-get install -y mongodb-org

# Copy supervisor configuration
COPY supervisord.conf ${supervisor_conf}

RUN chown -R www-data:www-data /var/www/html
    
# Volume configuration
VOLUME ["/etc/nginx/sites-enabled", "/etc/nginx/certs", "/etc/nginx/conf.d", "/var/log/nginx", "/var/www/html"]

# Copy start.sh script and define default command for the container
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]

# Expose Port for the Application 
EXPOSE 80 443