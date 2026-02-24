# Claude Code Configuration

## Deployment Rules

### Port Configuration
- **NEVER change port 3000** - The application must always run on port 3000
- nginx is configured to proxy to localhost:3000
- Changing this port will break the production deployment
- Port is hardcoded in:
  - `package.json` scripts (dev and start use `-p 3000`)
  - `.env` file (`PORT=3000`)
  - PM2 configuration

### Commands
- Build: `npm run build`
- Start production: `npm start`
- Development: `npm run dev`
- Database push: `npx prisma db push`

### Critical Files
- nginx config: `/etc/nginx/sites-available/startexus.com`
- Environment: `/var/www/startexus.com/.env`
- Database: `/var/www/startexus.com/dev.db`