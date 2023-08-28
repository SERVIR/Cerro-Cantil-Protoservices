# Cerro-Cantil-Protoservices

[![Django: 4.x](https://img.shields.io/badge/Django-4.x-blue)](https://www.djangoproject.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![SERVIR: Global](https://img.shields.io/badge/SERVIR-Global-green)](https://servirglobal.net)

This application is meant to display prototype services for the Cerro Cantil protected area.  Currently, we are 
displaying fire data, both current and historical both from Fire Information for Resource Management System (FIRMS).
We display not only counts of the hotspots, but also display the location on a map.  Included on the map are the 
most current 5 day high resolution imagery from Planet as well as a comparison layer where two different high resolution 
composites can be overlaid and compared using a draggable slider.  Finally we offer the local weather for the current 
day and following 5 day forecast.




## Setup and Installation
The installation described here will make use of conda to ensure there are no package conflicts with
existing or future applications on the machine.  It is highly recommended using a dedicated environment
for this application to avoid any issues.

### Recommended
Conda (To manage packages within the applications own environment)

### Environment
- Create the env

```commandline
conda env create -f environment.yml
```

Add a file named data.json in the base directory.  This file will hold a json object containing
the siteID for your application, ALLOWED_HOSTS, and CSRF_TRUSTED_ORIGINS.  The format will be:

```json
{
  "SITE_ID": 4,
  "ALLOWED_HOSTS": ["localhost", "your_domain.com", "127.0.0.1"],
  "CSRF_TRUSTED_ORIGINS": ["https://your_domain.com"],
  "SECRET_KEY": "REPLACE WITH A SECRET KEY USING LETTERS, NUMBERS, AND SPECIAL CHARACTERS",
  "http_https": "http",
  "PLANET_API_KEY": "Replace with your planet ket",
  "NICFI_API_KEY": "Replace with your nicfi ket",
  "DEBUG": "True or False"
}
```

- Create database tables and superuser
###### follow prompts to create super user
```commandline
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic
```

At this point you should be able to start the application.  From the root directory you can run the following command

```
python manage.py runserver
```

Of course running the application in this manner is only for development.  We recommend installing
this application on a server and serving it through nginx using gunicorn (conda install gunicorn) for production.  To do this you will need to
have both installed on your server.  There are enough resources explaining in depth how to install them,
so we will avoid duplicating this information.  We recommend adding a service to start the application
by creating a .service file located at /etc/systemd/system.  We named ours cerro.service
The service file will contain the following, please substitute the correct paths as mentioned below.

# Server installation
## Create Application Service
As mentioned above create the following file at /etc/systemd/system and name it cerro.service
```editorconfig
[Unit]
Description=cerro daemon
After=network.target

[Service]
User=www-data
Group=www-data
SocketUser=www-data
WorkingDirectory={REPLACE WITH PATH TO APPLICATION ROOT}/cerro_cantil
accesslog = "/var/log/cerro/cerro_gunicorn.log"
errorlog = "/var/log/cerro/cerro_gunicornerror.log"
ExecStart={REPLACE WITH FULL PATH TO gunicorn IN YOUR CONDA ENV}/bin/gunicorn --timeout 60 --workers 5 --pythonpath '{REPLACE WITH PATH TO APPLICATION ROOT},{REPLACE WITH FULL PATH TO YOUR CONDA ENV}/lib/python3.10/site-packages' --bind unix:{REPLACE WITH LOCATION YOU WANT THE SOCK}/cerro_prod.sock wsgi:application

[Install]
WantedBy=multi-user.target

```

## Create nginx site
Create a file in /etc/nginx/conf.d named cerro_prod.conf

```editorconfig
upstream cerro_prod {
  server unix:{REPLACE WITH LOCATION YOU WANT THE SOCK}/cerro_prod.sock 
  fail_timeout=0;
}

server {
    listen 443;
    server_name {REPLACE WITH YOUR DOMAIN};
    add_header Access-Control-Allow-Origin *;

    ssl on;
    ssl_certificate {REPLACE WITH FULL PATH TO CERT FILE};
    ssl_certificate_key {REPLACE WITH FULL PATH TO CERT KEY};

    # Some Settings that worked along the way
    client_max_body_size 8000M;
    client_body_buffer_size 8000M;
    client_body_timeout 120;

    proxy_read_timeout 300;
    proxy_connect_timeout 300;
    proxy_send_timeout 300;
    fastcgi_buffers 8 16k;
    fastcgi_buffer_size 32k;
    fastcgi_connect_timeout 90s;
    fastcgi_send_timeout 90s;
    fastcgi_read_timeout 90s;


    location = /favicon.ico { access_log off; log_not_found off; }
    location /static/ {
        autoindex on;
        alias {REPLACE WITH FULL PATH TO APPS}/staticfiles/;
    }

    location / {
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://unix:{REPLACE WITH LOCATION YOU WANT THE SOCK}/cerro_prod.sock ;
    }


}

# Reroute any non https traffic to https
server {
    listen 80;
    server_name {REPLACE WITH YOUR DOMAIN};
    rewrite ^(.*) https://$server_name$1 permanent;
}

```


Cerro Cantil Protoservices uses Google authentication which will need to be configured in the
[Google Developer APIs Console]( https://console.developers.google.com/apis ). When you open the console you will
need to create a new project.

- Click "Select a project" (or arrow by prior project name if you already have projects) at the top left of the screen.
- In the new dialog click New Project at the top right
- Enter Project Name and click Create
- In the left panel click "OAuth consent screen" link and fill out the form with the information for your application.
- In the left panel click "Credentials" link
- At the top left click + Create Credentials and select "OAuth 2.0 Client ID"
- In the dropdown select "Web Application" and give a name.
- Add Authorized JavaScript origins (you may enable multiple)
    - examples:
        - http://localhost:8010
        - http://127.0.0.1:8010
        - https://ccf.servirglobal.net
- Add Authorized redirect URIs (you may enable multiple)
    - examples:
        - http://localhost:8010/accounts/google/login/callback/
        - http://127.0.0.1:8010/accounts/google/login/callback/
        - https://ccf.servirglobal.net/accounts/google/login/callback/
- Copy and save the Client ID and Client secret to your local machine (you will need these later)
- Click save

Authentication is now enabled through google, but we need to connect it to your application.

Add the site domain to the system in the terminal by entering the shell.  This is needed
due to the social authentication which is enabled.
```shell
python manage.py shell
```
Run the following in the open shell substituting domain for the correct domain
```python
from django.contrib.sites.models import Site
site = Site()
site.domain = '{REPLACE WITH YOUR DOMAIN}'
site.name = '{REPLACE WITH YOUR DOMAIN}'
site.save()
```

Open the admin page of your site by navigating to your url/admin and login with the superuser
account you created earlier. In the left panel click the link that says "Social Accounts".  Click the Add
button.  Select Google for the provider, give a name, paste the Client ID that you saved, and the
Client secret (secret key) into the boxes.  Leave Key empty, move the domain you added to Chosen sites and click save.
This completes the Authentication setup.

# Create Alias commands to make starting the application simple
Create a file at /etc/profile.d named cerro_alias.sh and add the following:
```commandline
# Global Alias
alias d='conda deactivate'
alias so='sudo chown -R www-data /servir_apps'
alias nsr='sudo service nginx restart'
alias nss='sudo service nginx stop'


#cerro_cantil
alias cerro='cd /servir_apps/Cerro-Cantil-Protoservices'
alias actcerro='conda activate cerro_cantil'
alias uocerro='sudo chown -R ${USER} /servir_apps/Cerro-Cantil-Protoservices'
alias socerro='sudo chown -R www-data /servir_apps/Cerro-Cantil-Protoservices'
alias cerrostart='sudo service cerro restart; nsr; so'
alias cerrostop='sudo service cerro stop'
alias cerrorestart='cerrostop; cerrostart'

```
Now activate the alias file by running
```commandline
source /etc/profile.d/cerro_alias.sh
```

Now you should be able to run cerrostart to run the production application.

## Contact

### Authors
- [Billy Ashmall (NASA/USRA)](https://github.com/billyz313)

## License and Distribution

This application is built and maintained by SERVIR under the terms of the MIT License. See
[LICENSE](https://github.com/SERVIR/AppTemplate2022/blob/master/license) for more information.

## Privacy & Terms of Use

This applications abides to all of SERVIR's privacy and terms of use as described
at [https://servirglobal.net/Privacy-Terms-of-Use](https://servirglobal.net/Privacy-Terms-of-Use).

## Disclaimer

The SERVIR Program, NASA and USAID make no express or implied warranty of this application as to the merchantability or
fitness for a particular purpose. Neither the US Government nor its contractors shall be liable for special,
consequential or incidental damages attributed to this application.