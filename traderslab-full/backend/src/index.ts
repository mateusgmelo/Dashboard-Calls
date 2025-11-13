// backend/src/index.ts
import Fastify from 'fastify'
import cors from '@fastify/cors'
import authPlugin from './plugins/auth'       // <-- sem "
import { env } from './lib/env'               // <-- sem "src/"
import { authRoutes } from './routes/auth'
import { callRoutes } from './routes/calls'
import { userRoutes } from './routes/users'

const app = Fastify({ logger: true })

app.register(cors, { origin: true })
app.register(authPlugin)

app.get('/health', async () => ({ ok: true }))

app.register(authRoutes)
app.register(callRoutes)
app.register(userRoutes)

app.listen({ port: env.PORT, host: '0.0.0.0' })
  .then(() => console.log(`API on :${env.PORT}`))
  .catch((e) => { console.error(e); process.exit(1) })
