export class AnalyticsUtils {
  // Statistical functions
  static calculateMean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  static calculateStandardDeviation(values: number[]): number {
    const mean = this.calculateMean(values)
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    return Math.sqrt(this.calculateMean(squaredDiffs))
  }

  static calculateZScore(value: number, mean: number, stdDev: number): number {
    return (value - mean) / stdDev
  }

  // Trend analysis functions
  static detectTrendDirection(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable'
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))
    
    const firstMean = this.calculateMean(firstHalf)
    const secondMean = this.calculateMean(secondHalf)
    
    const threshold = 0.05 // 5% threshold for stability
    const percentChange = (secondMean - firstMean) / firstMean
    
    if (percentChange > threshold) return 'increasing'
    if (percentChange < -threshold) return 'decreasing'
    return 'stable'
  }

  // Anomaly detection functions
  static detectAnomaliesZScore(values: number[], threshold: number = 2.5): number[] {
    const mean = this.calculateMean(values)
    const stdDev = this.calculateStandardDeviation(values)
    
    return values
      .map((val, index) => ({ value: val, index, zScore: this.calculateZScore(val, mean, stdDev) }))
      .filter(item => Math.abs(item.zScore) > threshold)
      .map(item => item.index)
  }

  // Seasonal pattern detection
  static detectSeasonalPattern(values: number[], period: number = 12): {
    hasPattern: boolean;
    amplitude: number;
    peakIndices: number[];
  } {
    if (values.length < period * 2) {
      return { hasPattern: false, amplitude: 0, peakIndices: [] }
    }

    // Simple seasonal decomposition
    const seasonalComponents: number[] = []
    for (let i = 0; i < period; i++) {
      const seasonalValues = []
      for (let j = i; j < values.length; j += period) {
        seasonalValues.push(values[j])
      }
      seasonalComponents.push(this.calculateMean(seasonalValues))
    }

    const seasonalMean = this.calculateMean(seasonalComponents)
    const amplitude = Math.max(...seasonalComponents) - Math.min(...seasonalComponents)
    const threshold = seasonalMean * 0.1 // 10% threshold

    const hasPattern = amplitude > threshold
    const peakIndices = seasonalComponents
      .map((val, index) => ({ value: val, index }))
      .filter(item => item.value > seasonalMean + threshold / 2)
      .map(item => item.index)

    return { hasPattern, amplitude, peakIndices }
  }

  // Forecasting utilities
  static simpleMovingAverage(values: number[], window: number): number[] {
    const result: number[] = []
    for (let i = window - 1; i < values.length; i++) {
      const windowValues = values.slice(i - window + 1, i + 1)
      result.push(this.calculateMean(windowValues))
    }
    return result
  }

  static exponentialSmoothing(values: number[], alpha: number = 0.3): number[] {
    const result: number[] = [values[0]]
    for (let i = 1; i < values.length; i++) {
      const smoothed = alpha * values[i] + (1 - alpha) * result[i - 1]
      result.push(smoothed)
    }
    return result
  }

  // Data validation utilities
  static validateEnrolmentRecord(record: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!record.timestamp || isNaN(new Date(record.timestamp).getTime())) {
      errors.push('Invalid timestamp')
    }

    if (!record.state || typeof record.state !== 'string') {
      errors.push('Invalid state')
    }

    if (!record.district || typeof record.district !== 'string') {
      errors.push('Invalid district')
    }

    if (!record.age_group || typeof record.age_group !== 'string') {
      errors.push('Invalid age_group')
    }

    if (!record.gender || !['male', 'female', 'other'].includes(record.gender.toLowerCase())) {
      errors.push('Invalid gender')
    }

    if (!record.enrolment_type || !['new', 'update'].includes(record.enrolment_type)) {
      errors.push('Invalid enrolment_type')
    }

    if (typeof record.biometric_quality !== 'number' || record.biometric_quality < 0 || record.biometric_quality > 1) {
      errors.push('Invalid biometric_quality (must be between 0 and 1)')
    }

    if (typeof record.processing_time !== 'number' || record.processing_time < 0) {
      errors.push('Invalid processing_time')
    }

    return { isValid: errors.length === 0, errors }
  }

  // Geographic utilities
  static getIndianStates(): string[] {
    return [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
      'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
      'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
      'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
      'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
      'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
    ]
  }

  // Date utilities
  static getDateRange(days: number): { start: Date; end: Date } {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    return { start, end }
  }

  static formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  // Performance utilities
  static chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  // Confidence scoring
  static calculateConfidenceScore(
    dataPoints: number,
    variance: number,
    modelAccuracy?: number
  ): number {
    let confidence = 0

    // Data quantity factor (0-0.4)
    const dataFactor = Math.min(dataPoints / 1000, 1) * 0.4

    // Variance factor (0-0.3) - lower variance = higher confidence
    const varianceFactor = Math.max(0, (1 - variance)) * 0.3

    // Model accuracy factor (0-0.3)
    const accuracyFactor = (modelAccuracy || 0.7) * 0.3

    confidence = dataFactor + varianceFactor + accuracyFactor

    return Math.min(Math.max(confidence, 0), 1)
  }
}