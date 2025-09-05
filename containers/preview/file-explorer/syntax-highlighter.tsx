"use client";

import { PrismLight as PrismHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
// Register common Prism languages for the light build
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import scss from 'react-syntax-highlighter/dist/esm/languages/prism/scss';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import docker from 'react-syntax-highlighter/dist/esm/languages/prism/docker';
import ini from 'react-syntax-highlighter/dist/esm/languages/prism/ini';
import toml from 'react-syntax-highlighter/dist/esm/languages/prism/toml';

PrismHighlighter.registerLanguage('javascript', javascript);
PrismHighlighter.registerLanguage('jsx', jsx);
PrismHighlighter.registerLanguage('typescript', typescript);
PrismHighlighter.registerLanguage('tsx', tsx);
PrismHighlighter.registerLanguage('bash', bash);
PrismHighlighter.registerLanguage('json', json);
PrismHighlighter.registerLanguage('css', css);
PrismHighlighter.registerLanguage('scss', scss);
PrismHighlighter.registerLanguage('markup', markup); // html
PrismHighlighter.registerLanguage('yaml', yaml);
PrismHighlighter.registerLanguage('markdown', markdown);
PrismHighlighter.registerLanguage('go', go);
PrismHighlighter.registerLanguage('rust', rust);
PrismHighlighter.registerLanguage('python', python);
PrismHighlighter.registerLanguage('java', java);
PrismHighlighter.registerLanguage('csharp', csharp);
PrismHighlighter.registerLanguage('cpp', cpp);
PrismHighlighter.registerLanguage('sql', sql);
PrismHighlighter.registerLanguage('docker', docker);
PrismHighlighter.registerLanguage('ini', ini);
PrismHighlighter.registerLanguage('toml', toml);

export function SyntaxHighlighter(props: { path: string; code: string }) {
  const { theme } = useTheme();
  const lang = detectLanguageFromFilename(props.path);

  // Use oneDark for dark mode and oneLight for light mode
  const style = theme === 'dark' ? oneDark : oneLight;

  return (
    <div style={{ height: '100%', width: '100%', overflow: 'auto' }}>
      <PrismHighlighter
        language={lang ?? 'javascript'}
        style={style}
        showLineNumbers
        showInlineLineNumbers
        customStyle={{
          fontSize: '0.875rem',
          margin: 0,
          background: 'transparent',
          fontFamily: 'var(--font-mono)',
          height: '100%',
          overflow: 'visible',
          minWidth: '100%',
        }}
        codeTagProps={{
          style: {
            whiteSpace: 'pre',
            display: 'inline-block',
            minWidth: '100%',
          },
        }}
      >
        {props.code}
      </PrismHighlighter>
    </div>
  );
}

function detectLanguageFromFilename(path: string): string {
  const pathParts = path.split('/');
  const extension = pathParts[pathParts.length - 1]
    ?.split('.')
    .pop()
    ?.toLowerCase();

  const extensionMap: Record<string, string> = {
    // JavaScript/TypeScript
    js: 'jsx',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    mjs: 'javascript',
    cjs: 'javascript',

    // Python
    py: 'python',
    pyw: 'python',
    pyi: 'python',

    // Web technologies
    html: 'markup',
    htm: 'markup',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',

    // Other popular languages
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cxx: 'cpp',
    cc: 'cpp',
    h: 'c',
    hpp: 'cpp',
    cs: 'csharp',
    php: 'php',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
    sh: 'bash',
    bash: 'bash',
    zsh: 'bash',
    fish: 'bash',
    ps1: 'powershell',

    // Data formats
    json: 'json',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    toml: 'toml',
    ini: 'ini',

    // Markup
    md: 'markdown',
    markdown: 'markdown',
    tex: 'latex',

    // Database
    sql: 'sql',

    // Config files
    dockerfile: 'docker',
    gitignore: 'bash',
    env: 'bash',
  };

  return extensionMap[extension || ''] || 'text';
}
