package store

import (
	"github.com/blang/semver"
	"github.com/jmoiron/sqlx"
)

type Migration struct {
	fromVersion   semver.Version
	toVersion     semver.Version
	migrationFunc func(sqlx.Ext, *SQLStore) error
}

var migrations = []Migration{}
