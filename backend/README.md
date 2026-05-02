# SafeHaven Backend

This is the separated Node.js + Express + MySQL backend for SafeHaven.

## Local run

1. Copy `.env.example` to `.env`
2. Fill in your MySQL values
3. Run `npm install`
4. Run `npm start`

The API starts on `http://localhost:10000` by default.

## Render

Create a Render Web Service from the `backend` root directory.

- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`

Add these environment variables in Render:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `ALLOWED_ORIGINS`
