#!/usr/bin/env bash
set -euo pipefail

mvn -q -DskipTests spring-boot:run \
  -Dspring-boot.run.arguments="--spring.main.web-application-type=none --app.oss.enabled=true --app.oss.migration.run=true --app.oss.migration.report-path=./oss_migration_report.jsonl"

