"use client";

import Editor, { BeforeMount } from '@monaco-editor/react';
import { registerCairoLanguage } from './cairoLanguage';
import { useTheme } from '@/context/ThemeContext';

interface CairoEditorProps {
  code: string;
}

export default function CairoEditor({ code }: CairoEditorProps) {
  const { theme } = useTheme();

  const handleBeforeMount: BeforeMount = (monaco) => {
    registerCairoLanguage(monaco);
  };

  return (
    <Editor
      height="100%"
      language="cairo"
      theme={theme.monacoTheme}
      value={code}
      beforeMount={handleBeforeMount}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        fontSize: 13,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        lineNumbers: 'on',
        wordWrap: 'on',
        tabSize: 4,
      }}
    />
  );
}
