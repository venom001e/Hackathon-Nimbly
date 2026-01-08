"use client"

import { useState, useRef, useEffect } from 'react'
import { SendIcon, BotIcon, UserIcon, Loader2Icon, SparklesIcon } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  chartData?: any[]
  chartType?: string
}

const exampleQueries = [
  "What's the enrolment trend in UP?",
  "Show anomalies in Bihar",
  "Top 5 performing states",
  "0-5 age group summary",
  "Compare Maharashtra data"
]

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Namaste! Main Aadhaar Analytics Assistant hoon. Aap mujhse enrolment data ke baare mein kuch bhi pooch sakte hain.\n\nExamples:\n• "UP mein enrolment trend kya hai?"\n• "Bihar mein anomalies dikhao"\n• "Top states compare karo"',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim()
    if (!text || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Sorry, I could not process that query.',
        timestamp: new Date(),
        chartData: data.chartData,
        chartType: data.chartType
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Error processing your query. Please try again.',
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[600px] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-xl shadow-2xl border border-indigo-800/30">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-indigo-800/30 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-t-xl backdrop-blur-sm">
        <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg shadow-lg shadow-orange-500/20">
          <SparklesIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Nimbly Analytics Assistant</h3>
          <p className="text-xs text-indigo-300">Ask anything about enrolment data</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 chatbot-scroll">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`p-2 rounded-full h-8 w-8 flex items-center justify-center ${
              message.role === 'user' ? 'bg-gradient-to-br from-orange-500 to-amber-500' : 'bg-indigo-800/50'
            }`}>
              {message.role === 'user' ? (
                <UserIcon className="w-4 h-4 text-white" />
              ) : (
                <BotIcon className="w-4 h-4 text-indigo-300" />
              )}
            </div>
            <div className={`max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
              <div className={`p-3 rounded-2xl whitespace-pre-wrap text-sm ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-tr-sm shadow-lg shadow-orange-500/20'
                  : 'bg-indigo-800/30 text-gray-200 rounded-tl-sm border border-indigo-700/30'
              }`}>
                {message.content}
              </div>
              
              {/* Simple chart visualization */}
              {message.chartData && message.chartType === 'bar' && (
                <div className="mt-2 p-3 bg-indigo-900/30 rounded-lg border border-indigo-700/30">
                  <div className="space-y-2">
                    {message.chartData.slice(0, 5).map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs w-24 truncate text-gray-300">{item.state || item.name}</span>
                        <div className="flex-1 bg-indigo-900/50 rounded-full h-4">
                          <div 
                            className="bg-gradient-to-r from-orange-500 to-amber-500 h-4 rounded-full"
                            style={{ 
                              width: `${(item.count || item.value) / Math.max(...(message.chartData || []).map((d: any) => d.count || d.value)) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-xs w-16 text-right text-gray-300">
                          {(item.count || item.value).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-indigo-400 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3">
            <div className="p-2 rounded-full h-8 w-8 flex items-center justify-center bg-indigo-800/50">
              <BotIcon className="w-4 h-4 text-indigo-300" />
            </div>
            <div className="p-3 bg-indigo-800/30 rounded-2xl rounded-tl-sm border border-indigo-700/30">
              <Loader2Icon className="w-4 h-4 animate-spin text-indigo-400" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-indigo-800/30">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {exampleQueries.map((query, i) => (
            <button
              key={i}
              onClick={() => sendMessage(query)}
              disabled={loading}
              className="px-3 py-1 text-xs bg-indigo-800/40 hover:bg-indigo-700/50 text-indigo-200 rounded-full whitespace-nowrap transition-colors disabled:opacity-50 border border-indigo-700/30"
            >
              {query}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-indigo-800/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about Nimbly enrolments..."
            disabled={loading}
            className="flex-1 px-4 py-2 bg-indigo-900/30 border border-indigo-700/30 text-white placeholder-indigo-400 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/20"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
