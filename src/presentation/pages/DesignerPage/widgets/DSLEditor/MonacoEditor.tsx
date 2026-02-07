'use client';

import { useEffect, useRef } from 'react';

import { EditorColors } from './editorColors';

import type * as Monaco from 'monaco-editor';

// Declare global window extensions for Monaco CDN
declare global {
  interface Window {
    monaco?: typeof Monaco;
    require?: {
      config: (config: { paths: Record<string, string> }) => void;
      (modules: string[], callback: () => void): void;
    };
  }
}

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function MonacoEditor({ value, onChange, readOnly = false }: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const editorInstanceRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  // Function to update Monaco theme based on current mode
  const updateMonacoTheme = (monaco: typeof Monaco) => {
    const isDark = document.documentElement.classList.contains('dark');

    monaco.editor.defineTheme('eraser-theme', {
      base: isDark ? 'vs-dark' : 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: EditorColors.comment.toHex().substring(1) },
        { token: 'keyword', foreground: EditorColors.keyword.toHex().substring(1), fontStyle: 'bold' },
        { token: 'type', foreground: EditorColors.type.toHex().substring(1) },
        { token: 'decorator', foreground: EditorColors.decorator.toHex().substring(1), fontStyle: 'bold' },
        { token: 'metadata', foreground: EditorColors.metadata.toHex().substring(1) },
        { token: 'string', foreground: EditorColors.string.toHex().substring(1) },
        { token: 'number', foreground: EditorColors.number.toHex().substring(1) },
        { token: 'operator', foreground: EditorColors.operator.toHex().substring(1) },
        { token: 'identifier', foreground: EditorColors.identifier.toHex().substring(1) },
        { token: 'function', foreground: EditorColors.function.toHex().substring(1) },
        { token: 'constant', foreground: EditorColors.constant.toHex().substring(1) },
      ],
      colors: {
        'editor.background': EditorColors.background.toHex(),
        'editor.foreground': EditorColors.foreground.toHex(),
        'editor.lineHighlightBackground': EditorColors.lineHighlight.toHex(),
        'editorLineNumber.foreground': EditorColors.lineNumber.toHex(),
        'editorCursor.foreground': EditorColors.cursor.toHex(),
        'editor.selectionBackground': EditorColors.selection.toHex(),
        'editorWidget.background': EditorColors.background.toHex(),
        'editorWidget.border': EditorColors.border.toHex(),
      },
    });

    // Apply theme to editor instance if it exists
    if (editorInstanceRef.current) {
      monaco.editor.setTheme('eraser-theme');
    }
  };

  useEffect(() => {
    let isSubscribed = true;
    let observer: MutationObserver | null = null;

    // Load Monaco Editor dynamically
    const initMonaco = async () => {
      if (typeof window === 'undefined') return;

      // Load Monaco from CDN
      if (!window.monaco) {
        // Check if loader script already exists
        const existingScript = document.querySelector('script[src*="monaco-editor"][src*="loader.js"]');

        if (!existingScript) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs/loader.js';
          script.async = true;

          await new Promise<void>((resolve) => {
            script.onload = () => resolve();
            document.head.appendChild(script);
          });
        } else {
          // Wait for existing loader to be ready
          await new Promise<void>((resolve) => {
            const checkReady = setInterval(() => {
              if (typeof window.require !== 'undefined') {
                clearInterval(checkReady);
                resolve();
              }
            }, 50);
            setTimeout(() => {
              clearInterval(checkReady);
              resolve();
            }, 5000);
          });
        }

        // Configure Monaco loader
        if (window.require) {
          window.require.config({
            paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' },
          });

          await new Promise<void>((resolve) => {
            window.require(['vs/editor/editor.main'], () => resolve());
          });
        }
      }

      if (!isSubscribed) return;

      const monaco = window.monaco as typeof Monaco;
      monacoRef.current = monaco;

      // Register DSL language
      if (!monaco.languages.getLanguages().some((lang: { id: string }) => lang.id === 'eraser-dsl')) {
        monaco.languages.register({ id: 'eraser-dsl' });

        // Set up syntax highlighting
        monaco.languages.setMonarchTokensProvider('eraser-dsl', {
          tokenizer: {
            root: [
              [/\/\/.*$/, 'comment'],
              [/@\w+/, 'decorator'],
              [/\b(string|int|bool|timestamp|datetime|num|double|text|decimal|enum|uuid|date|boolean|json)\b/, 'type'],
              [/\b(true|false|now)\b/, 'keyword'],
              [/\[([^\]]+)\]/, 'metadata'],
              [/\{|\}/, 'delimiter.bracket'],
              [/->|-|>|<>|</, 'operator'],
              [/"([^"]*)"/, 'string'],
              [/\b\d+\b/, 'number'],
            ],
          },
        });

        // Initialize theme
        updateMonacoTheme(monaco);
      }

      // Create editor instance
      if (editorRef.current && !editorInstanceRef.current) {
        const editor = monaco.editor.create(editorRef.current, {
          value,
          language: 'eraser-dsl',
          theme: 'eraser-theme',
          automaticLayout: true,
          fontSize: 14,
          fontFamily: "'Fira Code', 'Consolas', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          folding: true,
          wordWrap: 'on',
          readOnly,
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
          },
          padding: {
            top: 16,
            bottom: 16,
          },
        });

        editorInstanceRef.current = editor;

        // Listen for changes
        editor.onDidChangeModelContent(() => {
          const currentValue = editor.getValue();
          onChange(currentValue);
        });
      }

      // Set up MutationObserver to watch for theme changes
      observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            requestAnimationFrame(() => {
              if (monacoRef.current) {
                updateMonacoTheme(monacoRef.current);
              }
            });
          }
        });
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    };

    initMonaco();

    return () => {
      isSubscribed = false;
      if (observer) {
        observer.disconnect();
      }
      if (editorInstanceRef.current) {
        editorInstanceRef.current.dispose();
        editorInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update editor value when prop changes
  useEffect(() => {
    if (editorInstanceRef.current) {
      const currentValue = editorInstanceRef.current.getValue();
      if (currentValue !== value) {
        editorInstanceRef.current.setValue(value);
      }
    }
  }, [value]);

  return <div ref={editorRef} className="w-full h-full" style={{ minHeight: '400px' }} />;
}
