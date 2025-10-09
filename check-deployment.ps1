# Deployment Check Script for StayHub Backend
Write-Host "Checking StayHub Backend Deployment..." -ForegroundColor Green

# Get app name from git remote
try {
    $herokuUrl = git remote get-url heroku
    $appName = $herokuUrl -replace "https://git.heroku.com/", "" -replace ".git", ""
    Write-Host "App Name: $appName" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Could not find Heroku remote. Please check your git configuration." -ForegroundColor Red
    exit 1
}

$appUrl = "https://$appName.herokuapp.com"
$healthUrl = "$appUrl/health"

Write-Host "Checking deployment status..." -ForegroundColor Yellow

# Check if Heroku CLI is available
try {
    $herokuVersion = heroku --version
    Write-Host "Heroku CLI: $herokuVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Warning: Heroku CLI not found. Some checks will be skipped." -ForegroundColor Yellow
}

# Check app status
Write-Host "`n1. Checking app status..." -ForegroundColor Yellow
try {
    heroku ps --app $appName
} catch {
    Write-Host "Could not check app status via Heroku CLI" -ForegroundColor Yellow
}

# Check health endpoint
Write-Host "`n2. Checking health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 10
    Write-Host "Health check: PASSED" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Cyan
} catch {
    Write-Host "Health check: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Check basic API endpoint
Write-Host "`n3. Checking API availability..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-RestMethod -Uri $appUrl -Method Get -TimeoutSec 10
    Write-Host "API check: PASSED" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "API check: PASSED (404 is expected for root endpoint)" -ForegroundColor Green
    } else {
        Write-Host "API check: FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Check environment variables
Write-Host "`n4. Checking environment variables..." -ForegroundColor Yellow
try {
    $config = heroku config --app $appName
    Write-Host "Environment variables:" -ForegroundColor Cyan
    Write-Host $config -ForegroundColor White
} catch {
    Write-Host "Could not check environment variables via Heroku CLI" -ForegroundColor Yellow
}

# Check recent logs
Write-Host "`n5. Checking recent logs..." -ForegroundColor Yellow
try {
    Write-Host "Recent logs (last 10 lines):" -ForegroundColor Cyan
    heroku logs --tail --app $appName | Select-Object -Last 10
} catch {
    Write-Host "Could not retrieve logs via Heroku CLI" -ForegroundColor Yellow
}

# Summary
Write-Host "`n=== DEPLOYMENT SUMMARY ===" -ForegroundColor Green
Write-Host "App URL: $appUrl" -ForegroundColor Cyan
Write-Host "Health Check: $healthUrl" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Test your API endpoints manually" -ForegroundColor White
Write-Host "2. Verify all environment variables are set correctly" -ForegroundColor White
Write-Host "3. Check application logs for any errors" -ForegroundColor White
Write-Host "4. Update your frontend to use the new backend URL" -ForegroundColor White

Write-Host "`nDeployment check completed!" -ForegroundColor Green
