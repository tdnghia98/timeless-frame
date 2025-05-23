#!/bin/bash
# Start both backend (NestJS) and frontend (Next.js) in development mode

# Start backend
(cd backend && npm run start:dev) &
BACKEND_PID=$!

# Start frontend
(cd frontend && npm run dev) &
FRONTEND_PID=$!

# Wait for both to exit
wait $BACKEND_PID
wait $FRONTEND_PID
