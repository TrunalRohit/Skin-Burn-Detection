#!/usr/bin/env bash
set -euo pipefail

# Upgrade pip and build tools so manylinux wheels are recognized and installed
python -m pip install --upgrade pip setuptools wheel

# Install requirements
pip install -r requirements.txt
