#!/bin/bash

set -e

SERVICE_NAME="ai-service"

echo "🤖 Creating $SERVICE_NAME structure..."

mkdir -p $SERVICE_NAME
cd $SERVICE_NAME

# Root files
touch requirements.txt Dockerfile .env.example main.py

# App core structure
mkdir -p app/{api/v1/endpoints,core/{rag,guardrails,llm},models,services,utils}
touch app/
