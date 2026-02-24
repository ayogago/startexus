# BusinessHub Deployment Script for Windows
# This script sets up and deploys the Business Hub application

Write-Host "🚀 Business Hub Deployment Script" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "📝 .env file not found. Using default configuration..." -ForegroundColor Yellow
    Write-Host "⚠️  For email functionality, please edit .env file with your SMTP settings" -ForegroundColor Yellow
}

# Build and start services
Write-Host "🏗️  Building and starting services..." -ForegroundColor Blue
docker-compose up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start services" -ForegroundColor Red
    exit 1
}

# Wait for database to be ready
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Run database migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Blue
docker-compose exec -T app npx prisma migrate deploy

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Blue
docker-compose exec -T app npx prisma generate

# Seed the database
$seedChoice = Read-Host "🌱 Do you want to seed the database with sample data? (y/N)"
if ($seedChoice -eq "y" -or $seedChoice -eq "Y") {
    Write-Host "🌱 Seeding database..." -ForegroundColor Green
    docker-compose exec -T app npm run db:seed
}

# Create admin user
$adminChoice = Read-Host "👤 Do you want to create an admin user? (y/N)"
if ($adminChoice -eq "y" -or $adminChoice -eq "Y") {
    $adminEmail = Read-Host "Enter admin email"
    docker-compose exec -T app npm run create-admin $adminEmail
}

Write-Host ""
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your application is running at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🗄️  Database is available at: localhost:5432" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Visit http://localhost:3000 to see your application" -ForegroundColor White
Write-Host "   2. Sign in with the admin email to access admin features" -ForegroundColor White
Write-Host "   3. Configure your email settings in .env for magic links" -ForegroundColor White
Write-Host ""
Write-Host "🛠️  Useful commands:" -ForegroundColor Yellow
Write-Host "   - View logs: docker-compose logs -f" -ForegroundColor White
Write-Host "   - Stop services: docker-compose down" -ForegroundColor White
Write-Host "   - Restart: docker-compose restart" -ForegroundColor White