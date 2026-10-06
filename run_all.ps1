$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Start-Process powershell -ArgumentList '-NoExit','-ExecutionPolicy','Bypass','-Command',("cd `"$root\backend`"; if (!(Test-Path venv)) { python -m venv venv }; .\venv\Scripts\Activate.ps1; pip install -r requirements.txt; uvicorn app.main:app --reload")
Start-Process powershell -ArgumentList '-NoExit','-ExecutionPolicy','Bypass','-Command',("cd `"$root\frontend`"; npm install; npm run dev")
Write-Host "Backend and frontend terminals started."
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend:  http://127.0.0.1:8000"
