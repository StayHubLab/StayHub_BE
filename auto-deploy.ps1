# Auto Deploy Script for StayHub Backend
# Email: quanghuyclone01@gmail.com
Write-Host "StayHub Backend - Auto Deploy Script" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Check if logged in to Heroku
Write-Host "`n1. Checking Heroku login status..." -ForegroundColor Yellow
try {
    $herokuUser = heroku auth:whoami
    Write-Host "✓ Logged in as: $herokuUser" -ForegroundColor Green
} catch {
    Write-Host "✗ Not logged in to Heroku. Please run: heroku login" -ForegroundColor Red
    Write-Host "Use email: quanghuyclone01@gmail.com" -ForegroundColor Yellow
    exit 1
}

# App name suggestion
$appName = "stayhub-backend-2025"
Write-Host "`n2. Suggested app name: $appName" -ForegroundColor Cyan

# Check if app exists or create new one
Write-Host "`n3. Checking if Heroku app exists..." -ForegroundColor Yellow
try {
    $existingApps = heroku apps
    if ($existingApps -match $appName) {
        Write-Host "✓ App '$appName' already exists" -ForegroundColor Green
        Write-Host "Adding git remote..." -ForegroundColor Cyan
        heroku git:remote -a $appName
    } else {
        Write-Host "App '$appName' not found. Creating new app..." -ForegroundColor Yellow
        heroku create $appName
    }
} catch {
    Write-Host "Creating new Heroku app: $appName" -ForegroundColor Cyan
    heroku create $appName
}

# Install dependencies
Write-Host "`n4. Installing dependencies..." -ForegroundColor Yellow
npm install

# Set environment variables
Write-Host "`n5. Setting up environment variables..." -ForegroundColor Yellow

# Required environment variables
$envVars = @{
    "NODE_ENV" = "production"
    "JWT_SECRET" = "stayhub-super-secret-jwt-key-2025-production"
    "CORS_ORIGIN" = "*"
}

Write-Host "Setting required environment variables..." -ForegroundColor Cyan
foreach ($var in $envVars.GetEnumerator()) {
    Write-Host "Setting $($var.Key)..." -ForegroundColor White
    heroku config:set "$($var.Key)=$($var.Value)" --app $appName
}

# Ask for MongoDB URI
Write-Host "`n6. Database Configuration" -ForegroundColor Yellow
Write-Host "You need to provide a MongoDB connection string." -ForegroundColor Cyan
Write-Host "Options:" -ForegroundColor White
Write-Host "1. MongoDB Atlas (recommended for production)" -ForegroundColor White
Write-Host "2. Use a placeholder for now" -ForegroundColor White
Write-Host ""
$mongoChoice = Read-Host "Enter your MongoDB URI (or press Enter to skip for now)"

if ($mongoChoice) {
    heroku config:set "MONGODB_URI=$mongoChoice" --app $appName
    Write-Host "✓ MongoDB URI set" -ForegroundColor Green
} else {
    Write-Host "⚠ Skipping MongoDB URI - you'll need to set it manually later" -ForegroundColor Yellow
}

# Commit and deploy
Write-Host "`n7. Preparing for deployment..." -ForegroundColor Yellow
git add .
$commitMessage = "Deploy to Heroku - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git commit -m $commitMessage

Write-Host "`n8. Deploying to Heroku..." -ForegroundColor Yellow
Write-Host "Pushing to Heroku main branch..." -ForegroundColor Cyan
try {
    git push heroku main
    Write-Host "✓ Deployment successful!" -ForegroundColor Green
} catch {
    Write-Host "✗ Deployment failed" -ForegroundColor Red
    Write-Host "Error details:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Get app URL and verify
$appUrl = "https://$appName.herokuapp.com"
Write-Host "`n9. Deployment Verification" -ForegroundColor Yellow
Write-Host "App URL: $appUrl" -ForegroundColor Cyan
Write-Host "Health Check: $appUrl/health" -ForegroundColor Cyan

# Check app status
Write-Host "`nChecking app status..." -ForegroundColor Cyan
try {
    heroku ps --app $appName
} catch {
    Write-Host "Could not check app status" -ForegroundColor Yellow
}

# Open app in browser
Write-Host "`n10. Opening app in browser..." -ForegroundColor Yellow
try {
    heroku open --app $appName
} catch {
    Write-Host "Could not open browser automatically" -ForegroundColor Yellow
    Write-Host "Please visit: $appUrl" -ForegroundColor Cyan
}

Write-Host "`n=== DEPLOYMENT COMPLETED ===" -ForegroundColor Green
Write-Host "Backend URL: $appUrl" -ForegroundColor Cyan
Write-Host "Health Check: $appUrl/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test your API endpoints" -ForegroundColor White
Write-Host "2. Set up MongoDB URI if not done already" -ForegroundColor White
Write-Host "3. Configure additional environment variables as needed" -ForegroundColor White
Write-Host "4. Update your frontend to use the new backend URL" -ForegroundColor White
