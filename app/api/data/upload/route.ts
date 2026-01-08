import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AnalyticsUtils } from '@/lib/analytics-utils'
import Papa from 'papaparse'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size (1GB limit)
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '1073741824')
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds limit' },
        { status: 400 }
      )
    }

    // Create upload job
    const uploadJob = await prisma.uploadJob.create({
      data: {
        filename: file.name,
        status: 'processing',
        progress: 0
      }
    })

    // Process file asynchronously
    processFileAsync(file, uploadJob.id)

    return NextResponse.json({
      upload_id: uploadJob.id,
      status: 'processing',
      message: 'File upload started'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function processFileAsync(file: File, uploadId: string) {
  try {
    const text = await file.text()
    
    // Update progress
    await prisma.uploadJob.update({
      where: { id: uploadId },
      data: { progress: 10 }
    })

    // Parse CSV
    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().replace(/\s+/g, '_')
    })

    if (parseResult.errors.length > 0) {
      await prisma.uploadJob.update({
        where: { id: uploadId },
        data: {
          status: 'failed',
          error_message: `Parse errors: ${parseResult.errors.map(e => e.message).join(', ')}`
        }
      })
      return
    }

    const records = parseResult.data as any[]
    const totalRecords = records.length

    await prisma.uploadJob.update({
      where: { id: uploadId },
      data: {
        total_records: totalRecords,
        progress: 20
      }
    })

    // Validate and process records in chunks
    const chunkSize = parseInt(process.env.BATCH_SIZE || '1000')
    const chunks = AnalyticsUtils.chunkArray(records, chunkSize)
    let processedRecords = 0
    const validRecords: any[] = []
    const errors: string[] = []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      
      for (const record of chunk) {
        const validation = AnalyticsUtils.validateEnrolmentRecord(record)
        
        if (validation.isValid) {
          validRecords.push({
            timestamp: new Date(record.timestamp),
            state: record.state,
            district: record.district,
            age_group: record.age_group,
            gender: record.gender.toLowerCase(),
            enrolment_type: record.enrolment_type,
            biometric_quality: parseFloat(record.biometric_quality),
            processing_time: parseFloat(record.processing_time)
          })
        } else {
          errors.push(`Row ${processedRecords + 1}: ${validation.errors.join(', ')}`)
        }
        
        processedRecords++
      }

      // Update progress
      const progress = 20 + (i / chunks.length) * 60
      await prisma.uploadJob.update({
        where: { id: uploadId },
        data: {
          progress,
          processed_records: processedRecords
        }
      })
    }

    // Insert valid records in chunks
    if (validRecords.length > 0) {
      const insertChunks = AnalyticsUtils.chunkArray(validRecords, chunkSize)
      
      for (let i = 0; i < insertChunks.length; i++) {
        await prisma.enrolmentData.createMany({
          data: insertChunks[i],
          skipDuplicates: true
        })

        // Update progress
        const progress = 80 + (i / insertChunks.length) * 20
        await prisma.uploadJob.update({
          where: { id: uploadId },
          data: { progress }
        })
      }
    }

    // Complete the job
    await prisma.uploadJob.update({
      where: { id: uploadId },
      data: {
        status: validRecords.length > 0 ? 'completed' : 'failed',
        progress: 100,
        processed_records: validRecords.length,
        error_message: errors.length > 0 ? errors.slice(0, 10).join('\n') : null
      }
    })

  } catch (error) {
    console.error('Processing error:', error)
    await prisma.uploadJob.update({
      where: { id: uploadId },
      data: {
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const uploadId = searchParams.get('upload_id')

    if (!uploadId) {
      return NextResponse.json(
        { error: 'Upload ID required' },
        { status: 400 }
      )
    }

    const uploadJob = await prisma.uploadJob.findUnique({
      where: { id: uploadId }
    })

    if (!uploadJob) {
      return NextResponse.json(
        { error: 'Upload job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      upload_id: uploadJob.id,
      status: uploadJob.status,
      progress: uploadJob.progress,
      processed_records: uploadJob.processed_records,
      total_records: uploadJob.total_records,
      error_message: uploadJob.error_message
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}