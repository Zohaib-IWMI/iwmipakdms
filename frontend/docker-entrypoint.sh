#!/bin/sh
set -e

# Wait for geoserver to be reachable before starting nginx to avoid "host not found" errors
GEOSERVER_HOST="geoserver"
GEOSERVER_PORT=8080
MAX_RETRIES=60
SLEEP_INTERVAL=1

i=0
until [ $i -ge $MAX_RETRIES ]
do
  if curl --connect-timeout 2 -sS "http://${GEOSERVER_HOST}:${GEOSERVER_PORT}/" >/dev/null 2>&1; then
    echo "Geoserver reachable at ${GEOSERVER_HOST}:${GEOSERVER_PORT}"
    break
  fi
  i=$((i+1))
  echo "Waiting for ${GEOSERVER_HOST}:${GEOSERVER_PORT}... (${i}/${MAX_RETRIES})"
  sleep ${SLEEP_INTERVAL}
done

if [ $i -ge $MAX_RETRIES ]; then
  echo "Warning: ${GEOSERVER_HOST}:${GEOSERVER_PORT} did not become reachable after ${MAX_RETRIES} seconds. Starting nginx anyway."
fi

exec "$@"
