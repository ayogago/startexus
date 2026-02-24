#!/bin/bash

# Business Hub Deployment Script
# This script sets up and deploys the Business Hub application

set -e

echo "🚀 Business Hub Deployment Script"
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.sample..."
    cp .env.sample .env
    echo "⚠️  Please edit .env file with your configuration before continuing."
    echo "   Required: DATABASE_URL, NEXTAUTH_SECRET, email settings"
    read -p "Press Enter when you've configured the .env file..."
fi

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy

# Seed the database (optional)
read -p "🌱 Do you want to seed the database with sample data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    docker-compose exec -T app npm run db:seed
fi

# Create admin user
read -p "👤 Do you want to create an admin user? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter admin email: " admin_email
    docker-compose exec -T app npm run create-admin "$admin_email"
fi

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your application is running at: http://localhost:3000"
echo "🗄️  Database is available at: localhost:5432"
echo ""
echo "📋 Next steps:"
echo "   1. Visit http://localhost:3000 to see your application"
echo "   2. Sign in with the admin email to access admin features"
echo "   3. Configure your email settings in .env for magic links"
echo ""
echo "🛠️  Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop services: docker-compose down"
echo "   - Restart: docker-compose restart"
echo "   - Database shell: docker-compose exec db psql -U postgres -d flippa_mvp"