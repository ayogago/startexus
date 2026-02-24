# BusinessHub - Online Business Marketplace

A modern, full-stack web application for buying and selling online businesses, built with Next.js 14, TypeScript, and PostgreSQL. This Flippa-like platform enables entrepreneurs to list SaaS, ecommerce, content sites, and mobile apps for sale while providing buyers with powerful search and communication tools.

![BusinessHub Screenshot](https://via.placeholder.com/800x400?text=BusinessHub+Screenshot)

## 🚀 Features

### For Sellers
- **Multi-step listing creation** with autosave functionality
- **Rich business profiles** with financials, traffic, and technical details
- **Image gallery** support for showcasing businesses
- **Confidential listings** to protect sensitive information
- **Message management** with buyers through integrated inbox
- **Analytics dashboard** showing views and engagement

### For Buyers
- **Advanced search and filtering** by business type, price, revenue, etc.
- **Save listings** for later review
- **Direct messaging** with sellers
- **Detailed business information** including metrics and growth opportunities

### For Admins
- **Moderation dashboard** for approving/rejecting listings
- **User management** with verification and disable capabilities
- **Report system** for handling abuse and flagged content
- **Comprehensive analytics** and oversight tools

### Technical Features
- **Passwordless authentication** via email magic links
- **Real-time messaging** system with thread management
- **Responsive design** that works on all devices
- **SEO optimized** with proper meta tags and structure
- **Type-safe** with full TypeScript coverage
- **Database-driven** with proper indexing and relationships

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with email providers
- **Styling**: Tailwind CSS with shadcn/ui components
- **Deployment**: Docker with Docker Compose
- **Email**: SMTP-based magic link authentication

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+ (or use Docker)
- SMTP email server (Gmail, SendGrid, etc.)
- Git

## 🚀 Quick Start

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/businesshub.git
   cd businesshub
   ```

2. **Run the deployment script**
   ```bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```

3. **Configure environment variables**
   Edit the `.env` file with your settings:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/flippa_mvp"
   NEXTAUTH_SECRET="your-secret-key-here"
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_USER="your-email@gmail.com"
   EMAIL_SERVER_PASSWORD="your-app-password"
   EMAIL_FROM="noreply@yourdomain.com"
   ```

4. **Access the application**
   - Visit http://localhost:3000
   - Use the admin email you created to sign in

### Option 2: Local Development

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/yourusername/businesshub.git
   cd businesshub
   npm install
   ```

2. **Set up the database**
   ```bash
   # Start PostgreSQL (via Docker)
   docker-compose -f docker-compose.dev.yml up -d db

   # Or install PostgreSQL locally and create database
   createdb flippa_mvp_dev
   ```

3. **Configure environment**
   ```bash
   cp .env.sample .env
   # Edit .env with your settings
   ```

4. **Run database migrations and seed**
   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Create an admin user**
   ```bash
   npm run create-admin admin@example.com
   ```

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema with the following key models:

- **Users**: Authentication and profile management with roles (BUYER, SELLER, ADMIN)
- **Listings**: Business listings with detailed financials and metadata
- **Messages/Threads**: 1:1 messaging system between buyers and sellers
- **SavedListings**: User favorites and watchlists
- **Reports**: Content moderation and abuse reporting
- **ListingImages**: Image gallery support for business listings

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `NEXTAUTH_URL` | Application URL | Yes | http://localhost:3000 |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | Yes | - |
| `EMAIL_SERVER_HOST` | SMTP server hostname | Yes | - |
| `EMAIL_SERVER_PORT` | SMTP server port | Yes | 587 |
| `EMAIL_SERVER_USER` | SMTP username | Yes | - |
| `EMAIL_SERVER_PASSWORD` | SMTP password | Yes | - |
| `EMAIL_FROM` | From email address | Yes | - |

### Email Configuration

For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password as `EMAIL_SERVER_PASSWORD`

## 🗄️ Database Management

### Migrations
```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Deploy migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Seeding
```bash
# Seed with sample data
npm run db:seed

# Create admin user
npm run create-admin admin@example.com

# Reindex listing slugs
npm run reindex-slugs
```

### Database Studio
```bash
# Open Prisma Studio
npx prisma studio
```

## 🚀 Deployment

### Docker Production Deployment

1. **Build and deploy**
   ```bash
   docker-compose up -d --build
   ```

2. **Run migrations**
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

3. **Create admin user**
   ```bash
   docker-compose exec app npm run create-admin admin@yourdomain.com
   ```

### Manual Production Setup

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   export NODE_ENV=production
   export DATABASE_URL="your-production-db-url"
   # ... other env vars
   ```

3. **Run migrations and start**
   ```bash
   npx prisma migrate deploy
   npm start
   ```

## 📝 API Documentation

### Public Endpoints
- `GET /api/listings` - List published businesses with filtering
- `GET /api/listings/[slug]` - Get business details

### Authenticated Endpoints
- `POST /api/listings` - Create new business listing
- `POST /api/save` - Save/unsave business listings
- `GET /api/threads` - Get user's message threads
- `POST /api/threads` - Create new message thread
- `POST /api/threads/[id]/messages` - Send message

### Admin Endpoints
- `GET /api/admin/listings` - Get listings for moderation
- `PATCH /api/admin/listings/[id]` - Approve/reject listings
- `GET /api/admin/users` - Get users for management
- `PATCH /api/admin/users/[id]` - Manage user accounts

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Type Checking
```bash
npm run type-check
```

## 🔒 Security Features

- **Input validation** with Zod schemas
- **SQL injection protection** via Prisma ORM
- **XSS protection** with proper input sanitization
- **CSRF protection** with NextAuth.js
- **Rate limiting** on sensitive endpoints
- **Email verification** for user accounts
- **Role-based access control** (RBAC)

## 🎨 UI Components

Built with shadcn/ui components for consistency and accessibility:

- Responsive design with mobile-first approach
- Dark mode support (can be enabled)
- Accessible form controls and navigation
- Loading states and error handling
- Toast notifications for user feedback

## 📱 Mobile Support

- Fully responsive design
- Touch-friendly interface
- Mobile-optimized navigation
- Progressive Web App (PWA) ready

## 🔄 State Management

- Server-side state with Next.js App Router
- Client-side state with React hooks
- Form state management with React Hook Form
- Real-time updates via API polling

## 📈 Performance

- **Server-side rendering** for better SEO and performance
- **Image optimization** with Next.js Image component
- **Database indexing** for fast queries
- **Connection pooling** with Prisma
- **Caching strategies** for static content

## 🛣️ Roadmap

### Phase 1 (Current)
- ✅ Core marketplace functionality
- ✅ User authentication and profiles
- ✅ Listing creation and management
- ✅ Messaging system
- ✅ Admin moderation tools

### Phase 2 (Planned)
- [ ] Payment integration (Stripe)
- [ ] Escrow service
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] API rate limiting
- [ ] Advanced search with Elasticsearch

### Phase 3 (Future)
- [ ] Auction functionality
- [ ] Due diligence tools
- [ ] Professional services marketplace
- [ ] Multi-language support
- [ ] Advanced reporting and insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Prisma](https://prisma.io/) for the excellent ORM
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for rapid styling
- [NextAuth.js](https://next-auth.js.org/) for authentication

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: [GitHub Issues](https://github.com/yourusername/businesshub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/businesshub/discussions)
- **Email**: support@yourdomain.com

## 🔍 Troubleshooting

### Common Issues

**Database connection fails**
```bash
# Check if PostgreSQL is running
docker-compose logs db

# Verify connection string in .env
echo $DATABASE_URL
```

**Magic link emails not sending**
```bash
# Check email configuration
echo $EMAIL_SERVER_HOST
echo $EMAIL_SERVER_USER

# Test email credentials
```

**Build errors**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Prisma issues**
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (development)
npx prisma migrate reset
```

---

**Built with ❤️ for the entrepreneurial community**