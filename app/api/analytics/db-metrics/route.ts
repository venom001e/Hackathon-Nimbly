import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const [
      totalRecords,
      stateStats,
      ageDistribution,
      recentData
    ] = await Promise.all([
      // Total count
      prisma.enrolmentData.count(),
      
      // State-wise stats
      prisma.enrolmentData.groupBy({
        by: ['state'],
        _sum: {
          age_0_5: true,
          age_5_17: true,
          age_18_greater: true,
        },
        _count: true,
      }),
      
      // Overall age distribution
      prisma.enrolmentData.aggregate({
        _sum: {
          age_0_5: true,
          age_5_17: true,
          age_18_greater: true,
        },
      }),
      
      // Recent 10 records
      prisma.enrolmentData.findMany({
        take: 10,
        orderBy: { date: 'desc' },
      }),
    ])

    const stateData = stateStats.map((s: any) => ({
      state: s.state,
      total: (s._sum.age_0_5 || 0) + (s._sum.age_5_17 || 0) + (s._sum.age_18_greater || 0),
      records: s._count,
    })).sort((a: any, b: any) => b.total - a.total)

    return NextResponse.json({
      success: true,
      data: {
        totalRecords,
        totalEnrolments: (ageDistribution._sum.age_0_5 || 0) + 
                         (ageDistribution._sum.age_5_17 || 0) + 
                         (ageDistribution._sum.age_18_greater || 0),
        ageDistribution: {
          '0-5': ageDistribution._sum.age_0_5 || 0,
          '5-17': ageDistribution._sum.age_5_17 || 0,
          '18+': ageDistribution._sum.age_18_greater || 0,
        },
        topStates: stateData.slice(0, 10),
        recentData,
      },
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
