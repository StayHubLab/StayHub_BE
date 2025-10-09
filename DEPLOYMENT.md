# StayHub Backend Deployment Guide

## Prerequisites

1. **Heroku Account**: Sign up at [heroku.com](https://heroku.com)
2. **Heroku CLI**: Install from [devcenter.heroku.com](https://devcenter.heroku.com/articles/heroku-cli)
3. **Git**: Ensure Git is installed and configured
4. **Node.js**: Version 18 or higher

## Quick Setup

### 1. Create Heroku App

```bash
# Login to Heroku
heroku login

# Create a new app (replace 'your-app-name' with your desired name)
heroku create your-app-name

# Or if you already have an app
heroku git:remote -a your-app-name
```

### 2. Configure Environment Variables

Set up your environment variables in Heroku:

```bash
# Required variables
heroku config:set NODE_ENV=production --app your-app-name
heroku config:set MONGODB_URI=your-mongodb-connection-string --app your-app-name
heroku config:set JWT_SECRET=your-super-secret-jwt-key --app your-app-name

# Optional but recommended
heroku config:set CORS_ORIGIN=https://your-frontend-domain.com --app your-app-name

# Email configuration (if using email features)
heroku config:set EMAIL_HOST=smtp.gmail.com --app your-app-name
heroku config:set EMAIL_PORT=587 --app your-app-name
heroku config:set EMAIL_USER=your-email@gmail.com --app your-app-name
heroku config:set EMAIL_PASS=your-app-password --app your-app-name

# Cloudinary configuration (if using image upload)
heroku config:set CLOUDINARY_CLOUD_NAME=your-cloud-name --app your-app-name
heroku config:set CLOUDINARY_API_KEY=your-api-key --app your-app-name
heroku config:set CLOUDINARY_API_SECRET=your-api-secret --app your-app-name
```

### 3. Deploy

#### Option A: Using PowerShell Scripts

```powershell
# Full deployment with checks
.\deploy-backend.ps1

# Quick deployment
.\quick-deploy.ps1
```

#### Option B: Manual Deployment

```bash
# Add and commit changes
git add .
git commit -m "Deploy to Heroku"

# Push to Heroku
git push heroku main
```

#### Option C: GitHub Actions (Automatic)

1. Set up GitHub Secrets:
   - `HEROKU_API_KEY`: Your Heroku API key
   - `HEROKU_APP_NAME`: Your Heroku app name
   - `HEROKU_EMAIL`: Your Heroku email

2. Push to main branch - deployment will happen automatically

## Verification

After deployment, verify your app is working:

```bash
# Check app status
heroku ps --app your-app-name

# View logs
heroku logs --tail --app your-app-name

# Test health endpoint
curl https://your-app-name.herokuapp.com/health
```

## Database Setup

### MongoDB Atlas (Recommended)

1. Create a cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Get your connection string
3. Set it as `MONGODB_URI` in Heroku config

### Local MongoDB (Development only)

```bash
# Install MongoDB locally
# Then use: mongodb://localhost:27017/stayhub
```

## Troubleshooting

### Common Issues

1. **Build Fails**: Check Node.js version in `package.json`
2. **App Crashes**: Check logs with `heroku logs --tail`
3. **Environment Variables**: Verify all required vars are set
4. **Database Connection**: Ensure MongoDB URI is correct

### Useful Commands

```bash
# Restart app
heroku restart --app your-app-name

# Scale dynos
heroku ps:scale web=1 --app your-app-name

# Open app in browser
heroku open --app your-app-name

# Access Heroku shell
heroku run bash --app your-app-name
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | No | Heroku sets this automatically |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT tokens |
| `CORS_ORIGIN` | No | Frontend domain for CORS |
| `EMAIL_*` | No | Email service configuration |
| `CLOUDINARY_*` | No | Image upload service |
| `GOOGLE_*` | No | Google OAuth configuration |
| `VNPAY_*` | No | VNPay payment configuration |

## Security Notes

- Never commit `.env` files to Git
- Use strong, unique secrets for production
- Regularly rotate your API keys
- Monitor your app logs for suspicious activity
- Keep your dependencies updated

## Scaling

For production traffic:

```bash
# Scale to multiple dynos
heroku ps:scale web=2 --app your-app-name

# Add monitoring
heroku addons:create newrelic:wayne --app your-app-name
```

## Support

If you encounter issues:

1. Check the [Heroku Dev Center](https://devcenter.heroku.com/)
2. Review the app logs: `heroku logs --tail --app your-app-name`
3. Check the GitHub Actions logs if using CI/CD
