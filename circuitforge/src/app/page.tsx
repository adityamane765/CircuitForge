"use client";

import CircuitEditor from '@/components/CircuitEditor';
import { ThemeProvider } from '@/context/ThemeContext';

export default function Home() {
  return (
    <ThemeProvider>
      <CircuitEditor />
    </ThemeProvider>
  );
}