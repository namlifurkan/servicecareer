'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, Check } from 'lucide-react'

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  label: string
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Seçiniz...',
  className = '',
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  const getSelectedLabels = () => {
    return value
      .map(v => options.find(opt => opt.value === v)?.label)
      .filter(Boolean)
  }

  const selectedLabels = getSelectedLabels()

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <label className="block text-sm font-medium text-secondary-900 mb-2">
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex items-center justify-between"
      >
        <span className="flex-1 truncate">
          {value.length === 0 ? (
            <span className="text-secondary-500">{placeholder}</span>
          ) : (
            <span className="text-secondary-900">
              {value.length === 1
                ? selectedLabels[0]
                : `${value.length} seçildi`}
            </span>
          )}
        </span>
        <div className="flex items-center gap-1">
          {value.length > 0 && (
            <button
              onClick={clearAll}
              className="p-1 hover:bg-secondary-100 rounded transition-colors"
            >
              <X className="h-3 w-3 text-secondary-500" />
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 text-secondary-500 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-secondary-500">
              Seçenek bulunamadı
            </div>
          ) : (
            <div className="py-1">
              {options.map((option) => {
                const isSelected = value.includes(option.value)
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleOption(option.value)}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-secondary-50 transition-colors flex items-center justify-between"
                  >
                    <span className={isSelected ? 'text-secondary-900 font-medium' : 'text-secondary-700'}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary-600" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected items as badges (optional - shown below dropdown) */}
      {value.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedLabels.map((label, index) => (
            <span
              key={value[index]}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-xs"
            >
              {label}
              <button
                type="button"
                onClick={() => toggleOption(value[index])}
                className="hover:bg-primary-100 rounded transition-colors p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
