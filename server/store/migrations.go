package store

import (
	"github.com/blang/semver"
	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
)

type Migration struct {
	fromVersion   semver.Version
	toVersion     semver.Version
	migrationFunc func(sqlx.Ext, *SQLStore) error
}

var migrations = []Migration{
	{
		fromVersion: semver.MustParse("0.0.0"),
		toVersion:   semver.MustParse("0.1.0"),
		migrationFunc: func(e sqlx.Ext, sqlDB *SQLStore) error {
			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS system (
					s_key VARCHAR(64) PRIMARY KEY,
					s_value VARCHAR(1024) NULL
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table System")
			}

			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS users (
					id VARCHAR(26) PRIMARY KEY,
					created_at bigint,
					updated_at bigint,
					deleted_at bigint,
					username VARCHAR(64) UNIQUE,
					password VARCHAR(128),
					last_password_update bigint,
					email VARCHAR(128) UNIQUE,
					email_verified boolean,
					first_name VARCHAR(64),
					last_name VARCHAR(64),
					role VARCHAR(256)
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table users")
			}

			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS tokens (
					token VARCHAR(64) PRIMARY KEY,
					created_at bigint,
					type VARCHAR(64),
					extra VARCHAR(2048)
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table tokens")
			}

			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS nodes (
					id VARCHAR(26) PRIMARY KEY,
					created_at bigint,
					updated_at bigint,
					deleted_at bigint,
					name VARCHAR(128) UNIQUE,
					description VARCHAR(2048)
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table nodes")
			}

			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS edges (
					from_node_id VARCHAR(26),
					to_node_id VARCHAR(26)
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table edges")
			}

			if _, err := e.Exec(`
				CREATE INDEX IF NOT EXISTS from_node_id_index ON edges (from_node_id);
				CREATE INDEX IF NOT EXISTS to_node_id_index ON edges (to_node_id);
			`); err != nil {
				return errors.Wrapf(err, "failed creating indexes on edges table")
			}

			return nil
		},
	},
}
