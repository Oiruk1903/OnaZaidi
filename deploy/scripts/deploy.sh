#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."

echo "==> Deploying OnaZaidi"

if [ ! -f .env ]; then
  echo "ERROR: .env not found. Copy .env.example and fill in values."
  exit 1
fi

echo "==> Pulling latest code"
git pull --ff-only || true

echo "==> Building images"
docker compose -f docker-compose.prod.yml build

echo "==> Applying database migrations (via backend startup)"
docker compose -f docker-compose.prod.yml up -d postgres minio
sleep 6

echo "==> Starting services"
docker compose -f docker-compose.prod.yml up -d

echo "==> Waiting for backend health"
for i in $(seq 1 30); do
  if docker exec onazaidi-backend wget -qO- http://localhost:8080/actuator/health >/dev/null 2>&1; then
    echo "Backend healthy"
    break
  fi
  sleep 3
done

echo "==> Current status"
docker compose -f docker-compose.prod.yml ps

echo "==> Done."
