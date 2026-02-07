'use client';

import { Button } from '@/lib/components/ui/button';

export interface ZoomControlsProps {
  zoomPercent: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onAutoLayout?: () => void;
}

/**
 * Zoom Controls Widget
 *
 * Reusable zoom control panel with zoom in/out buttons,
 * percentage display, fit-to-screen, and auto-layout actions.
 */
export function ZoomControls({
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onAutoLayout,
}: ZoomControlsProps) {
  return (
    <div className="bg-card rounded-lg shadow-md border border-border p-1 flex items-center space-x-1">
      {/* Zoom Out */}
      <Button
        variant="ghost"
        size="icon-sm"
        title="Zoom Out"
        onClick={onZoomOut}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </Button>

      {/* Zoom Percentage */}
      <span className="text-xs text-muted-foreground w-10 text-center select-none">
        {zoomPercent}%
      </span>

      {/* Zoom In */}
      <Button
        variant="ghost"
        size="icon-sm"
        title="Zoom In"
        onClick={onZoomIn}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Button>

      <div className="border-l border-border h-5" />

      {/* Fit to Screen */}
      <Button
        variant="ghost"
        size="icon-sm"
        title="Fit to Screen"
        onClick={onFitToScreen}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      </Button>

      {/* Auto Layout */}
      {onAutoLayout && (
        <>
          <div className="border-l border-border h-5" />
          <Button
            variant="ghost"
            size="icon-sm"
            title="Auto Layout"
            onClick={onAutoLayout}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
              />
            </svg>
          </Button>
        </>
      )}
    </div>
  );
}
