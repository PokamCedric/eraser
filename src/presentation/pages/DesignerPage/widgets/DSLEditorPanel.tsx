'use client';

import { AlertCircle, Check, CheckCircle, Code, Info } from 'lucide-react';
import dynamic from 'next/dynamic';

import { Button } from '@/lib/components/ui/button';

const MonacoEditor = dynamic(
  () => import('./DSLEditor/MonacoEditor').then((mod) => mod.MonacoEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    ),
  }
);

interface DSLEditorPanelProps {
  dslContent: string;
  viewMode: 'dsl' | 'split';
  drawerWidth?: number;
  tableCount: number;
  columnCount: number;
  hasDSLChanges: boolean;
  dslValidationErrors: string[];
  isValid: boolean;
  onChange: (content: string) => void;
  onApplyChanges: () => void;
  onDiscardChanges: () => void;
  onResizeStart?: () => void;
}

/**
 * DSL Editor Panel component
 *
 * Inspired by Power Apps EditTablePage design
 */
export function DSLEditorPanel({
  dslContent,
  viewMode,
  drawerWidth = 400,
  tableCount,
  columnCount,
  hasDSLChanges,
  dslValidationErrors,
  isValid,
  onChange,
  onApplyChanges,
  onDiscardChanges,
  onResizeStart,
}: DSLEditorPanelProps) {
  return (
    <>
      {/* Resize Handle - Only show in split mode */}
      {viewMode === 'split' && onResizeStart && (
        <div
          className="absolute top-0 bottom-0 w-2 bg-transparent hover:bg-primary cursor-ew-resize z-30 transition-colors"
          style={{ right: `${drawerWidth}px` }}
          onMouseDown={onResizeStart}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-12 bg-border rounded-full" />
        </div>
      )}

      {/* DSL Editor Drawer */}
      <div
        className={`absolute top-0 bottom-0 right-0 flex flex-col bg-background shadow-2xl z-20 border-l ${
          viewMode === 'dsl' ? 'left-0' : ''
        }`}
        style={viewMode === 'split' ? { width: `${drawerWidth}px` } : {}}
      >
        {/* Editor Header */}
        <div className="px-6 py-3 border-b flex items-center justify-between bg-card">
          <div className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">DSL Editor</span>
            {hasDSLChanges ? (
              <span className="px-2 py-1 bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-medium rounded flex items-center gap-1">
                <Info className="w-3 h-3" aria-hidden="true" />
                Unsaved changes
              </span>
            ) : dslValidationErrors.length > 0 ? (
              <span className="px-2 py-1 bg-destructive/20 text-destructive text-xs font-medium rounded flex items-center gap-1">
                <AlertCircle className="w-3 h-3" aria-hidden="true" />
                Error
              </span>
            ) : isValid ? (
              <span className="px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium rounded flex items-center gap-1">
                <CheckCircle className="w-3 h-3" aria-hidden="true" />
                Valid
              </span>
            ) : null}
          </div>
          <div className="text-xs text-muted-foreground">
            {tableCount} tables • {columnCount} columns
          </div>
        </div>

        {/* Validation Errors */}
        {dslValidationErrors.length > 0 && (
          <div className="bg-destructive/10 border-b border-destructive/20 px-6 py-3 max-h-32 overflow-y-auto">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive mb-1">Validation Errors</p>
                {dslValidationErrors.map((error, idx) => (
                  <p key={idx} className="text-xs text-destructive/80 font-mono">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Apply/Discard Changes Bar */}
        {hasDSLChanges && (
          <div className="bg-muted border-b px-6 py-2 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Changes will be applied after validation</p>
            <div className="flex items-center gap-2">
              <Button onClick={onDiscardChanges} variant="ghost" size="sm">
                Discard
              </Button>
              <Button onClick={onApplyChanges} size="sm" variant="default">
                <Check className="w-3 h-3 mr-1" aria-hidden="true" />
                Apply Changes
              </Button>
            </div>
          </div>
        )}

        {/* Monaco Editor */}
        <div className="flex-1 overflow-hidden">
          <MonacoEditor value={dslContent} onChange={onChange} readOnly={false} />
        </div>
      </div>
    </>
  );
}
