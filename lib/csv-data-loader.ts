// CSV data loader for aadhaar enrolment files
// TODO: add better error handling for missing files

import * as fs from 'fs'
import * as path from 'path'

export interface AadhaarEnrolmentRecord {
  date: string
  state: string
  district: string
  pincode: string
  age_0_5: number
  age_5_17: number
  age_18_greater: number
  total: number
}

export interface AggregatedMetrics {
  totalEnrolments: number
  byState: Map<string, number>
  byDistrict: Map<string, number>
  byDate: Map<string, number>
  byAgeGroup: {
    age_0_5: number
    age_5_17: number
    age_18_greater: number
  }
}

class CSVDataLoader {
  private static instance: CSVDataLoader
  private cachedData: AadhaarEnrolmentRecord[] | null = null
  private lastLoadTime: number = 0
  private readonly CACHE_DURATION = 10 * 60 * 1000

  static getInstance(): CSVDataLoader {
    if (!CSVDataLoader.instance) {
      CSVDataLoader.instance = new CSVDataLoader()
    }
    return CSVDataLoader.instance
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  private compareDates(date1: string, date2: string): number {
    const [d1, m1, y1] = date1.split('-').map(Number)
    const [d2, m2, y2] = date2.split('-').map(Number)
    const dt1 = new Date(y1, m1 - 1, d1)
    const dt2 = new Date(y2, m2 - 1, d2)
    return dt1.getTime() - dt2.getTime()
  }

  async loadAllData(): Promise<AadhaarEnrolmentRecord[]> {
    const now = Date.now()
    if (this.cachedData && (now - this.lastLoadTime) < this.CACHE_DURATION) {
      return this.cachedData
    }

    const records: AadhaarEnrolmentRecord[] = []
    const csvDir = path.join(process.cwd(), 'api_data_aadhar_enrolment')
    
    try {
      if (!fs.existsSync(csvDir)) {
        console.error('CSV directory not found:', csvDir)
        return []
      }

      const files = fs.readdirSync(csvDir).filter(f => f.endsWith('.csv'))
      
      for (const file of files) {
        const filePath = path.join(csvDir, file)
        const content = fs.readFileSync(filePath, 'utf-8')
        const lines = content.split('\n').filter(l => l.trim())
        
        for (let i = 1; i < lines.length; i++) {
          const cols = this.parseCSVLine(lines[i])
          if (cols.length >= 7) {
            const age_0_5 = parseInt(cols[4]) || 0
            const age_5_17 = parseInt(cols[5]) || 0
            const age_18_greater = parseInt(cols[6]) || 0
            records.push({
              date: cols[0] || '',
              state: cols[1] || '',
              district: cols[2] || '',
              pincode: cols[3] || '',
              age_0_5,
              age_5_17,
              age_18_greater,
              total: age_0_5 + age_5_17 + age_18_greater
            })
          }
        }
      }
    } catch (err) {
      console.error('Error loading CSV files:', err)
    }

    this.cachedData = records
    this.lastLoadTime = now
    return records
  }

  async getAggregatedMetrics(filters?: {
    state?: string
    district?: string
    startDate?: string
    endDate?: string
  }): Promise<AggregatedMetrics> {
    let data = await this.loadAllData()
    
    if (filters?.state) data = data.filter(r => r.state === filters.state)
    if (filters?.district) data = data.filter(r => r.district === filters.district)
    if (filters?.startDate) data = data.filter(r => this.compareDates(r.date, filters.startDate!) >= 0)
    if (filters?.endDate) data = data.filter(r => this.compareDates(r.date, filters.endDate!) <= 0)

    const byState = new Map<string, number>()
    const byDistrict = new Map<string, number>()
    const byDate = new Map<string, number>()
    let age_0_5 = 0, age_5_17 = 0, age_18_greater = 0

    for (const r of data) {
      byState.set(r.state, (byState.get(r.state) || 0) + r.total)
      byDistrict.set(`${r.state}-${r.district}`, (byDistrict.get(`${r.state}-${r.district}`) || 0) + r.total)
      byDate.set(r.date, (byDate.get(r.date) || 0) + r.total)
      age_0_5 += r.age_0_5
      age_5_17 += r.age_5_17
      age_18_greater += r.age_18_greater
    }

    return {
      totalEnrolments: age_0_5 + age_5_17 + age_18_greater,
      byState,
      byDistrict,
      byDate,
      byAgeGroup: { age_0_5, age_5_17, age_18_greater }
    }
  }

  async getTopStates(limit: number = 10): Promise<{ state: string; count: number }[]> {
    const metrics = await this.getAggregatedMetrics()
    return Array.from(metrics.byState.entries())
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  async getTopDistricts(limit: number = 10): Promise<{ district: string; state: string; count: number }[]> {
    const data = await this.loadAllData()
    const districtMap = new Map<string, { state: string; district: string; count: number }>()
    
    for (const r of data) {
      const key = `${r.state}-${r.district}`
      const existing = districtMap.get(key)
      if (existing) {
        existing.count += r.total
      } else {
        districtMap.set(key, { state: r.state, district: r.district, count: r.total })
      }
    }
    
    return Array.from(districtMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  async getDailyTrends(days: number = 30): Promise<{ date: string; count: number }[]> {
    const metrics = await this.getAggregatedMetrics()
    return Array.from(metrics.byDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => {
        const [d1, m1, y1] = a.date.split('-').map(Number)
        const [d2, m2, y2] = b.date.split('-').map(Number)
        return new Date(y1, m1-1, d1).getTime() - new Date(y2, m2-1, d2).getTime()
      })
      .slice(-days)
  }

  async getUniqueStates(): Promise<string[]> {
    const data = await this.loadAllData()
    return [...new Set(data.map((r: any) => r.state))].sort()
  }

  async getDistrictsByState(state: string): Promise<string[]> {
    const data = await this.loadAllData()
    return [...new Set(data.filter((r: any) => r.state === state).map((r: any) => r.district))].sort()
  }

  async getStateSummary(): Promise<{
    state: string
    totalEnrolments: number
    age_0_5: number
    age_5_17: number
    age_18_greater: number
    districts: number
  }[]> {
    const data = await this.loadAllData()
    const stateMap = new Map<string, { age_0_5: number; age_5_17: number; age_18_greater: number; districts: Set<string> }>()
    
    for (const r of data) {
      const existing = stateMap.get(r.state)
      if (existing) {
        existing.age_0_5 += r.age_0_5
        existing.age_5_17 += r.age_5_17
        existing.age_18_greater += r.age_18_greater
        existing.districts.add(r.district)
      } else {
        stateMap.set(r.state, {
          age_0_5: r.age_0_5,
          age_5_17: r.age_5_17,
          age_18_greater: r.age_18_greater,
          districts: new Set([r.district])
        })
      }
    }
    
    return Array.from(stateMap.entries())
      .map(([state, d]) => ({
        state,
        totalEnrolments: d.age_0_5 + d.age_5_17 + d.age_18_greater,
        age_0_5: d.age_0_5,
        age_5_17: d.age_5_17,
        age_18_greater: d.age_18_greater,
        districts: d.districts.size
      }))
      .sort((a, b) => b.totalEnrolments - a.totalEnrolments)
  }

  clearCache(): void {
    this.cachedData = null
    this.lastLoadTime = 0
  }
}

export const csvDataLoader = CSVDataLoader.getInstance()
