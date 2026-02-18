"use client";

import { useEffect, useState } from 'react';

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // Apply zoom to html element for editor pages
    (html.style as any).zoom = '0.8';
    html.style.overflow = 'hidden';
    body.style.height = '125vh';
    body.style.overflow = 'hidden';

    // Signal that zoom is applied so children render with correct measurements
    setReady(true);

    return () => {
      (html.style as any).zoom = '';
      html.style.overflow = '';
      body.style.height = '';
      body.style.overflow = '';
    };
  }, []);

  // Don't render children until zoom is applied — prevents Blockly from measuring at wrong scale
  if (!ready) {
    return <div style={{ height: '100vh', background: '#0f0f1a' }} />;
  }

  return <>{children}</>;
}
