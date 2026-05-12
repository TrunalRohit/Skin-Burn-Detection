#!/usr/bin/env bash
set -euo pipefail

# Use the backend build script from the repository root in Render monorepo setup
bash backend/render-build.sh
