"use client"

import { useState, useRef, useEffect } from 'react'
import { 
  SendIcon, 
  Loader2Icon,
  SparklesIcon,
  UserIcon,
  CopyIcon,
  CheckIcon,
  MessageSquareIcon,
  BrainCircuitIcon,
  TrendingUpIcon,
  MapPinIcon,
  UsersIcon,
  BarChart3Icon,
  LightbulbIcon,
  RefreshCwIcon,
  ChevronRightIcon,
  ZapIcon,
  ShieldCheckIcon,
  Trash2Icon
} from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px'
    }
  }, [input])

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
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          history: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Sorry, I could not process that request.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Connection error. Please try again.',
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  const quickPrompts = [
    { icon: TrendingUpIcon, label: 'Enrollment Trends', query: 'Show me the current Aadhaar enrollment trends across India', color: 'bg-blue-100 text-blue-600' },
    { icon: MapPinIcon, label: 'Top States', query: 'Which states have the highest Aadhaar enrollments this month?', color: 'bg-green-100 text-green-600' },
    { icon: UsersIcon, label: 'Age Analysis', query: 'Analyze the age group distribution in Aadhaar enrollments', color: 'bg-purple-100 text-purple-600' },
    { icon: BarChart3Icon, label: 'Performance', query: 'How is the overall enrollment performance compared to last month?', color: 'bg-orange-100 text-orange-600' },
  ]

  const suggestedQuestions = [
    'What are the peak enrollment hours?',
    'Show me districts with low coverage',
    'Predict next week enrollments',
    'Which centers need more staff?'
  ]

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-indigo-50/30 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col bg-white/80 backdrop-blur-xl border-r border-gray-200/50 pt-20">
        <div className="p-4 border-b border-gray-100">
          <Link href="/analytics" className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl hover:from-orange-100 hover:to-amber-100 transition-all group">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <BarChart3Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Dashboard</p>
              <p className="text-xs text-gray-500">View analytics</p>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h3>
          <div className="space-y-1">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => sendMessage(prompt.query)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100/50 transition-all text-left group"
              >
                <div className={`p-2 rounded-lg ${prompt.color} group-hover:scale-105 transition-transform`}>
                  <prompt.icon className="w-4 h-4" />
                </div>
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{prompt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-xl text-white shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuitIcon className="w-5 h-5 text-orange-400" />
              <span className="font-semibold">AI Powered</span>
            </div>
            <p className="text-xs text-gray-300">
              Powered by Google Gemini for intelligent Aadhaar data analysis
            </p>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col pt-20 overflow-hidden">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-xl border-b border-gray-200/50 px-4 md:px-8 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg shadow-orange-500/25">
                <MessageSquareIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Nimbly AI Assistant</h1>
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Online • Powered by Gemini
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-200"
              >
                <Trash2Icon className="w-4 h-4" />
                Clear Chat
              </button>
            )}
          </div>
        </header>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto chatbot-scroll">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
            {messages.length === 0 ? (
              /* Welcome Screen */
              <div className="py-8">
                <div className="text-center mb-10">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/30 animate-float">
                    <SparklesIcon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
                    How can I help you today?
                  </h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Ask me anything about Aadhaar enrollment data, trends, analytics, or get insights for better decision making.
                  </p>
                </div>

                {/* Quick Prompts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(prompt.query)}
                      className="flex items-center gap-4 p-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/10 transition-all text-left group hover:-translate-y-1"
                    >
                      <div className={`p-3 rounded-xl ${prompt.color} group-hover:scale-110 transition-transform shadow-md`}>
                        <prompt.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{prompt.label}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{prompt.query}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Suggested Questions */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <LightbulbIcon className="w-5 h-5 text-amber-500" />
                    Try asking...
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(q)}
                        className="px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-orange-50 hover:to-amber-50 hover:text-orange-700 rounded-full text-sm text-gray-700 transition-all border border-gray-200 hover:border-orange-200 hover:shadow-md"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="text-center p-5 bg-white/50 rounded-2xl border border-gray-100 hover:shadow-lg transition-all">
                    <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-md">
                      <ZapIcon className="w-7 h-7 text-blue-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">Fast Responses</p>
                    <p className="text-xs text-gray-500 mt-1">Instant AI analysis</p>
                  </div>
                  <div className="text-center p-5 bg-white/50 rounded-2xl border border-gray-100 hover:shadow-lg transition-all">
                    <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center shadow-md">
                      <ShieldCheckIcon className="w-7 h-7 text-emerald-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">Accurate Data</p>
                    <p className="text-xs text-gray-500 mt-1">Real-time insights</p>
                  </div>
                  <div className="text-center p-5 bg-white/50 rounded-2xl border border-gray-100 hover:shadow-lg transition-all">
                    <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center shadow-md">
                      <BrainCircuitIcon className="w-7 h-7 text-purple-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">Smart AI</p>
                    <p className="text-xs text-gray-500 mt-1">Context-aware</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Messages */
              <div className="space-y-6">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/25' 
                        : 'bg-gradient-to-br from-slate-800 to-slate-900 shadow-slate-500/20'
                    }`}>
                      {message.role === 'user' 
                        ? <UserIcon className="w-5 h-5 text-white" />
                        : <SparklesIcon className="w-5 h-5 text-white" />
                      }
                    </div>
                    <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block rounded-2xl px-5 py-3.5 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                          : 'bg-white/90 backdrop-blur-sm border border-gray-200/50 text-gray-800 shadow-lg'
                      }`}>
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 mt-2 ${message.role === 'user' ? 'justify-end' : ''}`}>
                        <span className="text-xs text-gray-400">
                          {message.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {message.role === 'assistant' && (
                          <button
                            onClick={() => copyToClipboard(message.content, message.id)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            {copiedId === message.id 
                              ? <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                              : <CopyIcon className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                            }
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg">
                      <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl px-5 py-4 shadow-lg">
                      <div className="flex items-center gap-3">
                        <Loader2Icon className="w-5 h-5 animate-spin text-orange-500" />
                        <span className="text-gray-600">Analyzing your query...</span>
                      </div>
                      <div className="flex gap-1.5 mt-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-gradient-to-t from-white via-white/95 to-transparent pt-4 pb-6 px-4 md:px-8 border-t border-gray-100">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about Aadhaar data..."
                rows={1}
                className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 resize-none focus:outline-none text-base bg-transparent"
              />
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <SparklesIcon className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-600 font-medium">Gemini Pro</span>
                  </div>
                  <span className="text-xs text-gray-400 hidden sm:inline">Press Enter to send</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {messages.length > 0 && (
                    <button
                      onClick={() => sendMessage(messages[messages.length - 2]?.content)}
                      disabled={loading || messages.length < 2}
                      className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-30 border border-transparent hover:border-gray-200"
                      title="Regenerate"
                    >
                      <RefreshCwIcon className="w-5 h-5 text-gray-500" />
                    </button>
                  )}
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl disabled:opacity-30 hover:from-orange-600 hover:to-amber-600 transition-all font-semibold shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30"
                  >
                    {loading ? (
                      <Loader2Icon className="w-4 h-4 animate-spin" />
                    ) : (
                      <SendIcon className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </div>
            </div>
            
            <p className="text-center text-xs text-gray-400 mt-3">
              AI responses are generated based on available data. Always verify critical information.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
