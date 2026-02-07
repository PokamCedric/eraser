'use client';

import { useEffect, useState } from 'react';

import { useDSLSync, useExport } from './hooks';
import { DesignerHeader, DiagramPanel, DSLEditorPanel } from './widgets';

import type { ViewMode } from './widgets';

/**
 * DesignerPage - Main presentation component for Eraser
 *
 * Responsibilities:
 * - Orchestrate the ERP visual designer flow
 * - Manage view modes (diagram/split/dsl)
 * - Handle DSL sync with diagram
 * - Manage export functionality
 *
 * Designed to be embeddable via iframe in other applications.
 */
export function DesignerPage() {
  // DSL synchronization
  const { state: dslState, handleDSLChange, handleApplyChanges, handleDiscardChanges, handleReset } = useDSLSync();

  // Export functionality
  const { exportDSL } = useExport();

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [drawerWidth, setDrawerWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Handle drawer resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      setDrawerWidth(Math.max(300, Math.min(800, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // Handle export
  const handleExportDSL = () => {
    exportDSL(dslState.dslContent);
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <DesignerHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExportDSL={handleExportDSL}
        onReset={handleReset}
      />

      {/* Loading State */}
      {!isHydrated && (
        <div className="flex-1 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Loading Eraser...</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {isHydrated && (
        <div className="relative flex-1 min-h-0 overflow-hidden">
          {/* Diagram View */}
          {(viewMode === 'diagram' || viewMode === 'split') && (
            <DiagramPanel
              entities={dslState.entities}
              relationships={dslState.relationships}
            />
          )}

          {/* DSL Editor */}
          {(viewMode === 'dsl' || viewMode === 'split') && (
            <DSLEditorPanel
              dslContent={dslState.dslContent}
              viewMode={viewMode}
              drawerWidth={drawerWidth}
              tableCount={dslState.tableCount}
              columnCount={dslState.columnCount}
              hasDSLChanges={dslState.hasPendingChanges}
              dslValidationErrors={dslState.errors}
              isValid={dslState.isValid}
              onChange={handleDSLChange}
              onApplyChanges={handleApplyChanges}
              onDiscardChanges={handleDiscardChanges}
              onResizeStart={viewMode === 'split' ? () => setIsResizing(true) : undefined}
            />
          )}
        </div>
      )}
    </div>
  );
}
