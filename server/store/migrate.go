package store

import (
	"github.com/blang/semver"
	"github.com/pkg/errors"
)

// RunMigrations will run the migrations (if any). The caller should hold a cluster mutex if there
// is a danger of this being run on multiple servers at once.
func (sqlDB *SQLStore) RunMigrations() error {
	currentSchemaVersion, err := sqlDB.GetCurrentVersion()
	if err != nil {
		return errors.Wrapf(err, "failed to get the current schema version")
	}

	if currentSchemaVersion.LT(LatestVersion()) {
		if err := sqlDB.runMigrations(currentSchemaVersion); err != nil {
			return errors.Wrapf(err, "failed to complete migrations")
		}
	}

	return nil
}

func (sqlDB *SQLStore) runMigrations(originalSchemaVersion semver.Version) error {
	currentSchemaVersion := originalSchemaVersion
	for _, migration := range migrations {
		if !currentSchemaVersion.EQ(migration.fromVersion) {
			continue
		}

		if err := sqlDB.migrate(migration); err != nil {
			return err
		}

		currentSchemaVersion = migration.toVersion
	}

	return nil
}

func (sqlDB *SQLStore) migrate(migration Migration) (err error) {
	tx, err := sqlDB.db.Beginx()
	if err != nil {
		return errors.Wrap(err, "could not begin transaction")
	}
	defer sqlDB.finalizeTransaction(tx)

	if err := migration.migrationFunc(tx, sqlDB); err != nil {
		return errors.Wrapf(err, "error executing migration from version %s to version %s", migration.fromVersion.String(), migration.toVersion.String())
	}

	if err := sqlDB.SetCurrentVersion(tx, migration.toVersion); err != nil {
		return errors.Wrapf(err, "failed to set the current version to %s", migration.toVersion.String())
	}

	if err := tx.Commit(); err != nil {
		return errors.Wrap(err, "could not commit transaction")
	}
	return nil
}
