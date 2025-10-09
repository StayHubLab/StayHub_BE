# Complete Heroku Setup Script for StayHub Backend
Write-Host "StayHub Backend - Heroku Setup Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check prerequisites
Write-Host "`n1. Checking prerequisites..." -ForegroundColor Yellow

$checks = @{
    "Git" = Test-Command "git"
    "Node.js" = Test-Command "node"
    "NPM" = Test-Command "npm"
    "Heroku CLI" = Test-Command "heroku"
}

foreach ($check in $checks.GetEnumerator()) {
    if ($check.Value) {
        Write-Host "✓ $($check.Key): Installed" -ForegroundColor Green
    } else {
        Write-Host "✗ $($check.Key): Not found" -ForegroundColor Red
    }
}

# Check if all required tools are installed
if (-not ($checks["Git"] -and $checks["Node.js"] -and $checks["NPM"])) {
    Write-Host "`nError: Required tools are missing. Please install:" -ForegroundColor Red
    if (-not $checks["Git"]) { Write-Host "- Git: https://git-scm.com/" -ForegroundColor Yellow }
    if (-not $checks["Node.js"]) { Write-Host "- Node.js: https://nodejs.org/" -ForegroundColor Yellow }
    if (-not $checks["NPM"]) { Write-Host "- NPM (comes with Node.js)" -ForegroundColor Yellow }
    exit 1
}

# Check Heroku CLI
if (-not $checks["Heroku CLI"]) {
    Write-Host "`nWarning: Heroku CLI not found. Please install it from:" -ForegroundColor Yellow
    Write-Host "https://devcenter.heroku.com/articles/heroku-cli" -ForegroundColor Yellow
    Write-Host "`nYou can continue with the setup, but deployment will require Heroku CLI." -ForegroundColor Yellow
}

# Check if we're in a git repository
Write-Host "`n2. Checking Git repository..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Cyan
    git init
    git add .
    git commit -m "Initial commit"
} else {
    Write-Host "✓ Git repository found" -ForegroundColor Green
}

# Install dependencies
Write-Host "`n3. Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to install dependencies: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Check if Heroku remote exists
Write-Host "`n4. Checking Heroku remote..." -ForegroundColor Yellow
$herokuRemote = git remote -v | Select-String "heroku"
if (-not $herokuRemote) {
    Write-Host "No Heroku remote found. You need to create a Heroku app first." -ForegroundColor Yellow
    Write-Host "`nTo create a Heroku app:" -ForegroundColor Cyan
    Write-Host "1. Login to Heroku: heroku login" -ForegroundColor White
    Write-Host "2. Create app: heroku create your-app-name" -ForegroundColor White
    Write-Host "3. Or add existing remote: heroku git:remote -a your-existing-app" -ForegroundColor White
} else {
    Write-Host "✓ Heroku remote found" -ForegroundColor Green
}

# Display configuration files created
Write-Host "`n5. Configuration files created:" -ForegroundColor Yellow
$configFiles = @(
    "Procfile",
    "package.json (updated)",
    "env.example",
    ".github/workflows/deploy.yml",
    ".github/workflows/manual-deploy.yml",
    "deploy-backend.ps1",
    "quick-deploy.ps1",
    "check-deployment.ps1",
    "DEPLOYMENT.md"
)

foreach ($file in $configFiles) {
    Write-Host "✓ $file" -ForegroundColor Green
}

# Next steps
Write-Host "`n=== NEXT STEPS ===" -ForegroundColor Green
Write-Host "1. Create a Heroku app (if not done already):" -ForegroundColor Yellow
Write-Host "   heroku create your-app-name" -ForegroundColor White
Write-Host ""
Write-Host "2. Set environment variables:" -ForegroundColor Yellow
Write-Host "   heroku config:set NODE_ENV=production --app your-app-name" -ForegroundColor White
Write-Host "   heroku config:set MONGODB_URI=your-mongodb-uri --app your-app-name" -ForegroundColor White
Write-Host "   heroku config:set JWT_SECRET=your-jwt-secret --app your-app-name" -ForegroundColor White
Write-Host ""
Write-Host "3. Deploy your app:" -ForegroundColor Yellow
Write-Host "   .\deploy-backend.ps1" -ForegroundColor White
Write-Host "   OR" -ForegroundColor White
Write-Host "   .\quick-deploy.ps1" -ForegroundColor White
Write-Host ""
Write-Host "4. Check deployment:" -ForegroundColor Yellow
Write-Host "   .\check-deployment.ps1" -ForegroundColor White
Write-Host ""
Write-Host "5. For GitHub Actions CI/CD:" -ForegroundColor Yellow
Write-Host "   - Set up GitHub Secrets (HEROKU_API_KEY, HEROKU_APP_NAME, HEROKU_EMAIL)" -ForegroundColor White
Write-Host "   - Push to main branch for automatic deployment" -ForegroundColor White

Write-Host "`nSetup completed! Check DEPLOYMENT.md for detailed instructions." -ForegroundColor Green
