import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function userRoutes(app: FastifyInstance){
  app.get('/users', { preHandler: [app.authenticate] }, async (req:any, reply) => {
    const me = await prisma.user.findUnique({ where: { id: req.user?.sub as string } })
    if (!me || me.role !== 'ADMIN') return reply.status(403).send({ message: 'Somente admin' })
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
    return users.map(u => ({ id:u.id, name:u.name, email:u.email, role:u.role.toLowerCase(), createdAt:u.createdAt }))
  })

  app.post('/users', { preHandler: [app.authenticate] }, async (req:any, reply) => {
    const me = await prisma.user.findUnique({ where: { id: req.user?.sub as string } })
    if (!me || me.role !== 'ADMIN') return reply.status(403).send({ message: 'Somente admin' })
    const body = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8),
      role: z.enum(['admin','viewer']).default('viewer')
    }).parse(req.body)
    const hashed = await bcrypt.hash(body.password, 10)
    const created = await prisma.user.create({
      data: { name: body.name, email: body.email, password: hashed, role: body.role.toUpperCase() as any }
    })
    return reply.status(201).send({ id: created.id, name: created.name, email: created.email, role: created.role.toLowerCase(), createdAt: created.createdAt })
  })

  app.delete('/users/:id', { preHandler: [app.authenticate] }, async (req:any, reply) => {
    const me = await prisma.user.findUnique({ where: { id: req.user?.sub as string } })
    if (!me || me.role !== 'ADMIN') return reply.status(403).send({ message: 'Somente admin' })
    const params = z.object({ id: z.string().cuid() }).parse(req.params)
    try {
      await prisma.user.delete({ where: { id: params.id } })
      return (reply as any).status(204).send()
    } catch {
      return (reply as any).status(404).send({ message: 'Usuário não encontrado' })
    }
  })
}