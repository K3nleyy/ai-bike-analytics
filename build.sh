#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install Python dependencies
pip install -r backend/requirements.txt

# Run database migrations
python backend/manage.py migrate

# Collect static files (the React frontend bundle)
python backend/manage.py collectstatic --no-input

# Seed the ML data back into the fresh SQLite database!
cd backend
python seed_db.py
cd ..
