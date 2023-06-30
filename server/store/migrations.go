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
					description VARCHAR(2048),
					node_type VARCHAR(32)
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table nodes")
			}

			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS edges (
					from_node_id VARCHAR(26),
					to_node_id VARCHAR(26),
					UNIQUE (from_node_id, to_node_id)
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

			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS videos (
					id VARCHAR(26) PRIMARY KEY,
					created_at bigint,
					deleted_at bigint,
					name VARCHAR(256),
					video_type VARCHAR(32),
					key VARCHAR(128),
					length bigint,
					node_id VARCHAR(26),
					author_id VARCHAR(26),
					UNIQUE (video_type, key)
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table videos")
			}

			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS sessions (
					id VARCHAR(26) PRIMARY KEY,
					token VARCHAR(26),
					create_at bigint,
					expires_at bigint,
					last_activity_at bigint,
					user_id VARCHAR(26),
					role VARCHAR(32)
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table sessions")
			}

			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS user_nodes (
					user_id VARCHAR(26),
					node_id VARCHAR(26),
					status VARCHAR(32),
					UNIQUE (user_id, node_id)
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table user_nodes")
			}

			if _, err := e.Exec(`
				CREATE INDEX IF NOT EXISTS user_nodes_user_id_index ON user_nodes (user_id);
			`); err != nil {
				return errors.Wrapf(err, "failed creating index on user_nodes table")
			}

			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS user_videos (
					user_id VARCHAR(26),
					video_id VARCHAR(26),
					last_watched_at bigint,
					times_finished bigint,
					times_started bigint,
					times_abandoned bigint,
					last_abandoned_after bigint,
					UNIQUE (user_id, video_id)
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table user_videos")
			}

			if _, err := e.Exec(`
				CREATE INDEX IF NOT EXISTS user_videos_user_id_index ON user_videos (user_id);
			`); err != nil {
				return errors.Wrapf(err, "failed creating index on user_videos table")
			}

			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS preferences (
					user_id VARCHAR(26),
					key VARCHAR(32),
					value VARCHAR(32),
					UNIQUE (user_id, key)
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table user_videos")
			}

			if _, err := e.Exec(`
				CREATE INDEX IF NOT EXISTS preferences_user_id_index ON preferences (user_id);
			`); err != nil {
				return errors.Wrapf(err, "failed creating index on preferences table")
			}
			return nil
		},
	},
}
