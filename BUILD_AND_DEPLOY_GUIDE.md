# LekhaFlow - Complete Build and Deployment Guide

**Version**: 1.0  
**Last Updated**: February 11, 2026

---

## Table of Contents

1. [Introduction](#introduction)
2. [System Requirements](#system-requirements)
3. [Architecture Overview](#architecture-overview)
4. [Initial Setup](#initial-setup)
5. [Backend Setup](#backend-setup)
6. [Frontend Setup](#frontend-setup)
7. [Database Setup (Supabase)](#database-setup-supabase)
8. [Running the Application](#running-the-application)
9. [API Documentation](#api-documentation)
10. [WebSocket Documentation](#websocket-documentation)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

---

## Introduction

LekhaFlow is a real-time collaborative canvas application built with:
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Express.js (HTTP), Hocuspocus (WebSocket)
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Yjs CRDT
- **Monorepo**: Turborepo + pnpm

This guide will walk you through setting up the entire system from scratch.

---

## System Requirements

### Required Software

| Software | Minimum Version | Recommended |
|----------|----------------|-------------|
| Node.js | 18.0.0 | 20.x LTS |
| pnpm | 8.0.0 | 10.28.0 |
| Git | 2.30.0 | Latest |
| VS Code | 1.80.0 | Latest |

### System Specifications

- **RAM**: Minimum 8GB, Recommended 16GB
- **Storage**: 2GB free space
- **OS**: Windows 10/11, macOS 12+, Linux (Ubuntu 20.04+)

### Required Accounts

1. **Supabase**: Free tier account (https://supabase.com)
2. **GitHub**: For version control (optional but recommended)

---

## Architecture Overview

```
LekhaFlow/
├── canvas/                          # Main application monorepo
│   ├── apps/
│   │   ├── web/                    # Next.js frontend (Port 3000)
│   │   ├── http-backend/           # Express API server (Port 8000)
│   │   └── ws-backend/             # Hocuspocus WebSocket server (Port 8080)
│   ├── packages/
│   │   ├── common/                 # Shared types and schemas
│   │   ├── config/                 # Environment configuration
│   │   ├── supabase/              # Supabase types
│   │   └── ui/                    # Shared UI components
│   └── package.json
└── README.md
```

### Service Communication

```
┌──────────────┐
│   Browser    │
│  (Port 3000) │
└──────┬───────┘
       │
       ├─── HTTP ────► ┌──────────────────┐
       │               │  HTTP Backend    │
       │               │   (Port 8000)    │
       │               └────────┬─────────┘
       │                        │
       └─── WS ──────► ┌────────▼─────────┐
                       │  WS Backend      │
                       │   (Port 8080)    │
                       └────────┬─────────┘
                                │
                        ┌───────▼──────────┐
                        │    Supabase      │
                        │   (PostgreSQL)   │
                        └──────────────────┘
```

---

## Initial Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/anusanth26/LekhaFlow.git

# Navigate to the canvas directory
cd LekhaFlow/canvas
```

### 2. Install pnpm (if not installed)

**Windows**:
```powershell
# Using npm
npm install -g pnpm

# Or using Chocolatey
choco install pnpm
```

**macOS/Linux**:
```bash
# Using npm
npm install -g pnpm

# Or using curl
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### 3. Install Dependencies

```bash
# From the canvas directory
pnpm install
```

This will install dependencies for all workspaces in the monorepo.

**Expected output**:
```
Packages: +158
Progress: resolved 158, reused 29, downloaded 129, added 157, done
Done in 18.3s
```

---

## Database Setup (Supabase)

### 1. Create a Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in:
   - **Name**: LekhaFlow
   - **Database Password**: (Generate a strong password)
   - **Region**: Choose closest to you
4. Click "Create new project" (takes ~2 minutes)

### 2. Get Your Credentials

Once the project is created:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://[your-project-ref].supabase.co`
   - **anon public key**: `eyJhbG...` (starts with eyJ)
   - **service_role key**: `eyJhbG...` (starts with eyJ)

### 3. Create Database Tables

1. Go to **SQL Editor** in Supabase dashboard
2. Create the following tables:

#### Users Table (Auto-created by Supabase Auth)
Already exists at `auth.users`

#### Canvases Table
```sql
CREATE TABLE public.canvases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data TEXT,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_canvases_owner_id ON public.canvases(owner_id);
CREATE INDEX idx_canvases_slug ON public.canvases(slug);

-- Enable Row Level Security
ALTER TABLE public.canvases ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own canvases
CREATE POLICY "Users can view own canvases"
  ON public.canvases
  FOR SELECT
  USING (auth.uid() = owner_id OR is_public = true);

-- Policy: Users can insert their own canvases
CREATE POLICY "Users can insert own canvases"
  ON public.canvases
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Policy: Users can update their own canvases
CREATE POLICY "Users can update own canvases"
  ON public.canvases
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Policy: Users can delete their own canvases
CREATE POLICY "Users can delete own canvases"
  ON public.canvases
  FOR DELETE
  USING (auth.uid() = owner_id);
```

3. Click **Run** to execute the SQL

### 4. Enable Google OAuth (Optional)

1. Go to **Authentication** → **Providers**
2. Find **Google** and toggle it on
3. Follow the setup instructions to:
   - Create a Google Cloud project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add redirect URL: `https://[your-project-ref].supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase

---

## Backend Setup

### 1. Configure Environment Variables

Create a `.env` file in the `canvas` directory:

```bash
cd canvas
touch .env  # macOS/Linux
# or
New-Item .env  # Windows PowerShell
```

Add the following content (replace with your values):

```env
# Server-side (http-backend & ws-backend)
SUPABASE_URL="https://[your-project-ref].supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJ[your-service-role-key]"
NODE_ENV="development"
WS_PORT="8080"

# Client-side (Next.js web app)
NEXT_PUBLIC_SUPABASE_URL="https://[your-project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJ[your-anon-key]"
NEXT_PUBLIC_WS_URL="ws://localhost:8080"
NEXT_PUBLIC_HTTP_URL="http://localhost:8000"
```

### 2. HTTP Backend Structure

The HTTP backend handles authentication and canvas CRUD operations.

**Location**: `canvas/apps/http-backend/`

**Key Files**:
```
http-backend/
├── src/
│   ├── controller/
│   │   ├── auth.ts          # Authentication handlers
│   │   └── canvas.ts        # Canvas CRUD handlers
│   ├── middleware/
│   │   └── auth.ts          # JWT verification middleware
│   ├── routes/
│   │   ├── auth.ts          # Auth routes
│   │   ├── canvas.ts        # Canvas routes
│   │   └── index.ts         # Route aggregator
│   ├── services/
│   │   └── canvas.ts        # Business logic
│   ├── error/
│   │   └── error.ts         # Error handling
│   ├── supabase.server.ts   # Supabase client
│   └── index.ts             # App entry point
└── package.json
```

### 3. WebSocket Backend Structure

The WebSocket backend handles real-time collaboration using Yjs.

**Location**: `canvas/apps/ws-backend/`

**Key Files**:
```
ws-backend/
├── src/
│   ├── index.ts             # Hocuspocus server
│   ├── env.ts               # Environment loader
│   └── supabase.server.ts   # Supabase client
└── package.json
```

### 4. Build the Backends

```bash
# From the canvas directory
cd apps/http-backend
npm run build

cd ../ws-backend
npm run build
```

---

## Frontend Setup

### 1. Frontend Structure

**Location**: `canvas/apps/web/`

**Key Directories**:
```
web/
├── app/                     # Next.js App Router
│   ├── page.tsx            # Landing page
│   ├── login/              # Login page
│   ├── auth/
│   │   └── callback/       # OAuth callback
│   ├── room/[roomId]/      # Canvas room (legacy)
│   └── canvas/[roomId]/    # Canvas room (new)
├── components/
│   ├── Canvas.tsx          # Main canvas component
│   ├── Dashboard.tsx       # User dashboard
│   ├── Antigravity.tsx     # 3D background
│   ├── canvas/             # Canvas UI components
│   │   ├── Toolbar.tsx
│   │   ├── Header.tsx
│   │   ├── PropertiesPanel.tsx
│   │   ├── HelpPanel.tsx
│   │   ├── ZoomControls.tsx
│   │   ├── ConnectionStatus.tsx
│   │   ├── ContextMenu.tsx
│   │   ├── ExportModal.tsx
│   │   └── CollaboratorCursors.tsx
│   └── ui/                 # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
├── hooks/
│   └── useYjsSync.ts       # Yjs synchronization hook
├── lib/
│   ├── element-utils.ts    # Element manipulation utilities
│   ├── stroke-utils.ts     # Drawing utilities
│   └── supabase.client.ts  # Supabase client
├── store/
│   └── canvas-store.ts     # Zustand state management
├── test/                   # Vitest tests
└── public/
    └── logo.jpg            # LekhaFlow logo
```

### 2. Create .env.local

In addition to the root `.env`, create `canvas/apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL="https://[your-project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJ[your-anon-key]"
NEXT_PUBLIC_WS_URL="ws://localhost:8080"
NEXT_PUBLIC_HTTP_URL="http://localhost:8000"
```

### 3. Build the Frontend

```bash
cd apps/web
npm run build
```

---

## Running the Application

### Option 1: Run All Services Together (Recommended for Development)

From the `canvas` directory:

```bash
# This starts all services concurrently
pnpm dev
```

This will start:
- **Frontend**: http://localhost:3000
- **HTTP Backend**: http://localhost:8000
- **WebSocket Backend**: ws://localhost:8080

### Option 2: Run Services Individually

**Terminal 1 - HTTP Backend**:
```bash
cd canvas/apps/http-backend
npm run dev
```

**Terminal 2 - WebSocket Backend**:
```bash
cd canvas/apps/ws-backend
npm run dev
```

**Terminal 3 - Frontend**:
```bash
cd canvas/apps/web
npm run dev
```

### Verify Services are Running

1. **Frontend**: Open http://localhost:3000 in your browser
2. **HTTP Backend**: 
   ```bash
   curl http://localhost:8000/api/v1/canvas
   # Should return 401 Unauthorized (correct - needs auth)
   ```
3. **WebSocket Backend**: Check terminal output for:
   ```
   Hocuspocus v2.15.3 running at:
   > HTTP: http://0.0.0.0:8080
   > WebSocket: ws://0.0.0.0:8080
   ```

---

## API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication Endpoints

#### 1. Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response (201 Created)**:
```json
{
  "status": "success",
  "message": "User created successfully. Check email for verification.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "user_metadata": {
        "name": "John Doe"
      }
    }
  }
}
```

**Errors**:
- `400`: Validation failed or email already exists
- `500`: Server error

---

#### 2. Sign In
```http
POST /auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Signed in successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Sets Cookie**: `access_token` (HttpOnly, 7 days)

**Errors**:
- `400`: Validation failed
- `401`: Invalid credentials
- `500`: Server error

---

#### 3. Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "User profile",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar_url": "https://..."
    }
  }
}
```

**Errors**:
- `401`: Unauthorized (missing or invalid token)
- `500`: Server error

---

### Canvas Endpoints

#### 1. Create Canvas
```http
POST /canvas/create-canvas
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Awesome Canvas",
  "isPublic": false
}
```

**Response (201 Created)**:
```json
{
  "status": "success",
  "message": "Canvas created successfully",
  "data": {
    "roomId": "uuid-of-canvas",
    "slug": "my-awesome-canvas-xyz"
  }
}
```

**Errors**:
- `400`: Validation failed (missing name)
- `401`: Unauthorized
- `500`: Server error

---

#### 2. Get All Canvases
```http
GET /canvas
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Canvases retrieved successfully",
  "data": {
    "canvases": [
      {
        "id": "uuid",
        "name": "My Canvas",
        "slug": "my-canvas-xyz",
        "owner_id": "user-uuid",
        "thumbnail_url": null,
        "is_public": false,
        "created_at": "2026-02-10T10:00:00Z",
        "updated_at": "2026-02-10T15:30:00Z"
      }
    ]
  }
}
```

**Errors**:
- `401`: Unauthorized
- `500`: Server error

---

#### 3. Get Single Canvas
```http
GET /canvas/:roomId
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Canvas retrieved successfully",
  "data": {
    "canvas": {
      "id": "uuid",
      "name": "My Canvas",
      "slug": "my-canvas-xyz",
      "owner_id": "user-uuid",
      "data": "base64-encoded-yjs-state",
      "thumbnail_url": null,
      "is_public": false,
      "created_at": "2026-02-10T10:00:00Z",
      "updated_at": "2026-02-10T15:30:00Z"
    }
  }
}
```

**Errors**:
- `400`: Room ID missing
- `404`: Canvas not found
- `500`: Server error

---

#### 4. Update Canvas
```http
PUT /canvas/:roomId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Canvas Name",
  "data": "base64-encoded-yjs-state"
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Canvas updated successfully",
  "data": null
}
```

**Errors**:
- `400`: Validation failed or Room ID missing
- `401`: Unauthorized
- `403`: Not canvas owner
- `500`: Server error

---

#### 5. Delete Canvas
```http
DELETE /canvas/:roomId
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Canvas deleted successfully",
  "data": null
}
```

**Errors**:
- `400`: Room ID missing
- `401`: Unauthorized
- `403`: Not canvas owner
- `404`: Canvas not found
- `500`: Server error

---

### Error Response Format

All errors follow this format:

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "statusCode": 400
}
```

---

## WebSocket Documentation

### Connection

```javascript
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';

const doc = new Y.Doc();
const provider = new HocuspocusProvider({
  url: 'ws://localhost:8080',
  name: 'canvas-room-id',
  document: doc,
  token: 'user-jwt-token',
});
```

### Events

#### Connected
```javascript
provider.on('status', ({ status }) => {
  if (status === 'connected') {
    console.log('Connected to WebSocket server');
  }
});
```

#### Synced
```javascript
provider.on('synced', () => {
  console.log('Document synchronized');
});
```

#### Awareness Changes
```javascript
provider.awareness.on('change', () => {
  const states = provider.awareness.getStates();
  // Handle collaborator cursor updates
});
```

### Document Structure

Yjs document structure for canvas:

```javascript
const yElements = doc.getMap('elements');    // Canvas elements
const yHistory = doc.getArray('history');    // Undo/redo history
const yMetadata = doc.getMap('metadata');    // Canvas metadata

// Add element
yElements.set('element-id', {
  id: 'element-id',
  type: 'rectangle',
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  // ... other properties
});

// Get all elements
const elements = Object.fromEntries(yElements.entries());
```

### Awareness (Cursors)

```javascript
// Set local user info
provider.awareness.setLocalStateField('user', {
  name: 'John Doe',
  color: '#FF5733',
  cursor: { x: 100, y: 200 },
});

// Get all users
const users = Array.from(provider.awareness.getStates().values());
```

---

## Testing

### Run All Tests

```bash
# From canvas directory
pnpm test
```

### Run Specific Tests

**Frontend Tests**:
```bash
cd apps/web
npm run test
```

**Backend Tests**:
```bash
cd apps/http-backend
npm run test

cd apps/ws-backend
npm run test
```

### Test Coverage

```bash
cd apps/web
npm run test -- --coverage
```

### Writing Tests

Tests use Vitest. Example:

```typescript
// apps/web/test/example.test.ts
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
  it('should work correctly', () => {
    expect(1 + 1).toBe(2);
  });
});
```

---

## Deployment

### Frontend (Vercel - Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd apps/web
   vercel
   ```

4. **Set Environment Variables** in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_WS_URL` (your production WS URL)
   - `NEXT_PUBLIC_HTTP_URL` (your production API URL)

### HTTP Backend (Railway/Render)

**Railway**:
1. Go to https://railway.app
2. Create new project → Deploy from GitHub
3. Select `apps/http-backend`
4. Add environment variables
5. Set start command: `node dist/index.js`

**Render**:
1. Go to https://render.com
2. New Web Service → Connect Repository
3. Build command: `cd canvas/apps/http-backend && npm install && npm run build`
4. Start command: `cd canvas/apps/http-backend && npm start`

### WebSocket Backend (Railway/Render)

Same process as HTTP backend, but for `apps/ws-backend`.

**Important**: Ensure WebSocket support is enabled in hosting provider.

### Database

Your Supabase database is already hosted. No additional deployment needed.

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

---

#### 2. Module Not Found

**Error**: `Cannot find module '@repo/common'`

**Solution**:
```bash
# Re-install dependencies
pnpm install

# Rebuild packages
cd packages/common
npm run build
```

---

#### 3. Environment Variables Not Loading

**Error**: `Client environment variable NEXT_PUBLIC_WS_URL is not set`

**Solution**:
1. Check `.env` file exists in `canvas/` directory
2. Check `.env.local` exists in `canvas/apps/web/`
3. Restart all servers after changing env vars
4. Verify no typos in variable names

---

#### 4. Supabase Connection Error

**Error**: `Invalid Supabase URL`

**Solution**:
1. Verify URL format: `https://[project-ref].supabase.co`
2. Check API keys are correct (not swapped)
3. Ensure project is not paused in Supabase dashboard

---

#### 5. WebSocket Connection Failed

**Error**: `WebSocket connection to 'ws://localhost:8080' failed`

**Solution**:
1. Ensure WS backend is running (check terminal)
2. Verify port 8080 is not blocked by firewall
3. Check `NEXT_PUBLIC_WS_URL` matches WS backend port

---

#### 6. Authentication Errors

**Error**: `401 Unauthorized`

**Solution**:
1. Verify user is logged in
2. Check token is being sent in Authorization header
3. Ensure token hasn't expired (7 day expiry)
4. Clear cookies and login again

---

#### 7. Build Errors

**Error**: `Module build failed: TypeScript error`

**Solution**:
```bash
# Check TypeScript errors
cd apps/web
npx tsc --noEmit

# Fix errors and rebuild
npm run build
```

---

### Getting Help

1. **Check Logs**: Always check terminal output for error messages
2. **Browser Console**: Open DevTools (F12) → Console for frontend errors
3. **Network Tab**: Check API requests/responses in DevTools → Network
4. **GitHub Issues**: Search or create issue at https://github.com/anusanth26/LekhaFlow/issues

---

## Development Workflow

### 1. Creating a New Feature

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
# ...

# Test
pnpm test

# Lint
pnpm lint

# Commit
git add .
git commit -m "feat: add my feature"

# Push
git push origin feature/my-feature
```

### 2. Code Style

The project uses Biome for formatting and linting:

```bash
# Format code
pnpm format

# Check code
pnpm check

# Fix auto-fixable issues
pnpm check --write
```

### 3. Pre-commit Hooks

Husky runs checks before each commit:
- Linting
- Formatting
- Type checking

If checks fail, fix errors before committing.

---

## Performance Optimization

### Frontend

1. **Use Production Build**:
   ```bash
   npm run build
   npm run start
   ```

2. **Enable Caching**: Next.js automatically caches builds

3. **Optimize Images**: Use Next.js Image component

### Backend

1. **Connection Pooling**: Supabase handles this automatically

2. **Rate Limiting**: Add middleware for API rate limiting

3. **Compression**: Enable gzip compression in Express:
   ```typescript
   import compression from 'compression';
   app.use(compression());
   ```

---

## Security Best Practices

1. **Never commit `.env` files**
2. **Use HttpOnly cookies** for auth tokens ✅ (already implemented)
3. **Enable CORS** only for trusted origins
4. **Validate all inputs** ✅ (Zod validation implemented)
5. **Use Row Level Security** in Supabase ✅ (RLS policies configured)
6. **Keep dependencies updated**: `pnpm update --latest`

---

## Monitoring and Logging

### Frontend

- **Vercel Analytics**: Automatically enabled on Vercel
- **Console Logs**: Check browser console for errors

### Backend

- **Logging**: Add structured logging with Winston or Pino
- **Error Tracking**: Integrate Sentry for error monitoring
- **Health Checks**: Add `/health` endpoint

Example health check:
```typescript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

---

## Appendix

### A. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| V | Select tool |
| H | Hand tool (pan) |
| P | Pen tool |
| R | Rectangle |
| O | Ellipse |
| D | Diamond |
| L | Line |
| A | Arrow |
| T | Text |
| E | Eraser |
| K | Laser pointer |
| Del/Backspace | Delete selected |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |
| Ctrl+A | Select all |
| Ctrl+D | Duplicate |
| Esc | Clear selection |
| Shift+Drag | Proportional resize |
| Alt+Drag | Resize from center |
| Ctrl+Scroll | Zoom |

### B. Database Schema

```sql
-- Canvases Table
CREATE TABLE public.canvases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data TEXT,                    -- Base64 encoded Yjs state
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users (managed by Supabase Auth)
-- Located in auth.users table
-- Columns: id, email, encrypted_password, email_confirmed_at, etc.
```

### C. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16 | React framework |
| UI | Tailwind CSS | Styling |
| Canvas | Konva.js | 2D canvas rendering |
| 3D | Three.js | Background effects |
| State | Zustand | State management |
| Real-time | Yjs | CRDT for collaboration |
| WebSocket | Hocuspocus | WS server |
| HTTP API | Express.js | REST API |
| Database | Supabase (PostgreSQL) | Data persistence |
| Auth | Supabase Auth | Authentication |
| Validation | Zod | Schema validation |
| Testing | Vitest | Unit/integration tests |
| Linting | Biome | Code quality |
| Monorepo | Turborepo | Build orchestration |
| Package Manager | pnpm | Dependency management |

---

## Glossary

- **CRDT**: Conflict-free Replicated Data Type - allows distributed systems to merge without conflicts
- **Yjs**: JavaScript CRDT implementation for real-time collaboration
- **Hocuspocus**: WebSocket server for Yjs
- **Monorepo**: Single repository containing multiple packages/apps
- **Turborepo**: Build system for monorepos
- **RLS**: Row Level Security - database-level access control
- **SSR**: Server-Side Rendering
- **WebSocket**: Full-duplex communication protocol

---

## Additional Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Yjs Docs**: https://docs.yjs.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Turborepo**: https://turbo.build/repo/docs

---

**End of Build and Deployment Guide**

For questions or issues, contact the development team or create an issue on GitHub.
