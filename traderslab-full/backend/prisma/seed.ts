import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main(){
  const adminEmail = 'admin@traderslab.local'
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Admin',
      email: adminEmail,
      password: await bcrypt.hash('admin1234', 10),
      role: 'ADMIN'
    }
  })
  await prisma.call.createMany({
    data: [
      { ativo: 'BRAV3', operacao: 'COMPRA', entry: 16.34, stop: 16.00, alvo1: 25.00, alvo2: 27.00, alvo3: 30.00, status: 'AGUARDANDO', date: '26/06/2025', authorId: admin.id },
      { ativo: 'VIVA3', operacao: 'COMPRA', entry: 26.24, stop: 23.15, alvo1: 27.56, alvo2: 28.13, alvo3: 32.22, status: 'AGUARDANDO', date: '24/06/2025', authorId: admin.id }
    ]
  })
  console.log('Seed pronto. Admin: admin@traderslab.local / admin1234')
}

main().then(()=>prisma.$disconnect())