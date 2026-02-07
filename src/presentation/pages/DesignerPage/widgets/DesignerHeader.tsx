'use client';

import { Code2, FileDown, LayoutGrid, PanelLeftClose, RotateCcw } from 'lucide-react';

import { Button } from '@/lib/components/ui/button';
import { cn } from '@/lib/utils';

export type ViewMode = 'diagram' | 'split' | 'dsl';

interface DesignerHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onExportDSL: () => void;
  onReset: () => void;
}

/**
 * Designer Header component
 *
 * Contains logo, view mode toggle, and action buttons.
 * Inspired by Power Apps design.
 */
export function DesignerHeader({
  viewMode,
  onViewModeChange,
  onExportDSL,
  onReset,
}: DesignerHeaderProps) {
  const viewModes: { value: ViewMode; label: string; icon: React.ReactNode }[] = [
    {
      value: 'diagram',
      label: 'Diagram',
      icon: <LayoutGrid className="size-4" />,
    },
    {
      value: 'split',
      label: 'Split',
      icon: <PanelLeftClose className="size-4" />,
    },
    {
      value: 'dsl',
      label: 'Code',
      icon: <Code2 className="size-4" />,
    },
  ];

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
      {/* Logo / Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <svg
            className="w-8 h-8 text-blue-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 7h4M7 10v4M17 10v4M10 17h4"
            />
          </svg>
          <span className="text-lg font-semibold text-white">Eraser</span>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">ERP Visual Designer</span>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center bg-slate-800 rounded-lg p-1">
        {viewModes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => onViewModeChange(mode.value)}
            className={cn(
              'flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              viewMode === mode.value
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            )}
          >
            {mode.icon}
            <span className="hidden sm:inline">{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <RotateCcw className="size-4 mr-1.5" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportDSL}
          className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600"
        >
          <FileDown className="size-4 mr-1.5" />
          <span className="hidden sm:inline">Export DSL</span>
        </Button>
      </div>
    </header>
  );
}
