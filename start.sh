#!/bin/bash
cd /home/runner/workspace/client && npm run dev -- -p 3000 -H 0.0.0.0 &
CLIENT_PID=$!
cd /home/runner/workspace/server && npx ts-node --transpile-only src/server.ts &
SERVER_PID=$!
wait $SERVER_PID $CLIENT_PID
