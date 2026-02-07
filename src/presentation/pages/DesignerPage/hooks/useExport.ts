'use client';

import { useCallback } from 'react';

import { ExportCodeUseCase } from '@/application/use-cases/ExportCodeUseCase';
import { SQLExporter } from '@/infrastructure/exporters/SQLExporter';
import { TypeScriptExporter } from '@/infrastructure/exporters/TypeScriptExporter';
import { JSONExporter } from '@/infrastructure/exporters/JSONExporter';

import type { Entity } from '@/domain/entities/Entity';
import type { Relationship } from '@/domain/entities/Relationship';

export type ExportFormat = 'dsl' | 'sql' | 'typescript' | 'json';

export interface UseExportResult {
  exportDSL: (dslContent: string) => void;
  exportCode: (format: Exclude<ExportFormat, 'dsl'>, entities: Entity[], relationships: Relationship[]) => void;
  getSupportedFormats: () => ExportFormat[];
}

/**
 * Hook for exporting diagram data in various formats
 */
export function useExport(): UseExportResult {
  // Export DSL content as a text file
  const exportDSL = useCallback((dslContent: string) => {
    const blob = new Blob([dslContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eraser-schema.dsl';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // Export code in various formats (SQL, TypeScript, JSON)
  const exportCode = useCallback(
    (format: Exclude<ExportFormat, 'dsl'>, entities: Entity[], relationships: Relationship[]) => {
      try {
        // Create exporters map
        const exporters = {
          sql: new SQLExporter(),
          typescript: new TypeScriptExporter(),
          json: new JSONExporter(),
        };

        // Create use case
        const exportUseCase = new ExportCodeUseCase(exporters);

        // Execute export - returns string | Blob | Uint8Array
        const result = exportUseCase.execute(format, entities, relationships);

        // Determine file extension and MIME type
        const extensionMap: Record<string, { ext: string; mime: string }> = {
          sql: { ext: 'sql', mime: 'text/sql' },
          typescript: { ext: 'ts', mime: 'text/typescript' },
          json: { ext: 'json', mime: 'application/json' },
        };

        const { ext, mime } = extensionMap[format] || { ext: 'txt', mime: 'text/plain' };

        // Convert result to Blob if it's a string
        let blob: Blob;
        if (typeof result === 'string') {
          blob = new Blob([result], { type: mime });
        } else if (result instanceof Blob) {
          blob = result;
        } else if (result instanceof Uint8Array) {
          // Uint8Array - convert to regular array for Blob compatibility
          blob = new Blob([new Uint8Array(result)], { type: mime });
        } else {
          blob = new Blob([String(result)], { type: mime });
        }

        // Download file
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eraser-schema.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Export failed:', error);
      }
    },
    []
  );

  // Get list of supported export formats
  const getSupportedFormats = useCallback((): ExportFormat[] => {
    return ['dsl', 'sql', 'typescript', 'json'];
  }, []);

  return {
    exportDSL,
    exportCode,
    getSupportedFormats,
  };
}
