#!/bin/bash
cd /home/runner/workspace/server && npx ts-node src/server.ts &
SERVER_PID=$!
cd /home/runner/workspace/client && npm run dev &
CLIENT_PID=$!
wait $SERVER_PID $CLIENT_PID
