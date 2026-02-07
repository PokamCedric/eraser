'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { DSLParserAdapter } from '@/infrastructure/parsers/DSLParserAdapter';
import { DEFAULT_DSL } from '@/data/default_data';

import type { Entity } from '@/domain/entities/Entity';
import type { Relationship } from '@/domain/entities/Relationship';
import type { ParseError } from '@/domain/repositories/IDSLParser';

export interface DSLSyncState {
  dslContent: string;
  entities: Entity[];
  relationships: Relationship[];
  isValid: boolean;
  errors: string[];
  hasPendingChanges: boolean;
  tableCount: number;
  columnCount: number;
}

export interface UseDSLSyncResult {
  state: DSLSyncState;
  setDslContent: (content: string) => void;
  handleDSLChange: (newContent: string) => void;
  handleApplyChanges: () => Promise<void>;
  handleDiscardChanges: () => void;
  handleReset: () => void;
}

/**
 * Hook for managing DSL content synchronization with diagram entities
 */
export function useDSLSync(): UseDSLSyncResult {
  const [dslContent, setDslContent] = useState<string>(DEFAULT_DSL);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [hasPendingChanges, setHasPendingChanges] = useState<boolean>(false);

  const lastAppliedDSLRef = useRef<string>(DEFAULT_DSL);
  const parserRef = useRef<DSLParserAdapter | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize parser
  useEffect(() => {
    parserRef.current = new DSLParserAdapter();

    // Parse initial DSL
    const parseInitial = async () => {
      if (parserRef.current) {
        const result = await parserRef.current.parseDSL(DEFAULT_DSL);
        if (result.errors.length === 0) {
          setEntities(result.entities);
          setRelationships(result.relationships);
          setIsValid(true);
          lastAppliedDSLRef.current = DEFAULT_DSL;
        }
      }
    };

    parseInitial();

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Debounced parsing when DSL content changes
  const handleDSLChange = useCallback((newContent: string) => {
    setDslContent(newContent);

    const hasChanges = newContent !== lastAppliedDSLRef.current;
    setHasPendingChanges(hasChanges);

    // Debounce validation
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      if (parserRef.current) {
        const result = await parserRef.current.parseDSL(newContent);

        if (result.errors.length > 0) {
          setErrors(result.errors.map((e: ParseError) => `Line ${e.line}: ${e.message}`));
          setIsValid(false);
        } else {
          setErrors([]);
          setIsValid(true);
          // Auto-apply changes when valid
          setEntities(result.entities);
          setRelationships(result.relationships);
          lastAppliedDSLRef.current = newContent;
          setHasPendingChanges(false);
        }
      }
    }, 300);
  }, []);

  // Apply DSL changes manually
  const handleApplyChanges = useCallback(async () => {
    if (!parserRef.current) return;

    setErrors([]);

    const result = await parserRef.current.parseDSL(dslContent);

    if (result.errors.length > 0) {
      setErrors(result.errors.map((e: ParseError) => `Line ${e.line}: ${e.message}`));
      setIsValid(false);
      return;
    }

    setEntities(result.entities);
    setRelationships(result.relationships);
    setIsValid(true);
    lastAppliedDSLRef.current = dslContent;
    setHasPendingChanges(false);
  }, [dslContent]);

  // Discard pending changes
  const handleDiscardChanges = useCallback(() => {
    setDslContent(lastAppliedDSLRef.current);
    setHasPendingChanges(false);
    setErrors([]);
    setIsValid(true);
  }, []);

  // Reset to default DSL
  const handleReset = useCallback(async () => {
    setDslContent(DEFAULT_DSL);
    setHasPendingChanges(false);
    setErrors([]);

    if (parserRef.current) {
      const result = await parserRef.current.parseDSL(DEFAULT_DSL);
      if (result.errors.length === 0) {
        setEntities(result.entities);
        setRelationships(result.relationships);
        setIsValid(true);
        lastAppliedDSLRef.current = DEFAULT_DSL;
      }
    }
  }, []);

  // Calculate counts
  const tableCount = entities.length;
  const columnCount = entities.reduce((acc, e) => acc + e.fields.length, 0);

  return {
    state: {
      dslContent,
      entities,
      relationships,
      isValid,
      errors,
      hasPendingChanges,
      tableCount,
      columnCount,
    },
    setDslContent,
    handleDSLChange,
    handleApplyChanges,
    handleDiscardChanges,
    handleReset,
  };
}
