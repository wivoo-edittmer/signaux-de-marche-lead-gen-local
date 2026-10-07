"use client"

import { useRetroMode } from '@/lib/retro-mode'

export default function RetroToggle() {
  const { isRetro, toggleRetro } = useRetroMode()

  return (
    <button
      onClick={toggleRetro}
      className="retro-toggle-btn"
      title={isRetro ? 'Exit 09s mode' : 'Enter 09s mode'}
      aria-label={isRetro ? 'Exit retro mode' : 'Enter retro mode'}
      aria-pressed={isRetro}
    >
      <span className="retro-toggle-icon" aria-hidden="true">
        {isRetro ? (
          // Pixelated "power off" icon
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" shapeRendering="crispEdges">
            <rect x="9" y="2" width="2" height="8" fill="currentColor" />
            <rect x="5" y="5" width="2" height="2" fill="currentColor" />
            <rect x="7" y="7" width="2" height="2" fill="currentColor" />
            <rect x="9" y="9" width="2" height="2" fill="currentColor" />
            <rect x="11" y="7" width="2" height="2" fill="currentColor" />
            <rect x="13" y="5" width="2" height="2" fill="currentColor" />
            <rect x="5" y="11" width="2" height="2" fill="currentColor" />
            <rect x="7" y="13" width="2" height="2" fill="currentColor" />
            <rect x="9" y="15" width="2" height="2" fill="currentColor" />
            <rect x="11" y="13" width="2" height="2" fill="currentColor" />
            <rect x="13" y="11" width="2" height="2" fill="currentColor" />
          </svg>
        ) : (
          // Pixelated "game controller / 09s" icon
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" shapeRendering="crispEdges">
            <rect x="2" y="6" width="16" height="8" fill="currentColor" />
            <rect x="4" y="4" width="4" height="2" fill="currentColor" />
            <rect x="12" y="4" width="4" height="2" fill="currentColor" />
            <rect x="4" y="14" width="4" height="2" fill="currentColor" />
            <rect x="12" y="14" width="4" height="2" fill="currentColor" />
            {/* D-pad cross cutout */}
            <rect x="5" y="8" width="2" height="4" fill="var(--retro-bg, #fff)" />
            <rect x="4" y="9" width="4" height="2" fill="var(--retro-bg, #fff)" />
            {/* Button dots cutout */}
            <rect x="13" y="8" width="2" height="2" fill="var(--retro-bg, #fff)" />
            <rect x="15" y="10" width="2" height="2" fill="var(--retro-bg, #fff)" />
          </svg>
        )}
      </span>
      <span className="retro-toggle-label">09s</span>
    </button>
  )
}
