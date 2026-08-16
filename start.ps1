Write-Host "Starting Sangeet Backend (Flask :5000) & Frontend (Vite :5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/backend'; python app.py"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/frontend'; npm run dev"
Write-Host "Servers starting in separate windows!" -ForegroundColor Green
Write-Host "Open App: http://localhost:5173" -ForegroundColor Yellow
