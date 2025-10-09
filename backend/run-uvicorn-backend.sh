#!/bin/sh

mongosh --eval 'db.createUser({user:"admin", pwd: "mongo", roles:["dbAdmin"]})' mongo
exec uvicorn main:app --host 0.0.0.0 --port 5555 --reload
