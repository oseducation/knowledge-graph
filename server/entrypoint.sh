#!/bin/bash

# Check if DATABASE_DRIVER_NAME environment variable is defined
if [ -n "$DATABASE_DRIVER_NAME" ]; then
  # Update JSON file using jq
  jq --arg driver "$DATABASE_DRIVER_NAME" '.DBSettings.DriverName = $driver' config/config.json > /tmp/config.json && mv /tmp/config.json config/config.json
fi

# Check if DATABASE_DATASOURCE environment variable is defined
if [ -n "$DATABASE_DATASOURCE" ]; then
  # Update JSON file using jq
  jq --arg source "$DATABASE_DATASOURCE" '.DBSettings.DataSource = $source' config/config.json > /tmp/config.json && mv /tmp/config.json config/config.json
fi

# Run make command
/knowledge-graph-server/kg-server
