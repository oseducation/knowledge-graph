check-prereqs: ## Checks prerequisite software status.
	./prereq-check.sh

run-server:
	cd server && go run cmd/main.go&

run-client:
	cd webapp && npm run dev

run: check-prereqs run-server run-client ## Runs the server and webapp.

golangci-lint:
	cd server && golangci-lint run ./...

vet:
	cd server && go vet ./...

eslint:
	cd webapp && npx eslint --ext .js,.jsx,.tsx,.ts . --quiet --cache

style: golangci-lint vet eslint ## Runs style/lint checks

test:
	cd server && go test ./...

docker-build:
	docker compose build --no-cache

docker-start:
	docker compose up -d --build

docker-start-fg:
	docker compose up --build

docker-stop:
	docker compose down

docker-import: docker-start
	docker exec kg-server /knowledge-graph-server/kg-server db import --url https://raw.githubusercontent.com/oseducation/content-ge/main/programming-methodology/

docker-container-rm: docker-stop
	docker compose rm

docker-nuke:
	docker exec kg-server /knowledge-graph-server/kg-server db nuke

import:
	cd server && go run cmd/main.go db import --url https://raw.githubusercontent.com/oseducation/content-ge/main/programming-methodology/

nuke:
	cd server && go run cmd/main.go db nuke

n-run: nuke import run
