# TradersLAB — Full Stack (com Login)
Frontend: React + TS + Vite + AntD + React Query
Backend: Fastify + TS + Prisma + SQLite + JWT

## Rodar
### Backend
cd backend
cp .env.example .env
npm i
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev  # http://localhost:3333

### Frontend
cd ../frontend
npm i
echo "VITE_API_URL=http://localhost:3333" > .env
npm run dev   # http://localhost:5173