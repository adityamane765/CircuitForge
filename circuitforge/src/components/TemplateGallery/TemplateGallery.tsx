"use client";

import React from 'react';
import { builtInTemplates, TemplateInfo } from '@/templates';
import { useTheme } from '@/context/ThemeContext';

interface TemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (workspaceJson: object) => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ isOpen, onClose, onSelectTemplate }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const handleSelect = (template: TemplateInfo) => {
    onSelectTemplate(template.workspace);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <div className="relative w-full max-w-3xl rounded-lg p-6 shadow-xl" style={{ backgroundColor: theme.bgSecondary }}>
        <button
          className="absolute right-4 top-4 text-xl font-bold"
          style={{ color: theme.textMuted }}
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="mb-6 text-2xl font-bold" style={{ color: theme.text }}>Template Gallery</h2>

        <div className="grid gap-4 md:grid-cols-2">
          {builtInTemplates.map((template) => (
            <div key={template.id} className="rounded-lg border p-4" style={{ borderColor: theme.border, backgroundColor: theme.bgTertiary, color: theme.text }}>
              <h3 className="mb-2 text-xl font-semibold">{template.name}</h3>
              <p className="mb-3 text-sm" style={{ color: theme.textMuted }}>{template.description}</p>
              <div className="mb-4 flex flex-wrap gap-2 text-sm" style={{ color: theme.textMuted }}>
                <span className="rounded-full px-3 py-1" style={{ backgroundColor: theme.btnBg }}>Category: {template.category}</span>
                <span className="rounded-full px-3 py-1" style={{ backgroundColor: theme.btnBg }}>{template.blockCount} blocks</span>
                <span className="rounded-full px-3 py-1" style={{ backgroundColor: theme.btnBg }}>{template.constraintCount} constraints</span>
              </div>
              <button
                className="w-full rounded-md px-4 py-2 font-semibold transition-colors"
                style={{ backgroundColor: theme.accent, color: '#fff' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.accentHover)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.accent)}
                onClick={() => handleSelect(template)}
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;
