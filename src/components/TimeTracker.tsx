// src/components/TimeTracker.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

// Define types
interface TimeEntry {
  id: string
  category: string
  description: string
  startTime: Date
  endTime?: Date
  duration?: number
}

interface CategorySummary {
  category: string
  totalDuration: number
  entries: TimeEntry[]
}

// API service with Next.js API routes
const apiService = {
  async saveTimeEntry(entry: TimeEntry) {
    const response = await fetch('/api/timeEntries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    })
    return response.json()
  },

  async getCategorySummary(category: string, entries: TimeEntry[]) {
    const prompt = `Summarize the following time entries for category "${category}": ${JSON.stringify(entries)}`
    const response = await fetch('/api/ollama/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "llama2",
        prompt: prompt,
        stream: false
      })
    })
    return response.json()
  }
}

export const TimeTracker: React.FC = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [summaries, setSummaries] = useState<Record<string, string>>({})

  const startTracking = () => {
    if (!category || !description) return
    
    const newEntry: TimeEntry = {
      id: uuidv4(),
      category,
      description,
      startTime: new Date()
    }
    
    setActiveEntry(newEntry)
    setCategory('')
    setDescription('')
  }

  const stopTracking = async () => {
    if (!activeEntry) return

    const endTime = new Date()
    const duration = endTime.getTime() - activeEntry.startTime.getTime()
    const completedEntry = { ...activeEntry, endTime, duration }

    await apiService.saveTimeEntry(completedEntry)
    setEntries([...entries, completedEntry])
    setActiveEntry(null)

    const categoryEntries = entries.filter(e => e.category === completedEntry.category)
    const summary = await apiService.getCategorySummary(
      completedEntry.category, 
      [...categoryEntries, completedEntry]
    )
    setSummaries(prev => ({
      ...prev,
      [completedEntry.category]: summary.response
    }))
  }

  const getCategorySummaries = (): CategorySummary[] => {
    const summaryMap = new Map<string, CategorySummary>()
    
    entries.forEach(entry => {
      if (!entry.duration) return
      
      const existing = summaryMap.get(entry.category)
      if (existing) {
        existing.totalDuration += entry.duration
        existing.entries.push(entry)
      } else {
        summaryMap.set(entry.category, {
          category: entry.category,
          totalDuration: entry.duration,
          entries: [entry]
        })
      }
    })

    return Array.from(summaryMap.values())
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Time Tracker</h1>
      
      <div className="mb-8 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className="p-2 border rounded"
            disabled={!!activeEntry}
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="p-2 border rounded"
            disabled={!!activeEntry}
          />
        </div>
        
        {!activeEntry ? (
          <button
            onClick={startTracking}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            disabled={!category || !description}
          >
            Start Tracking
          </button>
        ) : (
          <button
            onClick={stopTracking}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Stop Tracking
          </button>
        )}
      </div>

      {activeEntry && (
        <div className="mb-8 p-4 bg-green-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Currently Tracking:</h2>
          <p>Category: {activeEntry.category}</p>
          <p>Description: {activeEntry.description}</p>
          <p>Started: {activeEntry.startTime.toLocaleTimeString()}</p>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Time Distribution</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={getCategorySummaries()}
                dataKey="totalDuration"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={(entry) => entry.category}
              >
                {getCategorySummaries().map((entry, index) => (
                  <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => 
                  `${Math.round(value / 1000 / 60)} minutes`
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(summaries).map(([category, summary]) => (
          <div key={category} className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">{category}</h3>
            <p className="whitespace-pre-line">{summary}</p>
          </div>
        ))}
      </div>
    </div>
  )
}