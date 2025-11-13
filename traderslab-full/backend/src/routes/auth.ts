import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function authRoutes(app: FastifyInstance){
  app.post('/auth/login', async (req, reply) => {
    const body = z.object({
      email: z.string().email(),
      password: z.string().min(4) // dev only; increase in prod
    }).parse(req.body)

    const user = await prisma.user.findFirst({ where: { email: body.email } })
    if (!user) return reply.status(401).send({ message: 'Credenciais inválidas' })
    const ok = await bcrypt.compare(body.password, user.password)
    if (!ok) return reply.status(401).send({ message: 'Credenciais inválidas' })

    const token = app.jwt.sign({ sub: user.id, role: user.role })
    return reply.send({ accessToken: token, user: { id: user.id, name: user.name, email: user.email, role: user.role.toLowerCase(), createdAt: user.createdAt } })
  })
}