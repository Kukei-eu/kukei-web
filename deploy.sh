#!/bin/bash

# Execute git pull to update the repository
git pull

# Build Docker images
docker compose build

# Stop and remove containers
docker compose down

# Start containers in detached mode
docker compose up -d
