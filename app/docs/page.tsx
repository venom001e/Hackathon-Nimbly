"use client"

import Link from 'next/link'
import { 
  BookOpenIcon, 
  ChevronRightIcon,
  CodeBracketIcon,
  CogIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlayIcon,
  CommandLineIcon,
  DatabaseIcon,
  GlobeAltIcon,
  UserGroupIcon,
  LightBulbIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRightIcon className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Documentation</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25">
              <BookOpenIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Nimbly Documentation
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Complete guide to the Aadhaar Analytics Dashboard
              </p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-800">
              <strong>Version:</strong> 1.0.0 | <strong>Last Updated:</strong> January 2025 | <strong>Status:</strong> Hackathon Project
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Table of Contents</h3>
              <nav className="space-y-2">
                <a href="#overview" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">Overview</a>
                <a href="#features" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">Key Features</a>
                <a href="#getting-started" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">Getting Started</a>
                <a href="#installation" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">Installation</a>
                <a href="#configuration" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">Configuration</a>
                <a href="#user-guide" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">User Guide</a>
                <a href="#api-reference" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">API Reference</a>
                <a href="#troubleshooting" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">Troubleshooting</a>
                <a href="#contributing" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">Contributing</a>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            
            {/* Overview Section */}
            <section id="overview" className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <InformationCircleIcon className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-gray-900">Project Overview</h2>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Nimbly</strong> is an advanced Aadhaar Analytics Dashboard developed for the UIDAI Hackathon. 
                  It processes and analyzes over 1 million Aadhaar enrolment records to provide actionable insights 
                  for government decision-makers and policy planners.
                </p>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-3">Problem Statement</h3>
                  <p className="text-blue-800">
                    UIDAI faces challenges in managing Aadhaar enrolment across different regions and demographics, 
                    including uneven distribution, update delays, coverage gaps, and difficulty in prioritizing 
                    districts for enrolment drives. Nimbly addresses these challenges through data-driven analytics.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <DatabaseIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-green-900">1,006,029+</p>
                    <p className="text-sm text-green-700">Records Analyzed</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                    <ChartBarIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="font-semibold text-purple-900">15+</p>
                    <p className="text-sm text-purple-700">Analytics Features</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                    <GlobeAltIcon className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <p className="font-semibold text-orange-900">All States</p>
                    <p className="text-sm text-orange-700">Coverage Analysis</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Key Features Section */}
            <section id="features" className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <LightBulbIcon className="w-6 h-6 text-yellow-500" />
                <h2 className="text-2xl font-bold text-gray-900">Key Features</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Real-time Analytics Dashboard</h3>
                      <p className="text-sm text-gray-600">Interactive charts and visualizations for enrolment data analysis</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Geographic Analysis</h3>
                      <p className="text-sm text-gray-600">State and district-wise enrolment distribution mapping</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Demographic Insights</h3>
                      <p className="text-sm text-gray-600">Age group analysis and demographic trend identification</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Predictive Analytics</h3>
                      <p className="text-sm text-gray-600">Forecasting and trend prediction for future planning</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Alert Management</h3>
                      <p className="text-sm text-gray-600">Automated anomaly detection and alert system</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Data Upload System</h3>
                      <p className="text-sm text-gray-600">Secure CSV file processing with validation and error reporting</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">AI Document Detection</h3>
                      <p className="text-sm text-gray-600">Gemini AI-powered fake document detection system</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Report Generation</h3>
                      <p className="text-sm text-gray-600">Automated PDF report generation with insights and recommendations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Performance Optimized</h3>
                      <p className="text-sm text-gray-600">Redis caching, database optimization, and efficient data processing</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Secure Authentication</h3>
                      <p className="text-sm text-gray-600">Role-based access control with secure login system</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Getting Started Section */}
            <section id="getting-started" className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <PlayIcon className="w-6 h-6 text-green-500" />
                <h2 className="text-2xl font-bold text-gray-900">Getting Started</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-900">Prerequisites</h3>
                  </div>
                  <ul className="text-yellow-800 text-sm space-y-1">
                    <li>• Node.js 18+ installed</li>
                    <li>• npm or yarn package manager</li>
                    <li>• PostgreSQL database (optional)</li>
                    <li>• Google Gemini API key (for AI features)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Quick Start</h3>
                  <div className="bg-gray-900 rounded-xl p-4 text-white font-mono text-sm">
                    <div className="text-green-400"># Clone the repository</div>
                    <div>git clone https://github.com/venom001e/Hackathon-Nimbly.git</div>
                    <div className="mt-2 text-green-400"># Navigate to project directory</div>
                    <div>cd Hackathon-Nimbly</div>
                    <div className="mt-2 text-green-400"># Install dependencies</div>
                    <div>npm install</div>
                    <div className="mt-2 text-green-400"># Start development server</div>
                    <div>npm run dev</div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-blue-800">
                    <strong>Default Login:</strong> Use <code className="bg-blue-100 px-2 py-1 rounded">admin</code> / <code className="bg-blue-100 px-2 py-1 rounded">admin123</code> 
                    to access the dashboard after starting the application.
                  </p>
                </div>
              </div>
            </section>

            {/* Installation Section */}
            <section id="installation" className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <CommandLineIcon className="w-6 h-6 text-purple-500" />
                <h2 className="text-2xl font-bold text-gray-900">Installation Guide</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">1. Environment Setup</h3>
                  <p className="text-gray-700 mb-3">Create a <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file in the root directory:</p>
                  <div className="bg-gray-900 rounded-xl p-4 text-white font-mono text-sm">
                    <div className="text-green-400"># Gemini API Configuration</div>
                    <div>GEMINI_API_KEY=your_gemini_api_key_here</div>
                    <div className="mt-2 text-green-400"># Database Configuration (Optional)</div>
                    <div>DATABASE_URL="postgresql://username:password@host:port/database"</div>
                    <div className="mt-2 text-green-400"># Performance Configuration</div>
                    <div>REDIS_URL="redis://localhost:6379"</div>
                    <div>ENABLE_PERFORMANCE_MONITORING="true"</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">2. Database Setup (Optional)</h3>
                  <p className="text-gray-700 mb-3">If using PostgreSQL, run the database migrations:</p>
                  <div className="bg-gray-900 rounded-xl p-4 text-white font-mono text-sm">
                    <div>npx prisma generate</div>
                    <div>npx prisma db push</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">3. Performance Setup</h3>
                  <p className="text-gray-700 mb-3">Run the performance optimization script:</p>
                  <div className="bg-gray-900 rounded-xl p-4 text-white font-mono text-sm">
                    <div>npm run perf:setup</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Configuration Section */}
            <section id="configuration" className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <CogIcon className="w-6 h-6 text-orange-500" />
                <h2 className="text-2xl font-bold text-gray-900">Configuration</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Environment Variables</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Variable</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Description</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">Required</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 font-mono text-sm">GEMINI_API_KEY</td>
                          <td className="px-4 py-3 text-sm">Google Gemini API key for AI features</td>
                          <td className="px-4 py-3 text-sm">Optional</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-sm">DATABASE_URL</td>
                          <td className="px-4 py-3 text-sm">PostgreSQL connection string</td>
                          <td className="px-4 py-3 text-sm">Optional</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-sm">REDIS_URL</td>
                          <td className="px-4 py-3 text-sm">Redis connection for caching</td>
                          <td className="px-4 py-3 text-sm">Optional</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-sm">NEXTAUTH_SECRET</td>
                          <td className="px-4 py-3 text-sm">Secret key for authentication</td>
                          <td className="px-4 py-3 text-sm">Production</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Performance Settings</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• <strong>Cache TTL:</strong> 300 seconds (configurable via CACHE_TTL)</li>
                      <li>• <strong>Max Cache Size:</strong> 100 entries (configurable via MAX_CACHE_SIZE)</li>
                      <li>• <strong>API Rate Limit:</strong> 100 requests per minute</li>
                      <li>• <strong>File Upload Limit:</strong> 1GB maximum file size</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* User Guide Section */}
            <section id="user-guide" className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <UserGroupIcon className="w-6 h-6 text-indigo-500" />
                <h2 className="text-2xl font-bold text-gray-900">User Guide</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Dashboard Navigation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Analytics Dashboard</h4>
                      <p className="text-blue-800 text-sm">Main dashboard with key metrics, charts, and insights overview</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <h4 className="font-semibold text-green-900 mb-2">Enrolment Data</h4>
                      <p className="text-green-800 text-sm">Detailed enrolment statistics and trend analysis</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                      <h4 className="font-semibold text-purple-900 mb-2">Geographic Analysis</h4>
                      <p className="text-purple-800 text-sm">State and district-wise coverage mapping</p>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <h4 className="font-semibold text-orange-900 mb-2">AI Document Scan</h4>
                      <p className="text-orange-800 text-sm">Fake document detection using Gemini AI</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Common Tasks</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Uploading Data</h4>
                        <p className="text-gray-600 text-sm">Navigate to Data Upload, select CSV file, and click upload. System validates format automatically.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Viewing Analytics</h4>
                        <p className="text-gray-600 text-sm">Use time range filters to analyze specific periods. Click on charts for detailed breakdowns.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Generating Reports</h4>
                        <p className="text-gray-600 text-sm">Go to Reports section, select parameters, and generate PDF reports with insights.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* API Reference Section */}
            <section id="api-reference" className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <CodeBracketIcon className="w-6 h-6 text-red-500" />
                <h2 className="text-2xl font-bold text-gray-900">API Reference</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Analytics Endpoints</h3>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">GET</span>
                        <code className="font-mono text-sm">/api/analytics/csv-metrics</code>
                      </div>
                      <p className="text-gray-600 text-sm">Retrieve CSV data metrics with time range filtering</p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">POST</span>
                        <code className="font-mono text-sm">/api/data/upload</code>
                      </div>
                      <p className="text-gray-600 text-sm">Upload and process CSV files with validation</p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded">POST</span>
                        <code className="font-mono text-sm">/api/doc-verify</code>
                      </div>
                      <p className="text-gray-600 text-sm">AI-powered document fraud detection</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Response Format</h3>
                  <div className="bg-gray-900 rounded-xl p-4 text-white font-mono text-sm">
                    <div className="text-green-400">// Standard API Response</div>
                    <div>{'{'}</div>
                    <div>  "success": true,</div>
                    <div>  "data": {'{'} ... {'}'},</div>
                    <div>  "message": "Operation completed successfully",</div>
                    <div>  "timestamp": "2025-01-10T12:00:00Z"</div>
                    <div>{'}'}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Troubleshooting Section */}
            <section id="troubleshooting" className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheckIcon className="w-6 h-6 text-red-500" />
                <h2 className="text-2xl font-bold text-gray-900">Troubleshooting</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Common Issues</h3>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Gemini AI Not Working</h4>
                      <p className="text-gray-600 text-sm mb-2">Check if GEMINI_API_KEY is properly configured in .env file</p>
                      <div className="bg-gray-100 rounded p-2 font-mono text-sm">
                        curl http://localhost:3000/api/test-gemini
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">CSV Upload Fails</h4>
                      <p className="text-gray-600 text-sm">Ensure CSV file has correct format with required columns: date, state, district, age_group</p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Performance Issues</h4>
                      <p className="text-gray-600 text-sm">Enable Redis caching and run performance optimization script</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Getting Help</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-blue-800">
                      For additional support, check the GitHub repository issues or contact the development team. 
                      Include error logs and system information when reporting issues.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contributing Section */}
            <section id="contributing" className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <UserGroupIcon className="w-6 h-6 text-green-500" />
                <h2 className="text-2xl font-bold text-gray-900">Contributing</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Development Setup</h3>
                  <div className="bg-gray-900 rounded-xl p-4 text-white font-mono text-sm">
                    <div className="text-green-400"># Fork and clone the repository</div>
                    <div>git clone https://github.com/your-username/Hackathon-Nimbly.git</div>
                    <div className="mt-2 text-green-400"># Create feature branch</div>
                    <div>git checkout -b feature/your-feature-name</div>
                    <div className="mt-2 text-green-400"># Make changes and commit</div>
                    <div>git commit -m "Add your feature"</div>
                    <div className="mt-2 text-green-400"># Push and create pull request</div>
                    <div>git push origin feature/your-feature-name</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Code Standards</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Follow TypeScript best practices</li>
                    <li>• Use ESLint and Prettier for code formatting</li>
                    <li>• Write meaningful commit messages</li>
                    <li>• Add tests for new features</li>
                    <li>• Update documentation for API changes</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Project Status</h3>
                  <p className="text-green-800">
                    This project was developed for the UIDAI Hackathon and serves as a proof-of-concept. 
                    Contributions are welcome to improve functionality and add new features.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-500">
            <p>Built with ❤️ for the UIDAI Hackathon | Last updated: January 2025</p>
            <p className="mt-2">
              <Link href="https://github.com/venom001e/Hackathon-Nimbly" className="text-blue-600 hover:text-blue-800 transition-colors">
                View on GitHub
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}