"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeName = 'midnight' | 'monokai' | 'solarized' | 'light';

export interface AppTheme {
  name: ThemeName;
  label: string;
  // App chrome
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  border: string;
  text: string;
  textMuted: string;
  textAccent: string;
  // Header
  headerBg: string;
  // Buttons
  btnBg: string;
  btnHover: string;
  btnText: string;
  // Accent
  accent: string;
  accentHover: string;
  // Status colors
  green: string;
  red: string;
  yellow: string;
  // Monaco theme name
  monacoTheme: string;
  // Blockly
  blocklyWorkspaceBg: string;
  blocklyToolboxBg: string;
  blocklyToolboxFg: string;
  blocklyFlyoutBg: string;
  blocklyGridColor: string;
  // Block colors (hue values 0-360 for Blockly)
  blockInputColor: string;
  blockArithmeticColor: string;
  blockHashColor: string;
  blockLogicColor: string;
  blockConstraintColor: string;
  blockOutputColor: string;
}

const themes: Record<ThemeName, AppTheme> = {
  midnight: {
    name: 'midnight',
    label: 'Midnight',
    bg: '#0f0f1a',
    bgSecondary: '#1a1a2e',
    bgTertiary: '#16213e',
    border: '#2a2a4a',
    text: '#e0e0ff',
    textMuted: '#8888aa',
    textAccent: '#64b5f6',
    headerBg: '#141428',
    btnBg: '#252545',
    btnHover: '#303060',
    btnText: '#e0e0ff',
    accent: '#5c6bc0',
    accentHover: '#7986cb',
    green: '#66bb6a',
    red: '#ef5350',
    yellow: '#ffca28',
    monacoTheme: 'vs-dark',
    blocklyWorkspaceBg: '#0f0f1a',
    blocklyToolboxBg: '#1a1a2e',
    blocklyToolboxFg: '#e0e0ff',
    blocklyFlyoutBg: '#151530',
    blocklyGridColor: '#2a2a4a',
    blockInputColor: '#7c4dff',
    blockArithmeticColor: '#448aff',
    blockHashColor: '#00bfa5',
    blockLogicColor: '#ff6e40',
    blockConstraintColor: '#ff5252',
    blockOutputColor: '#ffab40',
  },
  monokai: {
    name: 'monokai',
    label: 'Monokai',
    bg: '#272822',
    bgSecondary: '#2e2e25',
    bgTertiary: '#3e3d32',
    border: '#4e4e3e',
    text: '#f8f8f2',
    textMuted: '#75715e',
    textAccent: '#a6e22e',
    headerBg: '#1e1f1c',
    btnBg: '#3e3d32',
    btnHover: '#4e4d42',
    btnText: '#f8f8f2',
    accent: '#a6e22e',
    accentHover: '#b6f22e',
    green: '#a6e22e',
    red: '#f92672',
    yellow: '#e6db74',
    monacoTheme: 'vs-dark',
    blocklyWorkspaceBg: '#272822',
    blocklyToolboxBg: '#2e2e25',
    blocklyToolboxFg: '#f8f8f2',
    blocklyFlyoutBg: '#2a2b22',
    blocklyGridColor: '#3e3d32',
    blockInputColor: '#ae81ff',
    blockArithmeticColor: '#66d9ef',
    blockHashColor: '#a6e22e',
    blockLogicColor: '#e6db74',
    blockConstraintColor: '#f92672',
    blockOutputColor: '#fd971f',
  },
  solarized: {
    name: 'solarized',
    label: 'Solarized',
    bg: '#002b36',
    bgSecondary: '#073642',
    bgTertiary: '#0a4050',
    border: '#586e75',
    text: '#93a1a1',
    textMuted: '#657b83',
    textAccent: '#268bd2',
    headerBg: '#001f28',
    btnBg: '#073642',
    btnHover: '#0a4a5a',
    btnText: '#93a1a1',
    accent: '#268bd2',
    accentHover: '#2aa2f5',
    green: '#859900',
    red: '#dc322f',
    yellow: '#b58900',
    monacoTheme: 'vs-dark',
    blocklyWorkspaceBg: '#002b36',
    blocklyToolboxBg: '#073642',
    blocklyToolboxFg: '#93a1a1',
    blocklyFlyoutBg: '#003847',
    blocklyGridColor: '#094555',
    blockInputColor: '#6c71c4',
    blockArithmeticColor: '#268bd2',
    blockHashColor: '#2aa198',
    blockLogicColor: '#d33682',
    blockConstraintColor: '#cb4b16',
    blockOutputColor: '#b58900',
  },
  light: {
    name: 'light',
    label: 'Light',
    bg: '#ffffff',
    bgSecondary: '#f5f5f5',
    bgTertiary: '#e8e8e8',
    border: '#d0d0d0',
    text: '#1a1a1a',
    textMuted: '#666666',
    textAccent: '#1976d2',
    headerBg: '#f0f0f0',
    btnBg: '#e0e0e0',
    btnHover: '#d0d0d0',
    btnText: '#1a1a1a',
    accent: '#1976d2',
    accentHover: '#1565c0',
    green: '#2e7d32',
    red: '#c62828',
    yellow: '#f9a825',
    monacoTheme: 'vs',
    blocklyWorkspaceBg: '#ffffff',
    blocklyToolboxBg: '#f0f0f0',
    blocklyToolboxFg: '#1a1a1a',
    blocklyFlyoutBg: '#f5f5f5',
    blocklyGridColor: '#e0e0e0',
    blockInputColor: '#9c27b0',
    blockArithmeticColor: '#1976d2',
    blockHashColor: '#2e7d32',
    blockLogicColor: '#e65100',
    blockConstraintColor: '#c62828',
    blockOutputColor: '#ef6c00',
  },
};

interface ThemeContextValue {
  theme: AppTheme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  allThemes: { name: ThemeName; label: string }[];
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: themes.midnight,
  themeName: 'midnight',
  setTheme: () => {},
  allThemes: [],
});

export const useTheme = () => useContext(ThemeContext);

const STORAGE_KEY = 'circuitforge_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>('midnight');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    if (stored && themes[stored]) {
      setThemeName(stored);
    }
  }, []);

  const setTheme = (name: ThemeName) => {
    setThemeName(name);
    localStorage.setItem(STORAGE_KEY, name);
  };

  const allThemes = Object.values(themes).map(t => ({ name: t.name, label: t.label }));

  return (
    <ThemeContext.Provider value={{ theme: themes[themeName], themeName, setTheme, allThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { themes };
