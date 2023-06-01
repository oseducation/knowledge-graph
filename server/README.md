# Server for the Knowledge Graph

## Import programming methodology content to the DB using
```console
go run cmd/main.go db import --url https://raw.githubusercontent.com/oseducation/content-ge/main/programming-methodology/
```

## Create admin user using
```console
go run cmd/main.go db create --email bla@gmail.com --password 12345678
```

## Run server and webapp using
```console
make run
```
Killing the process will stop the server and all the processes on the server.

## Docker
* ```make docker-start``` runs server and webapp containers
* ```make docker-stop``` stops server and webapp


## Using Postgres as data store
* run postgres database
```console
docker run --name kg-postgres -e POSTGRES_PASSWORD=mysecretpassword -d -p 5432:5432 postgres:15
```
* update DBSettings in config.json
```
    "DBSettings": {
        "DriverName": "postgres",
        "DataSource": "host=localhost port=5432 user=postgres password=mysecretpassword dbname=postgres sslmode=disable",
        "MaxIdleConns": 20,
        "ConnMaxLifetimeMilliseconds": 3600000,
        "ConnMaxIdleTimeMilliseconds": 300000,
        "MaxOpenConns": 300,
        "QueryTimeout": 30
    },
```

## WebUI for Postgres for development purposes
```console
docker run --name "pgadmin4" -e "PGADMIN_DEFAULT_EMAIL=user@domain.com" -e "PGADMIN_DEFAULT_PASSWORD=SuperSecret" -d -p 8080:80 dpage/pgadmin4
```