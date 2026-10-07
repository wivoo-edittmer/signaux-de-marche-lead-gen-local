"use client"

import { useState, useEffect, useRef } from 'react'
import { useI18n } from '@/lib/i18n'

interface ZoneOption {
  code: string
  name: string
  type: string
}

interface ZoneSelectorProps {
  value: string
  onChange: (zone: string) => void
  zones: ZoneOption[]
}

export default function ZoneSelector({ value, onChange, zones }: ZoneSelectorProps) {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedZone = zones.find(z => z.code === value)

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

  const filteredZones = zones.filter(zone => 
    zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) setSearchTerm('')
        }}
        className="w-full input flex items-center justify-between cursor-pointer"
      >
        <span className={selectedZone ? '' : 'text-gray-400'}>
          {selectedZone ? `${selectedZone.name} (${selectedZone.type})` : t('selector_select_zone')}
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
              placeholder={t('selector_search_zones')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
              autoFocus
            />
          </div>
          
          <div className="max-h-60 overflow-auto">
            {filteredZones.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                {t('selector_no_zones')}
              </div>
            ) : (
              <div className="py-1">
                {filteredZones.map((zone) => (
                  <button
                    key={zone.code}
                    onClick={() => {
                      onChange(zone.code)
                      setIsOpen(false)
                      setSearchTerm('')
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                      value === zone.code ? 'bg-gray-100' : ''
                    }`}
                  >
                    <span className="font-medium text-gray-900">{zone.name}</span>
                    <span className="text-gray-400 text-xs">{zone.type}</span>
                    {value === zone.code && (
                      <svg className="w-4 h-4 text-brand-primary ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
