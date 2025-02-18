'use client'

import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { styles } from './styles/timeTracker'

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

// Predefined categories
const PREDEFINED_CATEGORIES = ['Qantas', 'TfNSW', 'TikTok', 'Bear', 'Todd'] as const
const OTHER_CATEGORY = 'Other'

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

const formatTime = (ms: number) => {
  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / 1000 / 60) % 60)
  const hours = Math.floor(ms / 1000 / 60 / 60)

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export const TimeTracker: React.FC = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>(PREDEFINED_CATEGORIES[0])
  const [customCategory, setCustomCategory] = useState('')
  const [description, setDescription] = useState('')
  const [summaries, setSummaries] = useState<Record<string, string>>({})
  const [elapsedTime, setElapsedTime] = useState<number>(0)

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (activeEntry) {
      intervalId = setInterval(() => {
        const now = new Date()
        const elapsed = now.getTime() - activeEntry.startTime.getTime()
        setElapsedTime(elapsed)
      }, 1000)
    } else {
      setElapsedTime(0)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [activeEntry])

  const getCurrentCategory = () => {
    return selectedCategory === OTHER_CATEGORY ? customCategory : selectedCategory
  }

  const startTracking = () => {
    const category = getCurrentCategory()
    if (!category || !description) return

    const newEntry: TimeEntry = {
      id: uuidv4(),
      category,
      description,
      startTime: new Date()
    }

    setActiveEntry(newEntry)
    setDescription('')
    if (selectedCategory === OTHER_CATEGORY) {
      setCustomCategory('')
    }
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
      <div className={styles.container}>
        <h1 className={styles.title}>Time Tracker</h1>

        <div className={styles.inputSection}>
          <div className={styles.inputGrid}>
            <div>
              <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={styles.categorySelect}
                  disabled={!!activeEntry}
              >
                {PREDEFINED_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value={OTHER_CATEGORY}>{OTHER_CATEGORY}</option>
              </select>
              {selectedCategory === OTHER_CATEGORY && (
                  <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter custom category"
                      className={styles.customCategoryInput}
                      disabled={!!activeEntry}
                  />
              )}
            </div>
            <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className={styles.input}
                disabled={!!activeEntry}
            />
          </div>

          {!activeEntry ? (
              <button
                  onClick={startTracking}
                  className={styles.startButton}
                  disabled={!(getCurrentCategory() && description)}
              >
                Start Tracking
              </button>
          ) : (
              <button
                  onClick={stopTracking}
                  className={styles.stopButton}
              >
                Stop Tracking
              </button>
          )}
        </div>

        {activeEntry && (
            <div className={styles.activeEntryContainer}>
              <h2 className={styles.activeEntryTitle}>Currently Tracking:</h2>
              <div className={styles.timerDisplay}>
                {formatTime(elapsedTime)}
              </div>
              <div className={styles.activeEntryDetails}>
                <p className="mb-2">
                  <span className={styles.activeEntryLabel}>Category:</span> {activeEntry.category}
                </p>
                <p className="mb-2">
                  <span className={styles.activeEntryLabel}>Description:</span> {activeEntry.description}
                </p>
                <p>
                  <span className={styles.activeEntryLabel}>Started:</span> {activeEntry.startTime.toLocaleTimeString()}
                </p>
              </div>
            </div>
        )}

        <div className={styles.distributionSection}>
          <h2 className={styles.distributionTitle}>Time Distribution</h2>
          <div className={styles.chartContainer}>
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

        <div className={styles.summaryGrid}>
          {Object.entries(summaries).map(([category, summary]) => (
              <div key={category} className={styles.summaryCard}>
                <h3 className={styles.summaryTitle}>{category}</h3>
                <p className={styles.summaryText}>{summary}</p>
              </div>
          ))}
        </div>
      </div>
  )
}