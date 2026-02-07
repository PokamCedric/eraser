'use client';

import dynamic from 'next/dynamic';

import type { Entity } from '@/domain/entities/Entity';
import type { Relationship } from '@/domain/entities/Relationship';

const ERPDiagram = dynamic(
  () => import('./Diagram/ERPDiagram').then((mod) => mod.ERPDiagram),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    ),
  }
);

interface DiagramPanelProps {
  entities: Entity[];
  relationships: Relationship[];
}

/**
 * Diagram Panel component
 *
 * Wrapper for the ERPDiagram with loading state
 */
export function DiagramPanel({ entities, relationships }: DiagramPanelProps) {
  return (
    <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900">
      <ERPDiagram entities={entities} relationships={relationships} />
    </div>
  );
}
