import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const count = await prisma.enrolmentData.count()
  console.log('Total records in database:', count)
}

main().finally(() => prisma.$disconnect())
