"use client"

import { useRetroMode } from '@/lib/retro-mode'
import { useI18n } from '@/lib/i18n'

export default function RetroToggle() {
  const { isRetro, toggleRetro } = useRetroMode()
  const { t } = useI18n()

  return (
    <button
      onClick={toggleRetro}
      className="retro-toggle-btn"
      title={isRetro ? t('retro_toggle_off') : t('retro_toggle_on')}
      aria-label={isRetro ? t('retro_toggle_off') : t('retro_toggle_on')}
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
          // Pixelated cassette tape icon — pure 80s
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" shapeRendering="crispEdges">
            {/* Cassette body */}
            <rect x="1" y="4" width="18" height="12" fill="currentColor" />
            {/* Top label area cutout */}
            <rect x="3" y="6" width="14" height="3" fill="var(--retro-bg, #fff)" />
            {/* Reel holes */}
            <rect x="4" y="11" width="3" height="3" fill="var(--retro-bg, #fff)" />
            <rect x="13" y="11" width="3" height="3" fill="var(--retro-bg, #fff)" />
            {/* Tape window line */}
            <rect x="7" y="11" width="6" height="1" fill="var(--retro-bg, #fff)" />
            {/* Bottom trapezoid cutout */}
            <rect x="6" y="14" width="8" height="2" fill="var(--retro-bg, #fff)" />
          </svg>
        )}
      </span>
      <span className="retro-toggle-label">Take me back</span>
    </button>
  )
}
