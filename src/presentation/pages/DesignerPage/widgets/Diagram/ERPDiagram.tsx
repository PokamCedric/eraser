'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

import { ZoomControls } from './ZoomControls';
import { CanvasRendererAdapter } from '@/infrastructure/renderers/CanvasRendererAdapter';
import { IconLoader } from '@/infrastructure/renderers/IconLoader';

import type { Entity } from '@/domain/entities/Entity';
import type { Relationship } from '@/domain/entities/Relationship';

interface ERPDiagramProps {
  entities: Entity[];
  relationships: Relationship[];
}

/**
 * ERP Diagram component
 *
 * Renders entities and relationships on a canvas using
 * the existing CanvasRendererAdapter from the infrastructure layer.
 */
export function ERPDiagram({ entities, relationships }: ERPDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRendererAdapter | null>(null);
  const [zoomPercent, setZoomPercent] = useState(100);

  // Initialize renderer
  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize icon loader
    IconLoader.initialize();

    // Create renderer
    rendererRef.current = new CanvasRendererAdapter(canvasRef.current);

    return () => {
      rendererRef.current = null;
    };
  }, []);

  // Update diagram when entities or relationships change
  useEffect(() => {
    if (!rendererRef.current) return;

    // Set data and render
    rendererRef.current.setData(entities, relationships);

    // Update zoom display
    const zoom = Math.round(rendererRef.current.getZoomLevel() * 100);
    setZoomPercent(zoom);
  }, [entities, relationships]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    if (!rendererRef.current) return;
    rendererRef.current.zoomIn();
    setZoomPercent(Math.round(rendererRef.current.getZoomLevel() * 100));
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!rendererRef.current) return;
    rendererRef.current.zoomOut();
    setZoomPercent(Math.round(rendererRef.current.getZoomLevel() * 100));
  }, []);

  const handleFitToScreen = useCallback(() => {
    if (!rendererRef.current) return;
    rendererRef.current.fitToScreen();
    setZoomPercent(Math.round(rendererRef.current.getZoomLevel() * 100));
  }, []);

  const handleAutoLayout = useCallback(() => {
    if (!rendererRef.current) return;
    rendererRef.current.autoLayout();
    setZoomPercent(Math.round(rendererRef.current.getZoomLevel() * 100));
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-slate-50 dark:bg-slate-900 diagram-grid">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4">
        <ZoomControls
          zoomPercent={zoomPercent}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitToScreen={handleFitToScreen}
          onAutoLayout={handleAutoLayout}
        />
      </div>

      {/* Empty State */}
      {entities.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-muted-foreground">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
              />
            </svg>
            <p className="text-sm">No entities to display</p>
            <p className="text-xs mt-1">Edit the DSL to add entities</p>
          </div>
        </div>
      )}
    </div>
  );
}
