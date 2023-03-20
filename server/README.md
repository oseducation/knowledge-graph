# Server for the Knowledge Graph

1. Run server using
```console
go run cmd/main.go
```

Killing the process will stop the server and all the processes on the server.

2. Create admin user using
```console
go run cmd/main.go db create --email bla@gmail.com --password 12345678
```