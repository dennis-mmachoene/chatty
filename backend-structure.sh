#!/bin/bash

# Base directory
BASE_DIR="server"

echo "Creating project structure..."

# Create directories
mkdir -p $BASE_DIR/src/config
mkdir -p $BASE_DIR/src/controllers
mkdir -p $BASE_DIR/src/middleware
mkdir -p $BASE_DIR/src/routes
mkdir -p $BASE_DIR/src/services
mkdir -p $BASE_DIR/src/utils
mkdir -p $BASE_DIR/src/websocket
mkdir -p $BASE_DIR/tests/unit/services
mkdir -p $BASE_DIR/tests/unit/utils
mkdir -p $BASE_DIR/tests/integration
mkdir -p $BASE_DIR/database/migrations
mkdir -p $BASE_DIR/.github/workflows

# Create files inside src/config
touch $BASE_DIR/src/config/{constants.js,database.js,redis.js,email.js,storage.js}

# Create controllers
touch $BASE_DIR/src/controllers/{auth.controller.js,user.controller.js,contact.controller.js,chat.controller.js,media.controller.js,status.controller.js,call.controller.js}

# Middleware
touch $BASE_DIR/src/middleware/{auth.middleware.js,validation.middleware.js,ratelimit.middleware.js,upload.middleware.js,error.middleware.js,cors.middleware.js,security.middleware.js,logging.middleware.js,conversation.middleware.js}

# Routes
touch $BASE_DIR/src/routes/{auth.routes.js,user.routes.js,contact.routes.js,chat.routes.js,media.routes.js,status.routes.js,call.routes.js,index.js}

# Services
touch $BASE_DIR/src/services/{auth.service.js,token.service.js,email.service.js,user.service.js,contact.service.js,conversation.service.js,message.service.js,media.service.js,status.service.js,call.service.js,webrtc.service.js,presence.service.js,notification.service.js}

# Utils
touch $BASE_DIR/src/utils/{logger.js,errors.js,validators.js,encryption.js,helpers.js,ffmpeg.js,qrcode.js,sanitizer.js}

# Websocket handlers
touch $BASE_DIR/src/websocket/{index.js,chat.handler.js,call.handler.js,presence.handler.js}

# App & server files
touch $BASE_DIR/src/{app.js,server.js}

# Tests
touch $BASE_DIR/tests/setup.js
touch $BASE_DIR/tests/unit/services/{auth.service.test.js,token.service.test.js}
touch $BASE_DIR/tests/unit/utils/encryption.test.js
touch $BASE_DIR/tests/integration/{auth.test.js,user.test.js,chat.test.js}

# Database
touch $BASE_DIR/database/migrations/001_initial_schema.sql
touch $BASE_DIR/database/policies.sql

# CI/CD
touch $BASE_DIR/.github/workflows/ci.yml

# Root files
touch $BASE_DIR/{Dockerfile,docker-compose.yml,docker-compose.dev.yml,.env.example,.eslintrc.js,.prettierrc,jest.config.js,README.md}

echo "Structure created successfully!"
