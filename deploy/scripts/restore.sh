#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <path-to-postgres-backup.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"
cd "$(dirname "$0")/../.."

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup not found: $BACKUP_FILE"
  exit 1
fi

echo "WARNING: This will DROP and RECREATE the database."
read -p "Type 'yes' to continue: " CONFIRM
[ "$CONFIRM" = "yes" ] || exit 1

echo "==> Stopping backend"
docker compose -f docker-compose.prod.yml stop backend

echo "==> Restoring Postgres"
gunzip -c "$BACKUP_FILE" | docker exec -i onazaidi-postgres psql \
  -U "$POSTGRES_USER" -d "$POSTGRES_DB"

echo "==> Restarting backend"
docker compose -f docker-compose.prod.yml start backend

echo "==> Done."
