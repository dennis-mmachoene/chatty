<!-- # ============================================
# FILE: README.md
# ============================================ -->
# Chat Platform Backend

Chatty platform backend built with Node.js, Express, Supabase, and WebSocket.

## Features

- **Authentication**: Email-based OTP login with JWT tokens
- **Real-time Messaging**: WebSocket support with Socket.IO
- **Media Handling**: Image, video, and audio upload with compression
- **Voice & Video Calls**: WebRTC implementation with STUN/TURN
- **Status/Stories**: 24-hour ephemeral content
- **Contact Management**: Friend requests and blocking
- **Security**: Rate limiting, input validation, CORS, Helmet
- **Testing**: Comprehensive test coverage
- **Docker**: Full containerization support
- **CI/CD**: GitHub Actions pipeline

## Prerequisites

- Node.js >= 18.0.0
- Redis
- Supabase account
- FFmpeg (for media processing)
- SMTP server (Gmail recommended)

## Installation

### 1. Clone the repository
```
git clone https://github.com/dennis-mmachoene/chatty.git
cd chatty/server
```

### 2. Install dependencies
```
npm install
```

### 3. Environment setup
```
cp .env.example .env
# Edit .env with your configuration
```

### 4. Database setup
```
# Run migrations on Supabase
psql $DATABASE_URL < ../database/migrations/001_initial_schema.sql
psql $DATABASE_URL < ../database/policies.sql
```

### 5. Start development server
```
npm run dev
```

## Docker Deployment

### Development
```
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Production
```
docker-compose up -d
```

## Testing

```
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- auth.service.test.js

# Watch mode
npm run test:watch
```

## API Documentation

### Base URL
```
Development: http://localhost:5000/api
```

### Authentication Endpoints

#### Request OTP
```
POST /api/auth/request-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Verify OTP
```
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

#### Refresh Token
```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### User Endpoints

#### Get Profile
```
GET /api/users/profile
Authorization: Bearer {token}
```

#### Update Profile
```
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "displayName": "John Doe",
  "statusMessage": "Hello World"
}
```

### Chat Endpoints

#### Get Conversations
```
GET /api/chats/conversations
Authorization: Bearer {token}
```

#### Send Message
```
POST /api/chats/conversations/:conversationId/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "text",
  "content": "Hello!"
}
```

## Security Features

- **Rate Limiting**: Prevents abuse
- **Input Validation**: Zod schema validation
- **XSS Protection**: Sanitization middleware
- **CSRF Protection**: Enabled for state-changing operations
- **Helmet**: Security headers
- **JWT**: Secure token-based authentication
- **Password Hashing**: Bcrypt with configurable rounds
- **SQL Injection Protection**: Parameterized queries via Supabase
- **Row Level Security**: Database-level access control

## Monitoring

### Health Check
```
GET /health
```

### Readiness Check
```
GET /ready
```

### Metrics
Integration with Sentry for error tracking and performance monitoring.

## Architecture

```
server/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── websocket/       # WebSocket handlers
│   ├── app.js           # Express app
│   └── server.js        # Entry point
├── tests/               # Test files
├── Dockerfile           # Docker configuration
└── package.json         # Dependencies
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Yes |
| `REDIS_HOST` | Redis host | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `SMTP_USER` | Email service username | Yes |
| `SMTP_PASSWORD` | Email service password | Yes |

See `.env.example` for complete list.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Email: dennism.ramara@gmail.com

## Acknowledgments

- Supabase for database and real-time
- Socket.IO for WebSocket
- Express.js for web framework
- All open-source contributors
```