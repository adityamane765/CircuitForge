"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { tourSteps } from './tourSteps';
import { useTheme } from '@/context/ThemeContext';

const OVERLAY_Z = 60;
const TOOLTIP_Z = 61;
const PADDING = 8; // padding around highlighted element

/** Get the current CSS zoom factor applied to <html> */
function getZoom(): number {
  const raw = (document.documentElement.style as any).zoom;
  const z = parseFloat(raw);
  return z && z > 0 ? z : 1;
}

interface TourOverlayProps {
  /** Show the tour when true */
  forceShow?: boolean;
  /** Called when the tour finishes or is skipped */
  onComplete?: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const TourOverlay: React.FC<TourOverlayProps> = ({ forceShow = false, onComplete }) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);

  // Show/hide based on forceShow prop; reset to step 0 when opening
  useEffect(() => {
    if (forceShow) {
      setCurrentStep(0);
      // Small delay so the layout has rendered
      const timer = setTimeout(() => setVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [forceShow]);

  // Measure the target element whenever the step changes
  useEffect(() => {
    if (!visible) return;

    const step = tourSteps[currentStep];
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      const z = getZoom();
      setTargetRect({
        top: rect.top / z - PADDING,
        left: rect.left / z - PADDING,
        width: rect.width / z + PADDING * 2,
        height: rect.height / z + PADDING * 2,
      });
    } else {
      setTargetRect(null);
    }
  }, [visible, currentStep]);

  // Also update on window resize
  useEffect(() => {
    if (!visible) return;
    const handleResize = () => {
      const step = tourSteps[currentStep];
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const z = getZoom();
        setTargetRect({
          top: rect.top / z - PADDING,
          left: rect.left / z - PADDING,
          width: rect.width / z + PADDING * 2,
          height: rect.height / z + PADDING * 2,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [visible, currentStep]);

  const finish = useCallback(() => {
    setVisible(false);
    onComplete?.();
  }, [onComplete]);

  const handleNext = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      finish();
    }
  }, [currentStep, finish]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  }, [currentStep]);

  // Keyboard: ArrowRight/Enter = next, ArrowLeft = back, Escape = skip
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext();
      else if (e.key === 'ArrowLeft') handleBack();
      else if (e.key === 'Escape') finish();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, handleNext, handleBack, finish]);

  if (!visible) return null;

  const step = tourSteps[currentStep];
  const isLast = currentStep === tourSteps.length - 1;

  // Compute tooltip position relative to targetRect
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) {
      // Fallback: center of screen
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const tooltipWidth = 320;
    const gap = 16;
    const style: React.CSSProperties = { position: 'fixed', width: tooltipWidth };

    switch (step.placement) {
      case 'right':
        style.top = targetRect.top + targetRect.height / 2;
        style.left = targetRect.left + targetRect.width + gap;
        style.transform = 'translateY(-50%)';
        break;
      case 'left':
        style.top = targetRect.top + targetRect.height / 2;
        style.left = targetRect.left - tooltipWidth - gap;
        style.transform = 'translateY(-50%)';
        break;
      case 'bottom':
        style.top = targetRect.top + targetRect.height + gap;
        style.left = targetRect.left + targetRect.width / 2;
        style.transform = 'translateX(-50%)';
        break;
      case 'top':
        style.top = targetRect.top - gap;
        style.left = targetRect.left + targetRect.width / 2;
        style.transform = 'translate(-50%, -100%)';
        break;
    }

    return style;
  };

  return (
    <>
      {/* Dark overlay with cutout using clip-path */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: OVERLAY_Z,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          // If we have a target, punch a hole using clip-path (polygon with hole)
          clipPath: targetRect
            ? `polygon(
                0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
                ${targetRect.left}px ${targetRect.top}px,
                ${targetRect.left}px ${targetRect.top + targetRect.height}px,
                ${targetRect.left + targetRect.width}px ${targetRect.top + targetRect.height}px,
                ${targetRect.left + targetRect.width}px ${targetRect.top}px,
                ${targetRect.left}px ${targetRect.top}px
              )`
            : undefined,
          pointerEvents: 'auto',
        }}
        onClick={handleNext}
      />

      {/* Spotlight border (subtle glow around cutout) */}
      {targetRect && (
        <div
          style={{
            position: 'fixed',
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            zIndex: OVERLAY_Z,
            border: `2px solid ${theme.accent}`,
            borderRadius: 8,
            pointerEvents: 'none',
            boxShadow: `0 0 20px ${theme.accent}40`,
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        style={{
          ...getTooltipStyle(),
          zIndex: TOOLTIP_Z,
          backgroundColor: theme.bgSecondary,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Step counter */}
        <div style={{ color: theme.textMuted, fontSize: 12, marginBottom: 4 }}>
          Step {currentStep + 1} of {tourSteps.length}
        </div>

        {/* Title */}
        <h3 style={{ color: theme.textAccent, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          {step.title}
        </h3>

        {/* Description */}
        <p style={{ color: theme.text, fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
          {step.description}
        </p>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={finish}
            style={{
              color: theme.textMuted,
              fontSize: 13,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
            }}
          >
            Skip tour
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                style={{
                  backgroundColor: theme.btnBg,
                  color: theme.btnText,
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 14px',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              style={{
                backgroundColor: theme.accent,
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 14px',
                fontSize: 13,
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              {isLast ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TourOverlay;
