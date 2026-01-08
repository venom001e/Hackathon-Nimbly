#!/usr/bin/env node

/**
 * Production Database Setup Script
 * This script sets up the database tables and initial data for production
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupProductionDatabase() {
  try {
    console.log('🚀 Setting up production database...')

    // Test database connection
    console.log('📡 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful')

    // Check if tables exist by trying to count records
    try {
      const userCount = await prisma.user.count()
      console.log(`📊 Found ${userCount} users in database`)
    } catch (error) {
      console.log('⚠️  Database tables may not exist. This is normal for first deployment.')
    }

    // Create a default admin user if none exists
    const existingUsers = await prisma.user.count()
    if (existingUsers === 0) {
      console.log('👤 Creating default admin user...')
      
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      await prisma.user.create({
        data: {
          email: 'admin@aadhaar-analytics.com',
          name: 'System Administrator',
          password_hash: hashedPassword,
          role: 'admin',
          permissions: JSON.stringify(['read', 'write', 'admin'])
        }
      })
      console.log('✅ Default admin user created')
      console.log('📧 Email: admin@aadhaar-analytics.com')
      console.log('🔑 Password: admin123')
    }

    // Create sample data if database is empty
    const enrolmentCount = await prisma.enrolmentData.count()
    if (enrolmentCount === 0) {
      console.log('📊 Creating sample enrolment data...')
      
      const sampleData = []
      const states = ['Uttar Pradesh', 'Maharashtra', 'Bihar', 'West Bengal', 'Madhya Pradesh']
      const districts = ['District A', 'District B', 'District C']
      
      for (let i = 0; i < 100; i++) {
        const state = states[Math.floor(Math.random() * states.length)]
        const district = districts[Math.floor(Math.random() * districts.length)]
        const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        
        sampleData.push({
          date,
          state,
          district,
          pincode: `${Math.floor(Math.random() * 900000) + 100000}`,
          age_0_5: Math.floor(Math.random() * 1000),
          age_5_17: Math.floor(Math.random() * 2000),
          age_18_greater: Math.floor(Math.random() * 3000)
        })
      }
      
      await prisma.enrolmentData.createMany({
        data: sampleData
      })
      console.log(`✅ Created ${sampleData.length} sample enrolment records`)
    }

    console.log('🎉 Production database setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupProductionDatabase()
    .then(() => {
      console.log('✅ Setup completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error)
      process.exit(1)
    })
}

export { setupProductionDatabase }