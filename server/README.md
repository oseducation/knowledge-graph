# Server for the Knowledge Graph

## Import programming methodology content to the DB using
```console
go run cmd/main.go db import --url https://raw.githubusercontent.com/oseducation/content-ge/main/programming-methodology/
```

## Create admin user using
```console
go run cmd/main.go db create --email bla@gmail.com --password 12345678
```

## Run server using
```console
go run cmd/main.go
```
Killing the process will stop the server and all the processes on the server.

