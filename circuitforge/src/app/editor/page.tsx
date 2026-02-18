"use client";

import CircuitEditor from '@/components/CircuitEditor';
import { ThemeProvider } from '@/context/ThemeContext';

export default function EditorPage() {
  return (
    <ThemeProvider>
      <CircuitEditor />
    </ThemeProvider>
  );
}
