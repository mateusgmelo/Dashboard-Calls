import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const callSchema = z.object({
  ativo: z.string().regex(/^[A-Z0-9]{3,6}$/),
  operacao: z.enum(['COMPRA','VENDA']),
  entry: z.coerce.number().positive(),
  stop: z.coerce.number().positive(),
  alvo1: z.coerce.number().positive().optional(),
  alvo2: z.coerce.number().positive().optional(),
  alvo3: z.coerce.number().positive().optional(),
  status: z.enum(['AGUARDANDO','ATIVO','FINALIZADO','CANCELADO']).default('AGUARDANDO'),
  date: z.string(),
  fundamentacao: z.string().optional().nullable()
}).superRefine((data, ctx) => {
  const { operacao, entry, stop } = data
  if (operacao === 'COMPRA' && !(stop < entry)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['stop'], message: 'Stop deve ser < Entry (COMPRA)' })
  if (operacao === 'VENDA' && !(stop > entry)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['stop'], message: 'Stop deve ser > Entry (VENDA)' })
})

export async function callRoutes(app: FastifyInstance){
  app.get('/calls', { preHandler: [app.authenticate] }, async (req:any) => {
    const q = z.object({
      operacao: z.enum(['COMPRA','VENDA']).optional(),
      status: z.enum(['AGUARDANDO','ATIVO','FINALIZADO','CANCELADO']).optional(),
      q: z.string().max(12).optional()
    }).parse(req.query || {})

    const where:any = {}
    if (q.q) where.ativo = { contains: q.q.toUpperCase() }
    if (q.operacao) where.operacao = q.operacao
    if (q.status) where.status = q.status

    const calls = await prisma.call.findMany({ where, orderBy: { createdAt: 'desc' } })
    return calls
  })

  app.get('/calls/:id', { preHandler: [app.authenticate] }, async (req:any, reply) => {
    const params = z.object({ id: z.string().cuid() }).parse(req.params)
    const call = await prisma.call.findUnique({ where: { id: params.id } })
    if (!call) return (reply as any).status(404).send({ message: 'Call não encontrada' })
    return call
  })

  app.post('/calls', { preHandler: [app.authenticate] }, async (req:any, reply) => {
    const body = callSchema.parse(req.body)
    const me = await prisma.user.findUnique({ where: { id: req.user?.sub as string } })
    if (!me || me.role !== 'ADMIN') return reply.status(403).send({ message: 'Somente admin' })
    const created = await prisma.call.create({ data: { ...body, authorId: req.user?.sub as string } })
    return reply.status(201).send(created)
  })

  app.put('/calls/:id', { preHandler: [app.authenticate] }, async (req:any, reply) => {
    const params = z.object({ id: z.string().cuid() }).parse(req.params)
    const me = await prisma.user.findUnique({ where: { id: req.user?.sub as string } })
    if (!me || me.role !== 'ADMIN') return reply.status(403).send({ message: 'Somente admin' })
    const data = callSchema.partial().parse(req.body)
    try {
      const updated = await prisma.call.update({ where: { id: params.id }, data })
      return updated
    } catch {
      return (reply as any).status(404).send({ message: 'Call não encontrada' })
    }
  })

  app.delete('/calls/:id', { preHandler: [app.authenticate] }, async (req:any, reply) => {
    const params = z.object({ id: z.string().cuid() }).parse(req.params)
    const me = await prisma.user.findOne ? await prisma.user.findOne({ where: { id: req.user?.sub as string } }) : await prisma.user.findUnique({ where: { id: req.user?.sub as string } })
    if (!me || me.role !== 'ADMIN') return reply.status(403).send({ message: 'Somente admin' })
    try {
      await prisma.call.delete({ where: { id: params.id } })
      return (reply as any).status(204).send()
    } catch {
      return (reply as any).status(404).send({ message: 'Call não encontrada' })
    }
  })
}