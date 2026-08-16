@echo off
echo Starting Sangeet Backend (Flask on :5000) and Frontend (Vite on :5173)...
start "Sangeet Backend" cmd /k "cd backend && python app.py"
start "Sangeet Frontend" cmd /k "cd frontend && npm run dev"
echo Both servers started! Access the app at http://localhost:5173
