import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import Papa from 'papaparse'

interface UploadJob {
  id: string
  filename: string
  status: 'processing' | 'completed' | 'failed'
  progress: number
  totalRecords?: number
  processedRecords?: number
  validRecords?: number
  errorMessage?: string
  startedAt: string
  completedAt?: string
}

// In-memory storage for upload jobs (in production, use database)
const uploadJobs = new Map<string, UploadJob>()

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

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are supported' },
        { status: 400 }
      )
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 100MB limit' },
        { status: 400 }
      )
    }

    // Create upload job
    const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const uploadJob: UploadJob = {
      id: uploadId,
      filename: file.name,
      status: 'processing',
      progress: 0,
      startedAt: new Date().toISOString()
    }

    uploadJobs.set(uploadId, uploadJob)

    // Process file asynchronously
    processFileAsync(file, uploadId)

    return NextResponse.json({
      upload_id: uploadId,
      status: 'processing',
      message: 'File upload started',
      filename: file.name,
      size: file.size
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

async function processFileAsync(file: File, uploadId: string) {
  try {
    const job = uploadJobs.get(uploadId)!
    
    // Read file content
    const text = await file.text()
    
    // Update progress
    job.progress = 10
    uploadJobs.set(uploadId, { ...job })

    // Parse CSV
    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().trim()
    })

    if (parseResult.errors.length > 0) {
      job.status = 'failed'
      job.errorMessage = `Parse errors: ${parseResult.errors.map((e: any) => e.message).join(', ')}`
      job.completedAt = new Date().toISOString()
      uploadJobs.set(uploadId, { ...job })
      return
    }

    const records = parseResult.data as any[]
    job.totalRecords = records.length
    job.progress = 20
    uploadJobs.set(uploadId, { ...job })

    // Validate CSV structure
    const expectedColumns = ['date', 'state', 'district', 'pincode', 'age_0_5', 'age_5_17', 'age_18_greater']
    const actualColumns = parseResult.meta.fields || []
    
    const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col))
    if (missingColumns.length > 0) {
      job.status = 'failed'
      job.errorMessage = `Missing required columns: ${missingColumns.join(', ')}`
      job.completedAt = new Date().toISOString()
      uploadJobs.set(uploadId, { ...job })
      return
    }

    // Validate and clean records
    const validRecords: any[] = []
    const errors: string[] = []
    
    for (let i = 0; i < records.length; i++) {
      const record = records[i]
      const rowNum = i + 2 // +2 because of header and 0-based index
      
      try {
        // Validate required fields
        if (!record.date || !record.state || !record.district) {
          errors.push(`Row ${rowNum}: Missing required fields (date, state, district)`)
          continue
        }

        // Validate date format (DD-MM-YYYY)
        const datePattern = /^\d{2}-\d{2}-\d{4}$/
        if (!datePattern.test(record.date)) {
          errors.push(`Row ${rowNum}: Invalid date format. Expected DD-MM-YYYY, got: ${record.date}`)
          continue
        }

        // Validate age group numbers
        const age_0_5 = parseInt(record.age_0_5) || 0
        const age_5_17 = parseInt(record.age_5_17) || 0
        const age_18_greater = parseInt(record.age_18_greater) || 0

        if (age_0_5 < 0 || age_5_17 < 0 || age_18_greater < 0) {
          errors.push(`Row ${rowNum}: Age group values cannot be negative`)
          continue
        }

        // Clean and validate record
        const cleanRecord = {
          date: record.date.trim(),
          state: record.state.trim(),
          district: record.district.trim(),
          pincode: record.pincode?.toString().trim() || '',
          age_0_5,
          age_5_17,
          age_18_greater,
          total: age_0_5 + age_5_17 + age_18_greater
        }

        validRecords.push(cleanRecord)

      } catch (error) {
        errors.push(`Row ${rowNum}: Processing error - ${error}`)
      }

      // Update progress periodically
      if (i % 1000 === 0) {
        job.progress = 20 + (i / records.length) * 60
        job.processedRecords = i
        uploadJobs.set(uploadId, { ...job })
      }
    }

    job.processedRecords = records.length
    job.validRecords = validRecords.length
    job.progress = 80
    uploadJobs.set(uploadId, { ...job })

    // Save valid records to CSV file
    if (validRecords.length > 0) {
      const uploadDir = path.join(process.cwd(), 'uploads')
      
      // Ensure upload directory exists
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `uploaded_${timestamp}_${validRecords.length}_records.csv`
      const filepath = path.join(uploadDir, filename)

      // Convert back to CSV
      const csvContent = Papa.unparse(validRecords, {
        header: true,
        columns: ['date', 'state', 'district', 'pincode', 'age_0_5', 'age_5_17', 'age_18_greater']
      })

      await writeFile(filepath, csvContent, 'utf-8')

      job.progress = 100
      job.status = 'completed'
      job.completedAt = new Date().toISOString()
      
      if (errors.length > 0) {
        job.errorMessage = `${errors.length} rows had errors. First 5: ${errors.slice(0, 5).join('; ')}`
      }
    } else {
      job.status = 'failed'
      job.errorMessage = `No valid records found. Errors: ${errors.slice(0, 10).join('; ')}`
      job.completedAt = new Date().toISOString()
    }

    uploadJobs.set(uploadId, { ...job })

  } catch (error) {
    console.error('Processing error:', error)
    const job = uploadJobs.get(uploadId)!
    job.status = 'failed'
    job.errorMessage = error instanceof Error ? error.message : 'Unknown processing error'
    job.completedAt = new Date().toISOString()
    uploadJobs.set(uploadId, { ...job })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const uploadId = searchParams.get('upload_id')

    if (!uploadId) {
      // Return all recent upload jobs
      const recentJobs = Array.from(uploadJobs.values())
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
        .slice(0, 20)

      return NextResponse.json({
        jobs: recentJobs,
        total: uploadJobs.size
      })
    }

    const uploadJob = uploadJobs.get(uploadId)

    if (!uploadJob) {
      return NextResponse.json(
        { error: 'Upload job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      upload_id: uploadJob.id,
      filename: uploadJob.filename,
      status: uploadJob.status,
      progress: uploadJob.progress,
      total_records: uploadJob.totalRecords,
      processed_records: uploadJob.processedRecords,
      valid_records: uploadJob.validRecords,
      error_message: uploadJob.errorMessage,
      started_at: uploadJob.startedAt,
      completed_at: uploadJob.completedAt
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}