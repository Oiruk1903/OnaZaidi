#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."

STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="deploy/backups"
mkdir -p "$BACKUP_DIR"

echo "==> Postgres backup"
docker exec onazaidi-postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" \
  | gzip > "$BACKUP_DIR/postgres-$STAMP.sql.gz"

echo "==> MinIO data backup"
docker run --rm \
  -v onazaidi_onazaidi_miniodata:/data \
  -v "$(pwd)/$BACKUP_DIR":/backup \
  alpine tar czf "/backup/minio-$STAMP.tar.gz" -C /data .

echo "==> Pruning backups older than 14 days"
find "$BACKUP_DIR" -type f -mtime +14 -delete

echo "==> Done: $BACKUP_DIR"
ls -lh "$BACKUP_DIR" | tail -5
