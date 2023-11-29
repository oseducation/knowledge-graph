# Server for Vitsi AI

## Import programming methodology content to the DB using
1. Get the youtube api key, the one with public access will work just fine. See the details [here](https://developers.google.com/youtube/v3/getting-started)

2. Add the key as an environment variable
```console
export YOUTUBE_API_KEY='my_youtube_api_key'
```
3. (Optional) If you want to have a chat with an AI tutor export the OpenAI API key
```console
export CHAT_GPT_API_KEY='my_gpt_api_key'
```

4. Run the import
```console
make import
```

## Run server and webapp using
```console
make run
```
Killing the process will stop the server and all the processes on the server.

## Docker
* Run server and webapp containers:
 ```consloe
 make docker-start
 ```
* Stop server and webapp containers:
```console
make docker-stop
```
* To import the graph data:
```console
docker exec kg-server go run cmd/main.go db import --url https://raw.githubusercontent.com/oseducation/content-ge/main/programming-methodology/
```



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
