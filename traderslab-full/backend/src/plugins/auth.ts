import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'
import { env } from '../lib/env'

export default fp(async (app) => {
  await app.register(jwt, { secret: env.JWT_SECRET })
  app.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify()
    } catch {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
  })
})

declare module 'fastify' {
  interface FastifyInstance { authenticate: any }
  interface FastifyRequest { jwtVerify: any; user: any }
}
