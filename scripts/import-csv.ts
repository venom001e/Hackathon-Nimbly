import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

async function importCSV(filePath: string) {
  console.log(`Importing: ${filePath}`)
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.trim().split('\n')
  const header = lines[0].split(',')
  
  const records: any[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    if (values.length !== header.length) continue
    
    records.push({
      date: parseDate(values[0]),
      state: values[1],
      district: values[2],
      pincode: values[3],
      age_0_5: parseInt(values[4]) || 0,
      age_5_17: parseInt(values[5]) || 0,
      age_18_greater: parseInt(values[6]) || 0,
    })
    
    // Batch insert every 5000 records
    if (records.length >= 5000) {
      await prisma.enrolmentData.createMany({ data: records })
      console.log(`Inserted ${i} records...`)
      records.length = 0
    }
  }
  
  // Insert remaining records
  if (records.length > 0) {
    await prisma.enrolmentData.createMany({ data: records })
  }
  
  console.log(`Completed: ${filePath}`)
}

async function main() {
  const csvDir = path.join(process.cwd(), 'api_data_aadhar_enrolment')
  const files = fs.readdirSync(csvDir).filter(f => f.endsWith('.csv'))
  
  console.log(`Found ${files.length} CSV files`)
  
  // Clear existing data
  await prisma.enrolmentData.deleteMany()
  console.log('Cleared existing data')
  
  for (const file of files) {
    await importCSV(path.join(csvDir, file))
  }
  
  const count = await prisma.enrolmentData.count()
  console.log(`\nTotal records imported: ${count}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
