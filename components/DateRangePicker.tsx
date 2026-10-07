"use client"

import { useState, useRef, useEffect } from 'react'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onChange: (startDate: string, endDate: string) => void
}

export default function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Quick date ranges
  const quickRanges = [
    { label: 'Last 7 days', start: () => formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), end: () => formatDate(new Date()) },
    { label: 'Last 30 days', start: () => formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), end: () => formatDate(new Date()) },
    { label: 'Last 90 days', start: () => formatDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)), end: () => formatDate(new Date()) },
    { label: 'Last 6 months', start: () => formatDate(new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)), end: () => formatDate(new Date()) },
    { label: 'Last 12 months', start: () => formatDate(new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000)), end: () => formatDate(new Date()) },
    { label: 'This year', start: () => formatDate(new Date(new Date().getFullYear(), 0, 1)), end: () => formatDate(new Date()) },
    { label: 'Last year', start: () => formatDate(new Date(new Date().getFullYear() - 1, 0, 1)), end: () => formatDate(new Date(new Date().getFullYear() - 1, 11, 31)) },
  ]

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const handleQuickRange = (start: () => string, end: () => string) => {
    onChange(start(), end())
    setIsOpen(false)
  }

  const displayDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full input flex items-center justify-between cursor-pointer"
      >
        <span className="text-gray-700">
          {displayDate(startDate)} - {displayDate(endDate)}
        </span>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden animate-fade-in">
          {/* Quick ranges */}
          <div className="p-2 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-1">
              {quickRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => handleQuickRange(range.start, range.end)}
                  className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom range - Simplified for now */}
          <div className="p-4">
            <p className="text-xs text-gray-500 text-center">
              Custom date ranges coming soon
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
