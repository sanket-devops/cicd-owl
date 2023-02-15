FROM python:3-alpine

LABEL maintainer='sanket.devops@gmail.com'
LABEL version='0.0.0-dev.0-build.0'

RUN apk add --update nodejs npm

ADD . /code/
WORKDIR /code/cicd-owl-be

RUN pip install -r requirements.txt --no-cache-dir

EXPOSE 5000/tcp

CMD ["sh", "/code/cicd-owl-be/start-main-flask.sh"]