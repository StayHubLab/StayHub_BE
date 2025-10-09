# Quick Deploy Script for StayHub Backend
Write-Host "Quick Deploy to Heroku..." -ForegroundColor Green

# Deploy to Heroku (assuming you're on main branch)
git add .
git commit -m "Quick deploy - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push heroku main

Write-Host "Deployment completed!" -ForegroundColor Green
