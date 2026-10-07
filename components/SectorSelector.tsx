"use client"

import { useState, useEffect, useRef } from 'react'

interface SectorOption {
  code: string
  name: string
  type: string
}

interface SectorSelectorProps {
  value: string
  onChange: (sector: string) => void
  sectors: SectorOption[]
}

export default function SectorSelector({ value, onChange, sectors }: SectorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedSector = sectors.find(s => s.code === value)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredSectors = sectors.filter(sector => 
    sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sector.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group sectors by NAF level
  const groupedSectors = filteredSectors.reduce((acc, sector) => {
    if (!acc[sector.type]) {
      acc[sector.type] = []
    }
    acc[sector.type].push(sector)
    return acc
  }, {} as Record<string, SectorOption[]>)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) setSearchTerm('')
        }}
        className="w-full input flex items-center justify-between cursor-pointer"
      >
        <span className={selectedSector ? '' : 'text-gray-400'}>
          {selectedSector ? `${selectedSector.name} (${selectedSector.type})` : 'Select a sector'}
        </span>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden animate-fade-in">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search sectors..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
              autoFocus
            />
          </div>
          
          <div className="max-h-60 overflow-auto">
            {Object.entries(groupedSectors).map(([type, sectorsInGroup]) => (
              <div key={type} className="py-1">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  {type}
                </div>
                {sectorsInGroup.map((sector) => (
                  <button
                    key={sector.code}
                    onClick={() => {
                      onChange(sector.code)
                      setIsOpen(false)
                      setSearchTerm('')
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                      value === sector.code ? 'bg-gray-100' : ''
                    }`}
                  >
                    <span className="font-medium text-gray-900">{sector.name}</span>
                    <span className="text-gray-400 text-xs">{sector.code}</span>
                    {value === sector.code && (
                      <svg className="w-4 h-4 text-brand-primary ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            ))}

            {Object.keys(groupedSectors).length === 0 && (
              <div className="p-4 text-center text-gray-400 text-sm">
                No sectors found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
