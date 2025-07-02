#!/bin/bash

set -e

# === CONFIGURATION ===
APP_DIR="/home/ubuntu/DocRoadMap"

echo "==== START OF DEPLOYEMENT ===="
date
echo "Project Repository : $APP_DIR"

# === DEPLOY ===
cd "$APP_DIR"

echo "Get repository from GitHub..."
git config --global --add safe.directory /home/ubuntu/DocRoadMap
git fetch origin
git reset --hard origin/main

echo "Build and create Docker images..."
docker compose down
docker system prune -f
docker compose up -d --build postgres backend

echo "Ensure uuid-ossp extension is enabled in Postgres..."
sleep 10
docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'

# === END ===
echo "==== END OF DEPLOYEMENT ===="
date
