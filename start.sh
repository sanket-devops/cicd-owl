#!/bin/sh

cd /app/cicd-owl-be && npm run start &
cd /app/cicd-owl-fe && npm run start
