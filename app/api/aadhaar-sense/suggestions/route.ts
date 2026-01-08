import { NextResponse } from 'next/server'
import { csvDataLoader } from '@/lib/csv-data-loader'

export async function GET() {
  try {
    const stateData = await csvDataLoader.getStateSummary()
    const suggestions: any[] = []

    // Analyze each state for optimization opportunities
    const totalEnrolments = stateData.reduce((sum: number, s) => sum + s.totalEnrolments, 0)
    const avgPerState = totalEnrolments / stateData.length

    stateData.forEach((state, index) => {
      // Low coverage states - suggest mobile camps
      if (state.totalEnrolments < avgPerState * 0.5) {
        const gap = avgPerState - state.totalEnrolments
        const estimatedBoost = Math.round(gap * 0.4)
        suggestions.push({
          id: `sug-camp-${index}`,
          type: 'mobile_camp',
          location: { state: state.state, district: 'Multiple Districts', area: 'Rural Areas' },
          impact: { 
            coverageIncrease: Math.round((estimatedBoost / Math.max(1, state.totalEnrolments)) * 100),
            enrolmentBoost: estimatedBoost
          },
          priority: state.totalEnrolments < avgPerState * 0.2 ? 'urgent' : 'high',
          description: `Deploy mobile camps across ${state.state} to reach underserved populations. AI estimates ${estimatedBoost.toLocaleString()} new enrolments possible.`,
          estimatedCost: `₹${Math.round(estimatedBoost * 0.05 / 1000)} Lakhs`,
          implementationTime: '1-2 weeks'
        })
      }

      // High volume states - suggest staff allocation
      if (state.totalEnrolments > avgPerState * 1.5) {
        suggestions.push({
          id: `sug-staff-${index}`,
          type: 'staff_allocation',
          location: { state: state.state, district: 'High Traffic Centers' },
          impact: { coverageIncrease: 20, enrolmentBoost: Math.round(state.totalEnrolments * 0.15) },
          priority: 'high',
          description: `Add temporary staff to handle high demand in ${state.state}. Reduces average wait time by 45%.`,
          estimatedCost: '₹50,000/month',
          implementationTime: '3-5 days'
        })
      }

      // Age group imbalance - suggest timing changes
      const total = state.age_0_5 + state.age_5_17 + state.age_18_greater
      const adultRatio = total > 0 ? state.age_18_greater / total : 0
      if (adultRatio > 0.6 && state.totalEnrolments > avgPerState * 0.8) {
        suggestions.push({
          id: `sug-timing-${index}`,
          type: 'timing_change',
          location: { state: state.state, district: 'Urban Centers', area: 'Industrial/Commercial Areas' },
          impact: { coverageIncrease: 25, enrolmentBoost: Math.round(state.totalEnrolments * 0.1) },
          priority: 'medium',
          description: `Extend evening hours (6-9 PM) in ${state.state} for working adults. ${(adultRatio * 100).toFixed(0)}% of enrolments are 18+ age group.`,
          estimatedCost: '₹25,000/month',
          implementationTime: 'Immediate'
        })
      }
    })

    // Sort by priority
    const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2 }
    suggestions.sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2))

    return NextResponse.json({
      suggestions: suggestions.slice(0, 10),
      summary: {
        total: suggestions.length,
        urgent: suggestions.filter(s => s.priority === 'urgent').length,
        high: suggestions.filter(s => s.priority === 'high').length,
        medium: suggestions.filter(s => s.priority === 'medium').length,
        totalPotentialEnrolments: suggestions.reduce((sum: number, s) => sum + s.impact.enrolmentBoost, 0)
      }
    })
  } catch (error) {
    console.error('AadhaarSense suggestions error:', error)
    return NextResponse.json({ error: 'Failed to generate suggestions', details: String(error) }, { status: 500 })
  }
}
