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

style: golangci-lint modules-tidy vet eslint ## Runs style/lint checks

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
	docker exec kg-server /knowledge-graph-server/kg-server db import-content --url https://raw.githubusercontent.com/oseducation/content-ge/main/comp-science/

docker-container-rm: docker-stop
	docker compose rm

docker-nuke:
	docker exec kg-server /knowledge-graph-server/kg-server db nuke

import-old:
	cd server && go run cmd/main.go db import-old --url https://raw.githubusercontent.com/oseducation/content-ge/main/programming-methodology/

import:
	cd server && go run cmd/main.go db import-content --url https://raw.githubusercontent.com/oseducation/content-ge/main/comp-science/

import-khan:
	cd server && go run cmd/main.go db import --url https://raw.githubusercontent.com/oseducation/content-ge/main/khan-math-en/

nuke:
	cd server && go run cmd/main.go db nuke

n-run: nuke import run

modules-tidy:
	cd server && go mod tidy

build-webapp:
	cd webapp && npm run build

