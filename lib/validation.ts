// Input validation utilities
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function validateTimeRange(timeRange: string): string {
  const validRanges = ['7d', '30d', '90d', '180d', '365d']
  if (!validRanges.includes(timeRange)) {
    throw new ValidationError(`Invalid time range. Must be one of: ${validRanges.join(', ')}`, 'time_period')
  }
  return timeRange
}

export function validateState(state: string): string {
  if (!state || state.trim().length === 0) {
    throw new ValidationError('State cannot be empty', 'state')
  }
  if (state.length > 50) {
    throw new ValidationError('State name too long', 'state')
  }
  return state.trim()
}

export function validateThreshold(threshold: string | number): number {
  const num = typeof threshold === 'string' ? parseFloat(threshold) : threshold
  if (isNaN(num) || num < 0 || num > 1) {
    throw new ValidationError('Threshold must be a number between 0 and 1', 'threshold')
  }
  return num
}

export function validatePagination(page?: string, limit?: string) {
  const pageNum = page ? parseInt(page) : 1
  const limitNum = limit ? parseInt(limit) : 10

  if (isNaN(pageNum) || pageNum < 1) {
    throw new ValidationError('Page must be a positive integer', 'page')
  }
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    throw new ValidationError('Limit must be between 1 and 100', 'limit')
  }

  return { page: pageNum, limit: limitNum }
}

export function sanitizeString(input: string, maxLength: number = 255): string {
  if (!input) return ''
  return input.trim().substring(0, maxLength)
}