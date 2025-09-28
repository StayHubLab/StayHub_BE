# Deployment Guide

## Prerequisites

- Node.js >= 14.x
- MongoDB >= 4.x
- PM2 (for process management)
- Nginx (for reverse proxy)
- SSL Certificate (for HTTPS)

## Environment Setup

1. Create `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/stayhub

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# File Upload
UPLOAD_PATH=/var/www/stayhub/uploads
MAX_FILE_SIZE=5242880 # 5MB

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

## Production Build

1. Install dependencies:

```bash
npm install --production
```

2. Build the application:

```bash
npm run build
```

3. Start the server using PM2:

```bash
pm2 start ecosystem.config.js
```

## Nginx Configuration

1. Create Nginx configuration file:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /var/www/stayhub/uploads;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

2. Enable and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/stayhub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Security Measures

1. Enable firewall:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

2. Set up SSL with Let's Encrypt:

```bash
sudo certbot --nginx -d your-domain.com
```

3. Configure MongoDB security:

```javascript
// mongod.conf
security: authorization: enabled;
```

## Monitoring

1. Set up PM2 monitoring:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

2. Monitor application:

```bash
pm2 monit
pm2 logs
```

## Backup Strategy

1. Database backup:

```bash
# Daily backup
mongodump --uri="mongodb://localhost:27017/stayhub" --out=/backup/$(date +%Y%m%d)

# Weekly backup
mongodump --uri="mongodb://localhost:27017/stayhub" --out=/backup/weekly/$(date +%Y%m%d)
```

2. File backup:

```bash
# Backup uploads directory
tar -czf /backup/uploads/$(date +%Y%m%d).tar.gz /var/www/stayhub/uploads
```

## Scaling

1. Load Balancing:

```nginx
upstream stayhub {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}
```

2. PM2 Cluster Mode:

```bash
pm2 start ecosystem.config.js -i max
```

## Troubleshooting

1. Check application logs:

```bash
pm2 logs
tail -f /var/log/nginx/error.log
```

2. Check system resources:

```bash
htop
df -h
free -m
```

3. Check MongoDB status:

```bash
mongosh --eval "db.serverStatus()"
```

## Rollback Procedure

1. Stop the application:

```bash
pm2 stop all
```

2. Restore from backup:

```bash
# Restore database
mongorestore --uri="mongodb://localhost:27017/stayhub" /backup/YYYYMMDD

# Restore files
tar -xzf /backup/uploads/YYYYMMDD.tar.gz -C /var/www/stayhub/
```

3. Restart the application:

```bash
pm2 start all
```
