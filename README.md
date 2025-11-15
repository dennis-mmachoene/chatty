# WhatsApp Clone - Production Ready Chat Application

[![CI/CD](https://github.com/yourusername/whatsapp-clone/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/whatsapp-clone/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A chat application built with modern technologies, featuring real-time messaging, voice/video calls, statuses, and more.

## Features

### Authentication & Security
- Email + OTP authentication (no passwords)
- JWT access tokens (15min) + rotating refresh tokens
- Rate limiting and request throttling
- HTTPS enforcement with HSTS headers
- Input validation and XSS prevention

### Messaging
- Real-time one-to-one and group chats
- Text, emoji, images, videos, files, voice notes
- Message reactions, replies, edit, and delete
- Read receipts (delivered/read status)
- Offline support with message queuing
- Typing indicators and online presence

### Media & Storage
- Supabase Storage with presigned URLs
- Image compression and video transcoding
- Thumbnail generation
- Chunked uploads for large files (>5MB)
- Progress tracking and upload cancellation

### Calls (WebRTC)
- Peer-to-peer voice and video calls
- STUN/TURN server support for NAT traversal
- Call controls: mute, camera toggle, speaker selection
- Group calls support (SFU architecture)

### Statuses
- 24-hour ephemeral stories (images/videos/text)
- Swipe navigation with progress bars
- Visible only to contacts

### Privacy & Settings
- Dark/Light mode with persistence
- Privacy controls (last seen, profile visibility)
- Account data export (GDPR compliant)
- Account deletion
- Block and report users

## Architecture

### Tech Stack

**Frontend:**
- React 18+ (Create React App)
- Tailwind CSS v3
- Framer Motion (animations)
- IndexedDB (offline cache)

**Backend:**
- Node.js (LTS) + Express
- Supabase (PostgreSQL + Realtime)
- WebRTC signaling server
- FFmpeg (media processing)

**Infrastructure:**
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- Sentry (error tracking)
- Prometheus (metrics)

## Prerequisites

- Node.js 18+ (LTS)
- Docker & Docker Compose
- Supabase account
- SendGrid/AWS SES (email delivery)

## Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/whatsapp-clone.git
cd whatsapp-clone
```

### 2. Environment Configuration

Create `.env` files in both `client` and `server` directories:

**client/.env:**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_VAPID_PUBLIC_KEY=your_vapid_public_key
```

**server/.env:**
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=your_supabase_postgres_url
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
REDIS_URL=redis://localhost:6379
TURN_SERVER_URL=turn:your-turn-server.com:3478
TURN_USERNAME=your_turn_username
TURN_CREDENTIAL=your_turn_credential
SENTRY_DSN=your_sentry_dsn
```

### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### 4. Database Setup

Run Supabase migrations:

```bash
cd server
npm run migrate
```

### 5. Start Development Environment

Using Docker Compose (recommended):

```bash
docker-compose up -d
```

Or run services individually:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Testing

### Run All Tests

```bash
npm test
```

### Unit Tests

```bash
# Frontend
cd client && npm test

# Backend
cd server && npm test
```

### E2E Tests

```bash
cd client && npm run test:e2e
```

### Load Testing

```bash
cd server && npm run test:load
```

## Deployment

### Docker Production Build

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

1. Build frontend:
```bash
cd client && npm run build
```

2. Deploy backend:
```bash
cd server && npm run build
npm start
```

### CI/CD

The project includes GitHub Actions workflows for:
- Linting and testing on PR
- Building Docker images
- Automated deployment to staging/production

## Project Structure

```
whatsapp-clone/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # Context providers
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   └── App.js
│   ├── Dockerfile
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utility functions
│   │   └── server.js
│   ├── migrations/        # Database migrations
│   ├── Dockerfile
│   └── package.json
├── docs/                  # Documentation
├── .github/
│   └── workflows/         # CI/CD workflows
├── docker-compose.yml
└── README.md
```

## Security

- Email OTP authentication with time limits (5 minutes)
- Rate limiting (3 OTPs per hour per email)
- JWT token rotation and refresh
- Input validation with Zod
- XSS and CSRF protection
- Secure media uploads with virus scanning
- HTTPS enforcement
- Security headers (Helmet)

## Performance

- Message pagination (cursor-based)
- CDN for static assets and media
- Redis caching for hot data
- Optimized database indices
- Lazy loading for images and components
- Service workers for offline support

## Compliance

- GDPR compliant (data export & deletion)
- POPIA awareness
- Structured logging with PII redaction
- Audit trails for sensitive operations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Authors

- Dennis Mmachoene Ramra - [GitHub](https://github.com/dennis-mmachoene)

## Acknowledgments

- Supabase for backend infrastructure
- Tailwind CSS for styling
- WebRTC for real-time communications

## Support

For support, email dennism.ramara@gmail.com or open an issue on GitHub.


