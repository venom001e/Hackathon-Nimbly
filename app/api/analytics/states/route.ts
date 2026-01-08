import { NextRequest, NextResponse } from 'next/server'
import { csvDataLoader } from '@/lib/csv-data-loader'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state')

    if (state) {
      // Get specific state details
      const metrics = await csvDataLoader.getAggregatedMetrics({ state })
      const districts = await csvDataLoader.getDistrictsByState(state)
      
      const districtData = []
      for (const district of districts) {
        const districtMetrics = await csvDataLoader.getAggregatedMetrics({ state, district })
        districtData.push({
          district,
          total_enrolments: districtMetrics.totalEnrolments,
          age_0_5: districtMetrics.byAgeGroup.age_0_5,
          age_5_17: districtMetrics.byAgeGroup.age_5_17,
          age_18_greater: districtMetrics.byAgeGroup.age_18_greater
        })
      }

      return NextResponse.json({
        state,
        total_enrolments: metrics.totalEnrolments,
        age_distribution: metrics.byAgeGroup,
        districts: districtData.sort((a, b) => b.total_enrolments - a.total_enrolments),
        district_count: districts.length
      })
    }

    // Get all states summary
    const stateSummary = await csvDataLoader.getStateSummary()
    const uniqueStates = await csvDataLoader.getUniqueStates()

    return NextResponse.json({
      states: stateSummary,
      total_states: uniqueStates.length,
      data_source: 'csv'
    })

  } catch (error) {
    console.error('States API error:', error)
    return NextResponse.json(
      { error: 'Failed to load state data', details: String(error) },
      { status: 500 }
    )
  }
}
