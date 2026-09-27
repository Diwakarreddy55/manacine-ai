# ManaCine AI

Production-oriented starter for an AI Telugu video generation SaaS.

## Stack
- Frontend: Next.js 15 + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: MySQL 8
- Queue-ready architecture
- Docker Compose
- FFmpeg-ready video worker
- AI provider abstraction (mock provider included)

## Run locally

1. Copy environment files:
   - `backend/.env.example` -> `backend/.env`
   - `frontend/.env.example` -> `frontend/.env.local`

2. Start MySQL:
```bash
docker compose up -d mysql
```

3. Backend:
```bash
cd backend
npm install
npm run dev
```

4. Frontend:
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Production

Build:
```bash
docker compose build
docker compose up -d
```

Set secure secrets and production database/storage values before deploying.
