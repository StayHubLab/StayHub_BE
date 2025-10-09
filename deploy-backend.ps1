# Complete Backend Deployment Script for StayHub
Write-Host "Starting StayHub Backend Deployment..." -ForegroundColor Green

# Check if Heroku CLI is installed
try {
    $herokuVersion = heroku --version
    Write-Host "Heroku CLI found: $herokuVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Heroku CLI is not installed. Please install it from https://devcenter.heroku.com/articles/heroku-cli" -ForegroundColor Red
    exit 1
}

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "Error: Not in a git repository. Please run 'git init' first." -ForegroundColor Red
    exit 1
}

# Check if Heroku remote exists
$herokuRemote = git remote -v | Select-String "heroku"
if (-not $herokuRemote) {
    Write-Host "Warning: No Heroku remote found. You may need to add it manually:" -ForegroundColor Yellow
    Write-Host "git remote add heroku https://git.heroku.com/your-app-name.git" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or create a new Heroku app:" -ForegroundColor Yellow
    Write-Host "heroku create your-app-name" -ForegroundColor Yellow
    exit 1
}

# 1. Install dependencies
Write-Host "Step 1: Installing dependencies..." -ForegroundColor Yellow
npm install

# 2. Run linting (optional but recommended)
Write-Host "Step 2: Running code quality checks..." -ForegroundColor Yellow
try {
    npm run lint
    Write-Host "Linting passed!" -ForegroundColor Green
} catch {
    Write-Host "Warning: Linting failed, but continuing deployment..." -ForegroundColor Yellow
}

# 3. Add and commit changes
Write-Host "Step 3: Committing changes..." -ForegroundColor Yellow
git add .
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if (-not $commitMessage) {
    $commitMessage = "Deploy to Heroku - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}
git commit -m $commitMessage

# 4. Deploy to Heroku
Write-Host "Step 4: Deploying to Heroku..." -ForegroundColor Yellow
Write-Host "Pushing to Heroku main branch..." -ForegroundColor Cyan

try {
    git push heroku main
    Write-Host "Deployment successful!" -ForegroundColor Green
} catch {
    Write-Host "Deployment failed. Check the error messages above." -ForegroundColor Red
    Write-Host "Common solutions:" -ForegroundColor Yellow
    Write-Host "1. Make sure your Heroku app exists: heroku apps" -ForegroundColor Yellow
    Write-Host "2. Check your git remote: git remote -v" -ForegroundColor Yellow
    Write-Host "3. Verify your branch name: git branch" -ForegroundColor Yellow
    exit 1
}

# 5. Check deployment status
Write-Host "Step 5: Checking deployment status..." -ForegroundColor Yellow
try {
    $appName = (git remote get-url heroku) -replace "https://git.heroku.com/", "" -replace ".git", ""
    Write-Host "Checking logs for app: $appName" -ForegroundColor Cyan
    heroku logs --tail --app $appName | Select-Object -First 20
} catch {
    Write-Host "Could not retrieve logs. Check your Heroku dashboard." -ForegroundColor Yellow
}

# 6. Open the deployed app
Write-Host "Step 6: Opening deployed application..." -ForegroundColor Yellow
try {
    $appName = (git remote get-url heroku) -replace "https://git.heroku.com/", "" -replace ".git", ""
    $appUrl = "https://$appName.herokuapp.com"
    Write-Host "Backend URL: $appUrl" -ForegroundColor Cyan
    Write-Host "Health check: $appUrl/health" -ForegroundColor Cyan
    Write-Host "Opening application in browser..." -ForegroundColor Cyan
    Start-Process $appUrl
} catch {
    Write-Host "Could not open browser automatically." -ForegroundColor Yellow
    Write-Host "Please visit your Heroku dashboard to get the app URL." -ForegroundColor Yellow
}

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Remember to configure your environment variables in Heroku dashboard:" -ForegroundColor Yellow
Write-Host "heroku config:set NODE_ENV=production --app your-app-name" -ForegroundColor Yellow
Write-Host "heroku config:set MONGODB_URI=your-mongodb-uri --app your-app-name" -ForegroundColor Yellow
Write-Host "heroku config:set JWT_SECRET=your-jwt-secret --app your-app-name" -ForegroundColor Yellow
Write-Host "And other environment variables as needed." -ForegroundColor Yellow
