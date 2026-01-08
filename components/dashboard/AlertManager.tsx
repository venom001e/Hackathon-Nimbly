"use client"

import { useState, useEffect } from 'react'
import { 
  BellIcon, 
  PlusIcon, 
  TrashIcon, 
  EditIcon, 
  CheckCircleIcon,
  AlertTriangleIcon,
  XIcon,
  SettingsIcon,
  MailIcon,
  MessageSquareIcon,
  MonitorIcon
} from 'lucide-react'

interface AlertConfiguration {
  id: string
  name: string
  metric: string
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals'
  threshold: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  channels: string[]
  createdAt: string
  updatedAt: string
}

export default function AlertManager() {
  const [configurations, setConfigurations] = useState<AlertConfiguration[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingConfig, setEditingConfig] = useState<AlertConfiguration | null>(null)

  useEffect(() => {
    loadConfigurations()
  }, [])

  const loadConfigurations = async () => {
    try {
      const res = await fetch('/api/alerts/configure')
      if (res.ok) {
        const data = await res.json()
        setConfigurations(data.configurations || [])
      }
    } catch (error) {
      console.error('Error loading configurations:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAlert = async (id: string, enabled: boolean) => {
    try {
      await fetch('/api/alerts/configure', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled })
      })
      loadConfigurations()
    } catch (error) {
      console.error('Error toggling alert:', error)
    }
  }

  const deleteAlert = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return
    
    try {
      await fetch(`/api/alerts/configure?id=${id}`, { method: 'DELETE' })
      loadConfigurations()
    } catch (error) {
      console.error('Error deleting alert:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <MailIcon className="w-4 h-4" />
      case 'sms': return <MessageSquareIcon className="w-4 h-4" />
      case 'dashboard': return <MonitorIcon className="w-4 h-4" />
      default: return <BellIcon className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-orange-500" />
          Alert Configuration
        </h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
        >
          <PlusIcon className="w-4 h-4" />
          New Alert
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : configurations.length === 0 ? (
        <div className="text-center py-12">
          <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No alerts configured</p>
          <p className="text-sm text-gray-500">Create your first alert to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {configurations.map(config => (
            <div 
              key={config.id}
              className={`border rounded-lg p-4 transition-all ${
                config.enabled ? 'bg-white' : 'bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{config.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeverityColor(config.severity)}`}>
                      {config.severity.toUpperCase()}
                    </span>
                    {!config.enabled && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        Disabled
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    When <span className="font-medium">{config.metric.replace('_', ' ')}</span> is{' '}
                    <span className="font-medium">{config.condition.replace('_', ' ')}</span>{' '}
                    <span className="font-medium text-orange-600">{config.threshold.toLocaleString()}</span>
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Notify via:</span>
                    <div className="flex gap-1">
                      {config.channels.map(channel => (
                        <span 
                          key={channel}
                          className="p-1 bg-gray-100 rounded text-gray-600"
                          title={channel}
                        >
                          {getChannelIcon(channel)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAlert(config.id, !config.enabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      config.enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      config.enabled ? 'left-7' : 'left-1'
                    }`}></span>
                  </button>
                  <button
                    onClick={() => setEditingConfig(config)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <EditIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteAlert(config.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingConfig) && (
        <AlertConfigModal
          config={editingConfig}
          onClose={() => {
            setShowCreateModal(false)
            setEditingConfig(null)
          }}
          onSave={() => {
            loadConfigurations()
            setShowCreateModal(false)
            setEditingConfig(null)
          }}
        />
      )}
    </div>
  )
}

function AlertConfigModal({ 
  config, 
  onClose, 
  onSave 
}: { 
  config: AlertConfiguration | null
  onClose: () => void
  onSave: () => void 
}) {
  const [formData, setFormData] = useState({
    name: config?.name || '',
    metric: config?.metric || 'daily_enrolments',
    condition: config?.condition || 'greater_than',
    threshold: config?.threshold || 0,
    severity: config?.severity || 'medium',
    channels: config?.channels || ['dashboard']
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const method = config ? 'PUT' : 'POST'
      const body = config ? { id: config.id, ...formData } : formData

      await fetch('/api/alerts/configure', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      onSave()
    } catch (error) {
      console.error('Error saving alert:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleChannel = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {config ? 'Edit Alert' : 'Create New Alert'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <XIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alert Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., High Enrolment Alert"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metric</label>
              <select
                value={formData.metric}
                onChange={e => setFormData(prev => ({ ...prev, metric: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="daily_enrolments">Daily Enrolments</option>
                <option value="anomaly_score">Anomaly Score</option>
                <option value="growth_rate">Growth Rate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select
                value={formData.condition}
                onChange={e => setFormData(prev => ({ ...prev, condition: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="greater_than">Greater Than</option>
                <option value="less_than">Less Than</option>
                <option value="equals">Equals</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Threshold</label>
              <input
                type="number"
                value={formData.threshold}
                onChange={e => setFormData(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={formData.severity}
                onChange={e => setFormData(prev => ({ ...prev, severity: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notification Channels</label>
            <div className="flex gap-2">
              {['dashboard', 'email', 'sms'].map(channel => (
                <button
                  key={channel}
                  type="button"
                  onClick={() => toggleChannel(channel)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    formData.channels.includes(channel)
                      ? 'bg-orange-50 border-orange-300 text-orange-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  {channel === 'dashboard' && <MonitorIcon className="w-4 h-4" />}
                  {channel === 'email' && <MailIcon className="w-4 h-4" />}
                  {channel === 'sms' && <MessageSquareIcon className="w-4 h-4" />}
                  <span className="text-sm capitalize">{channel}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : config ? 'Update Alert' : 'Create Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
