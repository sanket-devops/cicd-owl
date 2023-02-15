# ssh-owl-BE
Run command on ssh configured server using API

## Python3.10 and pip require
> https://www.python.org/downloads/

### Install dependency using Pipfile
```shell
python -m pip install pipenv
pipenv shell

# Install Pipfile dependency
pipenv install
# pipenv install --ignore-pipfile     # Install dependency from Pipfile.lock
```
### Start any one server 
```shell
sh start-main-fastapi.sh  # localhost:8000
# OR
sh start-main-flask.sh  # localhost:5000
```

### Post api configuration
```shell
curl --location --request POST 'http://192.168.10.166:5000/ssh' \
--header 'Content-Type: application/json' \
--data-raw '{
    "host": "Host_Add",
    "username": "Server_User",
    "password": "Server_Password",
    "commandsArr": [
        "whami",
        "ip add",
        "ls -ltrha"
    ]
}'
```