# Run this from Windows PowerShell to force file change detection
# This makes the dev server see the file changes made from WSL

Write-Host "Touching App.tsx to trigger file watcher..." -ForegroundColor Yellow
(Get-Item "F:\smartbiz\views\App.tsx").LastWriteTime = Get-Date

Write-Host "Touching HRDashboard.tsx..." -ForegroundColor Yellow
(Get-Item "F:\smartbiz\views\HRDashboard.tsx").LastWriteTime = Get-Date

Write-Host "Done! Vite should now reload these files." -ForegroundColor Green
Write-Host "Check your browser console for the new logs!" -ForegroundColor Green
