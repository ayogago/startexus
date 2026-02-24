# Deployment Guide for startexus.com

## Step 1: Run the deployment script on Windows

1. Open Command Prompt in your project folder
2. Run: `deploy.bat`
3. This will build your app and create a `deploy-package` folder

## Step 2: Upload files to your VPS

### Option A: Using WinSCP (Recommended)
1. Download WinSCP: https://winscp.net/
2. Connect with these settings:
   - Host: `191.101.32.231`
   - Port: `65002`
   - Username: `u571521702`
   - Password: [your password]
3. Navigate to `/var/www/startexus.com/` on the server
4. Upload all contents from your `deploy-package` folder

### Option B: Using Command Line (SCP)
```bash
scp -P 65002 -r deploy-package/* u571521702@191.101.32.231:/var/www/startexus.com/
```

### Option C: Using FileZilla
1. Download FileZilla: https://filezilla-project.org/
2. Connect with SFTP:
   - Host: `191.101.32.231`
   - Port: `65002`
   - Username: `u571521702`
   - Password: [your password]

## Step 3: Setup the server

1. SSH into your server:
   ```bash
   ssh -p 65002 u571521702@191.101.32.231
   ```

2. Navigate to your app directory:
   ```bash
   cd /var/www/startexus.com
   ```

3. Make the setup script executable and run it:
   ```bash
   chmod +x server-setup.sh
   ./server-setup.sh
   ```

## Step 4: Verify deployment

1. Check if PM2 is running your app:
   ```bash
   pm2 status
   ```

2. Check if Nginx is running:
   ```bash
   sudo systemctl status nginx
   ```

3. Test your website:
   - Open browser and go to your server IP or domain
   - Should see your Next.js app running

## Environment Variables

Make sure your `.env` file on the server contains:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://startexus.com"
NEXTAUTH_SECRET="your-secret-key"
```

## Troubleshooting

### If the app won't start:
```bash
pm2 logs startexus
```

### If Nginx has issues:
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### To restart everything:
```bash
pm2 restart startexus
sudo systemctl restart nginx
```

## SSL Certificate (Optional but recommended)

After everything works with HTTP, add SSL:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d startexus.com -d www.startexus.com
```