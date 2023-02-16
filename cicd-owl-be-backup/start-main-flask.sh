#!/bin/sh
export FLASK_APP=./main-flask.py
# pipenv run flask --debug run -h 0.0.0.0
flask --debug run -h 0.0.0.0

# localhost:5000