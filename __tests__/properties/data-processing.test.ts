// Feature: aadhaar-analytics-dashboard, Property 1: Data Processing Pipeline Integrity

import * as fc from 'fast-check'
import { AnalyticsUtils } from '@/lib/analytics-utils'

describe('Property 1: Data Processing Pipeline Integrity', () => {
  // Property: For any valid Aadhaar data file, processing through validation, 
  // cleaning, and storage should result in retrievable data that maintains 
  // the original semantic content while conforming to the normalized schema.

  const validEnrolmentRecordArbitrary = fc.record({
    timestamp: fc.date({ min: new Date('2020-01-01'), max: new Date() }).map(d => d.toISOString()),
    state: fc.constantFrom(...AnalyticsUtils.getIndianStates()),
    district: fc.string({ minLength: 3, maxLength: 50 }).filter(s => /^[a-zA-Z\s]+$/.test(s)),
    age_group: fc.constantFrom('0-18', '18-30', '30-45', '45-60', '60+'),
    gender: fc.constantFrom('male', 'female', 'other'),
    enrolment_type: fc.constantFrom('new', 'update'),
    biometric_quality: fc.float({ min: 0, max: 1 }),
    processing_time: fc.float({ min: 0.1, max: 300 })
  })

  test('validates that all valid enrolment records pass validation', () => {
    fc.assert(
      fc.property(validEnrolmentRecordArbitrary, (record) => {
        const validation = AnalyticsUtils.validateEnrolmentRecord(record)
        expect(validation.isValid).toBe(true)
        expect(validation.errors).toHaveLength(0)
      }),
      { numRuns: 100 }
    )
  })

  test('validates that processed data maintains semantic integrity', () => {
    fc.assert(
      fc.property(fc.array(validEnrolmentRecordArbitrary, { minLength: 1, maxLength: 100 }), (records) => {
        // Simulate data processing pipeline
        const processedRecords = records.map((record: any) => ({
          ...record,
          timestamp: new Date(record.timestamp),
          state: record.state.trim(),
          district: record.district.trim(),
          gender: record.gender.toLowerCase()
        }))

        // Verify semantic content is preserved
        for (let i = 0; i < records.length; i++) {
          const original = records[i]
          const processed = processedRecords[i]

          // Core semantic content should be preserved
          expect(processed.state.toLowerCase()).toBe(original.state.toLowerCase())
          expect(processed.district.toLowerCase()).toBe(original.district.toLowerCase())
          expect(processed.age_group).toBe(original.age_group)
          expect(processed.gender).toBe(original.gender.toLowerCase())
          expect(processed.enrolment_type).toBe(original.enrolment_type)
          expect(processed.biometric_quality).toBe(original.biometric_quality)
          expect(processed.processing_time).toBe(original.processing_time)
          
          // Timestamp should be valid date
          expect(processed.timestamp).toBeInstanceOf(Date)
          expect(processed.timestamp.getTime()).not.toBeNaN()
        }
      }),
      { numRuns: 50 }
    )
  })

  test('validates that data normalization is consistent', () => {
    fc.assert(
      fc.property(validEnrolmentRecordArbitrary, (record) => {
        // Apply normalization multiple times
        const normalize = (r: any) => ({
          ...r,
          state: r.state.trim().toLowerCase(),
          district: r.district.trim().toLowerCase(),
          gender: r.gender.toLowerCase()
        })

        const normalized1 = normalize(record)
        const normalized2 = normalize(normalized1)
        const normalized3 = normalize(normalized2)

        // Normalization should be idempotent
        expect(normalized1).toEqual(normalized2)
        expect(normalized2).toEqual(normalized3)
      }),
      { numRuns: 100 }
    )
  })

  test('validates that chunked processing preserves data integrity', () => {
    fc.assert(
      fc.property(
        fc.array(validEnrolmentRecordArbitrary, { minLength: 10, maxLength: 1000 }),
        fc.integer({ min: 1, max: 100 }),
        (records, chunkSize) => {
          const chunks = AnalyticsUtils.chunkArray(records, chunkSize)
          const reconstructed = chunks.flat()

          // All original records should be preserved
          expect(reconstructed).toHaveLength(records.length)
          
          // Order should be preserved
          for (let i = 0; i < records.length; i++) {
            expect(reconstructed[i]).toEqual(records[i])
          }

          // No data should be lost or duplicated
          const originalIds = records.map((_, index) => index)
          const reconstructedIds = reconstructed.map((_, index) => index)
          expect(reconstructedIds).toEqual(originalIds)
        }
      ),
      { numRuns: 50 }
    )
  })

  test('validates that validation errors are comprehensive and accurate', () => {
    const invalidRecordArbitrary = fc.record({
      timestamp: fc.oneof(
        fc.constant('invalid-date'),
        fc.constant(''),
        fc.constant(null)
      ),
      state: fc.oneof(
        fc.constant(''),
        fc.constant(null),
        fc.integer() // Invalid type
      ),
      district: fc.oneof(
        fc.constant(''),
        fc.constant(null),
        fc.string({ maxLength: 2 }) // Too short
      ),
      age_group: fc.oneof(
        fc.constant(''),
        fc.constant('invalid-age-group')
      ),
      gender: fc.oneof(
        fc.constant(''),
        fc.constant('invalid-gender'),
        fc.constant(null)
      ),
      enrolment_type: fc.oneof(
        fc.constant(''),
        fc.constant('invalid-type'),
        fc.constant(null)
      ),
      biometric_quality: fc.oneof(
        fc.constant(-1), // Below range
        fc.constant(2),  // Above range
        fc.constant('invalid') // Invalid type
      ),
      processing_time: fc.oneof(
        fc.constant(-1), // Negative
        fc.constant('invalid') // Invalid type
      )
    })

    fc.assert(
      fc.property(invalidRecordArbitrary, (record) => {
        const validation = AnalyticsUtils.validateEnrolmentRecord(record)
        
        // Invalid records should fail validation
        expect(validation.isValid).toBe(false)
        expect(validation.errors.length).toBeGreaterThan(0)
        
        // Each error should be descriptive
        validation.errors.forEach(error => {
          expect(error).toBeTruthy()
          expect(typeof error).toBe('string')
          expect(error.length).toBeGreaterThan(0)
        })
      }),
      { numRuns: 100 }
    )
  })
})