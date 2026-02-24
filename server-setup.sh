#!/bin/bash

echo "🚀 Setting up startexus.com on Hostinger VPS..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "Don't run this script as root. Run as your regular user."
   exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
print_status "Installing PM2 process manager..."
sudo npm install -g pm2

# Create application directory
print_status "Setting up application directory..."
sudo mkdir -p /var/www/startexus.com
sudo chown -R $USER:$USER /var/www/startexus.com

# Navigate to app directory
cd /var/www/startexus.com

print_status "Current directory: $(pwd)"
print_status "Files in directory:"
ls -la

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found! Please upload your files first."
    exit 1
fi

# Install production dependencies
print_status "Installing production dependencies..."
npm install --production

# Setup Prisma
print_status "Setting up database with Prisma..."
npx prisma generate

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. You may need to create one with your database settings."
else
    print_status ".env file found"
fi

# Push database schema (creates database if it doesn't exist)
print_status "Setting up database schema..."
npx prisma db push

# Install Nginx if not already installed
if ! command -v nginx &> /dev/null; then
    print_status "Installing Nginx..."
    sudo apt install -y nginx
fi

# Create Nginx configuration
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/startexus.com > /dev/null <<EOF
server {
    listen 80;
    server_name startexus.com www.startexus.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
print_status "Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/startexus.com /etc/nginx/sites-enabled/

# Remove default site if it exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    print_status "Nginx configuration is valid"
    sudo systemctl reload nginx
else
    print_error "Nginx configuration has errors!"
    exit 1
fi

# Start the application with PM2
print_status "Starting application with PM2..."
pm2 delete startexus 2>/dev/null || true  # Delete if exists
pm2 start npm --name "startexus" -- start

# Configure PM2 to start on boot
print_status "Configuring PM2 startup..."
pm2 startup systemd -u $USER --hp $HOME
pm2 save

# Show status
print_status "Deployment complete! 🎉"
echo
print_status "Application status:"
pm2 status

echo
print_status "Nginx status:"
sudo systemctl status nginx --no-pager -l

echo
print_status "Your site should now be accessible at:"
echo "  http://startexus.com"
echo "  http://www.startexus.com"
echo
print_warning "If you have a domain, make sure it points to this server's IP address"
print_warning "Consider setting up SSL with Let's Encrypt: sudo certbot --nginx"