'use client';

import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef } from 'react';

// Dynamically import to avoid SSR issues
const Editor = dynamic(
  () => import('@monaco-editor/react').then(m => m.default),
  { ssr: false }
);

export interface MonacoViewerProps {
  path: string;
  code: string;
}

// Minimal mapping to Monaco language IDs
function detectMonacoLanguageFromFilename(path: string): string | undefined {
  const filename = path.split('/').pop() || '';
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  const map: Record<string, string> = {
    // Web
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    json: 'json',
    css: 'css',
    scss: 'scss',
    less: 'less',
    html: 'html',
    md: 'markdown',
    markdown: 'markdown',

    // Popular backends
    py: 'python',
    rb: 'ruby',
    php: 'php',
    go: 'go',
    rs: 'rust',
    java: 'java',
    kt: 'kotlin',
    cs: 'csharp',
    c: 'c',
    h: 'c',
    cpp: 'cpp',
    cxx: 'cpp',
    cc: 'cpp',
    hpp: 'cpp',

    // Scripting
    sh: 'shell',
    bash: 'shell',
    zsh: 'shell',
    ps1: 'powershell',

    // Data / config
    yml: 'yaml',
    yaml: 'yaml',
    toml: 'toml',
    ini: 'ini',
    sql: 'sql',
    xml: 'xml',
    dockerfile: 'dockerfile',
  };

  return map[ext];
}

export function MonacoViewer({ path, code }: MonacoViewerProps) {
  const { theme } = useTheme();
  const language = useMemo(
    () => detectMonacoLanguageFromFilename(path),
    [path]
  );
  const editorRef = useRef<any>(null);

  // Update the model value without recreating the editor for smoother updates
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel?.();
    if (model && model.getValue() !== code) {
      const currentPosition = editor.getPosition?.();
      model.pushEditOperations(
        [],
        [{ range: model.getFullModelRange(), text: code }],
        () => null
      );
      if (currentPosition) editor.setPosition(currentPosition);
    }
  }, [code]);

  return (
    <div className="relative h-full w-full min-w-0">
      <Editor
        theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
        value={code}
        language={language}
        path={path}
        onMount={editor => {
          editorRef.current = editor;
        }}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'off',
          fontSize: 12,
          smoothScrolling: true,
          automaticLayout: true,
          renderWhitespace: 'selection',
          scrollbar: { horizontal: 'auto', vertical: 'auto' },
        }}
        className="h-full w-full"
      />
    </div>
  );
}

export default MonacoViewer;
