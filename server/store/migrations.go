package store

import (
	"fmt"

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
				CREATE TABLE IF NOT EXISTS preferences (
					user_id VARCHAR(26),
					key VARCHAR(32),
					value VARCHAR(32),
					UNIQUE (user_id, key)
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table preferences")
			}

			if _, err := e.Exec(`
				CREATE INDEX IF NOT EXISTS preferences_user_id_index ON preferences (user_id);
			`); err != nil {
				return errors.Wrapf(err, "failed creating index on preferences table")
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
					start bigint,
					length bigint,
					node_id VARCHAR(26),
					author_id VARCHAR(26),
					UNIQUE(video_type, key, start)
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table videos")
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

			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.1.0"),
		toVersion:   semver.MustParse("0.2.0"),
		migrationFunc: func(e sqlx.Ext, sqlDB *SQLStore) error {
			if sqlDB.config.DriverName == "sqlite3" {
				if _, err := e.Exec(`
					ALTER TABLE users ADD COLUMN lang VARCHAR(2) DEFAULT 'ge';
				`); err != nil {
					return errors.Wrapf(err, "failed adding column lang to table users")
				}
				if _, err := e.Exec(`
					ALTER TABLE nodes ADD COLUMN lang VARCHAR(2) DEFAULT 'ge';
				`); err != nil {
					return errors.Wrapf(err, "failed adding column lang to table users")
				}
			} else {
				if err := addColumnToPGTable(e, "users", "lang", "VARCHAR(2) DEFAULT 'ge'"); err != nil {
					return errors.Wrapf(err, "failed adding column lang to table users")
				}

				if err := addColumnToPGTable(e, "nodes", "lang", "VARCHAR(2) DEFAULT 'ge'"); err != nil {
					return errors.Wrapf(err, "failed adding column lang to table nodes")
				}
			}
			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.2.0"),
		toVersion:   semver.MustParse("0.3.0"),
		migrationFunc: func(e sqlx.Ext, sqlDB *SQLStore) error {
			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS texts (
					id VARCHAR(26) PRIMARY KEY,
					created_at bigint,
					updated_at bigint,
					deleted_at bigint,
					name VARCHAR(256),
					text VARCHAR(65535),
					node_id VARCHAR(26),
					author_id VARCHAR(26),
					UNIQUE (name)
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table texts")
			}
			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.3.0"),
		toVersion:   semver.MustParse("0.4.0"),
		migrationFunc: func(e sqlx.Ext, sqlDB *SQLStore) error {
			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS questions (
					id VARCHAR(26) PRIMARY KEY,
					name VARCHAR(128),
					question VARCHAR(8192),
					question_type VARCHAR(32),
					node_id VARCHAR(26),
					UNIQUE (name)
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table question")
			}
			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS question_choices (
					id VARCHAR(26) PRIMARY KEY,
					question_id VARCHAR(26),
					choice VARCHAR(1024),
					is_right_choice boolean
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table question_choices")
			}
			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS user_question_answers (
					user_id VARCHAR(26),
					question_id VARCHAR(26),
					choice_id VARCHAR(26),
					is_right boolean,
					created_at bigint
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table user_question_answers")
			}

			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.4.0"),
		toVersion:   semver.MustParse("0.5.0"),
		migrationFunc: func(e sqlx.Ext, sqlDB *SQLStore) error {
			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS user_node_codes (
					user_id VARCHAR(26),
					node_id VARCHAR(26),
					code_name VARCHAR(64),
					code VARCHAR(8192),
					UNIQUE (user_id, node_id, code_name)
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table user_node_codes")
			}

			if _, err := e.Exec(`
				CREATE INDEX IF NOT EXISTS user_node_codes_index ON user_node_codes (user_id, node_id);
			`); err != nil {
				return errors.Wrapf(err, "failed creating index on user_nodes table")
			}

			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.5.0"),
		toVersion:   semver.MustParse("0.6.0"),
		migrationFunc: func(e sqlx.Ext, sqlDB *SQLStore) error {
			if sqlDB.config.DriverName == "sqlite3" {
				if _, err := e.Exec(`
					ALTER TABLE nodes ADD COLUMN environment VARCHAR(32) DEFAULT '';
				`); err != nil {
					return errors.Wrapf(err, "failed adding column environment to table nodes")
				}
			} else {
				if err := addColumnToPGTable(e, "nodes", "environment", "VARCHAR(32) DEFAULT ''"); err != nil {
					return errors.Wrapf(err, "failed adding column environment to table nodes")
				}
			}
			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.6.0"),
		toVersion:   semver.MustParse("0.7.0"),
		migrationFunc: func(e sqlx.Ext, sqlDB *SQLStore) error {
			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS user_goals (
					user_id VARCHAR(26),
					node_id VARCHAR(26),
					created_at bigint,
					finished_at bigint,
					deleted_at bigint,
					UNIQUE (user_id, node_id)
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table user_goals")
			}

			if _, err := e.Exec(`
				CREATE INDEX IF NOT EXISTS user_goals_index ON user_goals (user_id);
			`); err != nil {
				return errors.Wrapf(err, "failed creating index on user_nodes table")
			}

			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS default_goals (
					node_id VARCHAR(26),
					num bigint,
					UNIQUE (node_id)
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table default_goals")
			}

			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.7.0"),
		toVersion:   semver.MustParse("0.8.0"),
		migrationFunc: func(e sqlx.Ext, sqlDB *SQLStore) error {
			if _, err := e.Exec(`
					CREATE TABLE IF NOT EXISTS posts (
						id VARCHAR(26) PRIMARY KEY,
						user_id VARCHAR(26),
						location_id VARCHAR(53),
						created_at bigint,
						updated_at bigint,
						deleted_at bigint,
						message VARCHAR(65535)
					);
				`); err != nil {
				return errors.Wrapf(err, "failed creating table posts")
			}

			if _, err := e.Exec(`
					CREATE INDEX IF NOT EXISTS posts_user_id ON posts (user_id);
				`); err != nil {
				return errors.Wrapf(err, "failed creating index posts_user_id on posts table")
			}

			if _, err := e.Exec(`
					CREATE INDEX IF NOT EXISTS posts_location_id ON posts (location_id);
				`); err != nil {
				return errors.Wrapf(err, "failed creating index posts_location_id on posts table")
			}

			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.8.0"),
		toVersion:   semver.MustParse("0.9.0"),
		migrationFunc: func(e sqlx.Ext, sqlDB *SQLStore) error {
			if sqlDB.config.DriverName == "sqlite3" {
				if _, err := e.Exec(`
					ALTER TABLE posts ADD COLUMN post_type VARCHAR(32) DEFAULT '';
				`); err != nil {
					return errors.Wrapf(err, "failed adding column post_type to table posts")
				}
				if _, err := e.Exec(`
					ALTER TABLE posts ADD COLUMN props VARCHAR(4096) DEFAULT '';
				`); err != nil {
					return errors.Wrapf(err, "failed adding column props to table posts")
				}
			} else {
				if err := addColumnToPGTable(e, "posts", "post_type", "VARCHAR(32) DEFAULT ''"); err != nil {
					return errors.Wrapf(err, "failed adding column post_type to table posts")
				}

				if err := addColumnToPGTable(e, "posts", "props", "json"); err != nil {
					return errors.Wrapf(err, "failed adding column post_type to table posts")
				}
			}
			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.9.0"),
		toVersion:   semver.MustParse("0.10.0"),
		migrationFunc: func(e sqlx.Ext, sqlDB *SQLStore) error {
			if sqlDB.config.DriverName == "sqlite3" {
				if _, err := e.Exec(`
					ALTER TABLE nodes ADD COLUMN parent_id VARCHAR(26) DEFAULT '';
				`); err != nil {
					return errors.Wrapf(err, "failed adding column parent_id to table posts")
				}
			} else {
				if err := addColumnToPGTable(e, "nodes", "parent_id", "VARCHAR(26) DEFAULT ''"); err != nil {
					return errors.Wrapf(err, "failed adding column parent_id to table posts")
				}
			}
			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.10.0"),
		toVersion:   semver.MustParse("0.11.0"),
		migrationFunc: func(e sqlx.Ext, sqlDB *SQLStore) error {
			if _, err := e.Exec(`
					CREATE TABLE IF NOT EXISTS user_interactions (
						id VARCHAR(26) PRIMARY KEY,
						user_id VARCHAR(26),
						start_date bigint,
						end_date bigint,
						url VARCHAR(256),
						ui_component_name VARCHAR(32),
						tag VARCHAR(32)
					);
				`); err != nil {
				return errors.Wrapf(err, "failed creating table user_times")
			}

			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.11.0"),
		toVersion:   semver.MustParse("0.12.0"),
		migrationFunc: func(e sqlx.Ext, sqlDB *SQLStore) error {
			if sqlDB.config.DriverName == "sqlite3" {
				if _, err := e.Exec(`
					ALTER TABLE user_nodes ADD COLUMN updated_at bigint DEFAULT 0;
				`); err != nil {
					return errors.Wrapf(err, "failed adding column updated_at to table user_nodes")
				}
			} else {
				if err := addColumnToPGTable(e, "user_nodes", "updated_at", "bigint DEFAULT 0"); err != nil {
					return errors.Wrapf(err, "failed adding column updated_at to table user_nodes")
				}
			}
			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.12.0"),
		toVersion:   semver.MustParse("0.13.0"),
		migrationFunc: func(e sqlx.Ext, sqlDB *SQLStore) error {
			if sqlDB.config.DriverName == "sqlite3" {
				if _, err := e.Exec(`
					ALTER TABLE nodes ADD COLUMN thumbnail_url VARCHAR(256) DEFAULT '';
				`); err != nil {
					return errors.Wrapf(err, "failed adding column thumbnail_url to table nodes")
				}
			} else {
				if err := addColumnToPGTable(e, "nodes", "thumbnail_url", "VARCHAR(256) DEFAULT ''"); err != nil {
					return errors.Wrapf(err, "failed adding column thumbnail_url to table nodes")
				}
			}
			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.13.0"),
		toVersion:   semver.MustParse("0.14.0"),
		migrationFunc: func(e sqlx.Ext, sqlDB *SQLStore) error {
			if _, err := e.Exec(`
					CREATE TABLE IF NOT EXISTS experiment_users (
						id VARCHAR(26) PRIMARY KEY,
						email VARCHAR(128) UNIQUE,
						source VARCHAR(128)
					);
				`); err != nil {
				return errors.Wrapf(err, "failed creating table experiment_users")
			}

			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.14.0"),
		toVersion:   semver.MustParse("0.15.0"),
		migrationFunc: func(e sqlx.Ext, sqlDB *SQLStore) error {
			if _, err := e.Exec(`
					CREATE TABLE IF NOT EXISTS customers (
						customer_id VARCHAR(255) UNIQUE,
						email VARCHAR(128),
						created_at bigint,
						deleted_at bigint,
						user_id VARCHAR(26)
					);
				`); err != nil {
				return errors.Wrapf(err, "failed creating table customers")
			}

			if _, err := e.Exec(`
				CREATE INDEX IF NOT EXISTS customers_user_id_index ON customers (user_id);
			`); err != nil {
				return errors.Wrapf(err, "failed creating index on customers table")
			}

			if _, err := e.Exec(`
					CREATE TABLE IF NOT EXISTS subscriptions (
						subscription_id VARCHAR(255),
						customer_id VARCHAR(255),
						created_at bigint,
						deleted_at bigint,
						plan_id VARCHAR(255),
						status VARCHAR(32),
						triggered_by_event_at bigint
					);
				`); err != nil {
				return errors.Wrapf(err, "failed creating table subscriptions")
			}

			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.15.0"),
		toVersion:   semver.MustParse("0.16.0"),
		migrationFunc: func(e sqlx.Ext, sqlDB *SQLStore) error {
			if sqlDB.config.DriverName == "sqlite3" {
				if _, err := e.Exec(`
					ALTER TABLE questions ADD COLUMN explanation VARCHAR(512) DEFAULT '';
				`); err != nil {
					return errors.Wrapf(err, "failed adding column explanation to table questions")
				}
			} else {
				if err := addColumnToPGTable(e, "questions", "explanation", "VARCHAR(512) DEFAULT ''"); err != nil {
					return errors.Wrapf(err, "failed adding column explanation to table questions")
				}
			}
			return nil
		},
	},
}

var addColumnToPGTable = func(e sqlx.Ext, tableName, columnName, columnType string) error {
	_, err := e.Exec(fmt.Sprintf(`
		DO
		$$
		BEGIN
			ALTER TABLE %s ADD %s %s;
		EXCEPTION
			WHEN duplicate_column THEN
				RAISE NOTICE 'Ignoring ALTER TABLE statement. Column "%s" already exists in table "%s".';
		END
		$$;
	`, tableName, columnName, columnType, columnName, tableName))

	return err
}
