import { csvDataLoader } from '../lib/csv-data-loader'

async function test() {
  console.log('Testing database loader...\n')
  
  const topStates = await csvDataLoader.getTopStates(5)
  console.log('Top 5 States:')
  topStates.forEach((s, i) => console.log(`  ${i+1}. ${s.state}: ${s.count.toLocaleString()}`))
  
  const metrics = await csvDataLoader.getAggregatedMetrics()
  console.log('\nTotal Enrolments:', metrics.totalEnrolments.toLocaleString())
  console.log('Age Distribution:')
  console.log('  0-5:', metrics.byAgeGroup.age_0_5.toLocaleString())
  console.log('  5-17:', metrics.byAgeGroup.age_5_17.toLocaleString())
  console.log('  18+:', metrics.byAgeGroup.age_18_greater.toLocaleString())
  
  process.exit(0)
}

test().catch(e => { console.error(e); process.exit(1) })
