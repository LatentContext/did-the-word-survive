import React, { useState, useEffect, useRef } from 'react';
import {
  Accessibility,
  Sun,
  Moon,
  Type,
  Contrast,
  RotateCcw,
  X,
  Check
} from 'lucide-react';

interface AccessibilityWidgetProps {
  isDark: boolean;
  onToggleTheme?: () => void;
  onSetTheme: (isDark: boolean) => void;
}

export type ColorMode = 'color' | 'grayscale' | 'contrast';
export type FontSize = 'normal' | 'large' | 'xlarge';

export const AccessibilityWidget: React.FC<AccessibilityWidgetProps> = ({
  isDark,
  onToggleTheme,
  onSetTheme,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Color mode state: 'color' (default) | 'grayscale' | 'contrast'
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('accessibility_color_mode');
      if (stored === 'grayscale' || stored === 'contrast') return stored;
    }
    return 'color';
  });

  // Font size state: 'normal' (default, 16px) | 'large' (18px) | 'xlarge' (20px)
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('accessibility_font_size');
      if (stored === 'large' || stored === 'xlarge') return stored;
    }
    return 'normal';
  });

  // Apply color mode changes to document.documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('grayscale-mode', 'high-contrast-mode');

    if (colorMode === 'grayscale') {
      root.classList.add('grayscale-mode');
    } else if (colorMode === 'contrast') {
      root.classList.add('high-contrast-mode');
    }

    localStorage.setItem('accessibility_color_mode', colorMode);
  }, [colorMode]);

  // Apply font size scaling to document.documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (fontSize === 'large') {
      root.style.fontSize = '18px';
    } else if (fontSize === 'xlarge') {
      root.style.fontSize = '20px';
    } else {
      root.style.fontSize = '16px';
    }

    localStorage.setItem('accessibility_font_size', fontSize);
  }, [fontSize]);

  // Close panel on outside click or Esc key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleReset = () => {
    onSetTheme(false); // default to white / light mode
    setColorMode('color');
    setFontSize('normal');
  };

  const isCustomized = isDark || colorMode !== 'color' || fontSize !== 'normal';

  return (
    <div
      ref={panelRef}
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 print:hidden"
      aria-label="Accessibility & Display Controls"
    >
      {/* ── Flyout Accessibility Menu ── */}
      {isOpen && (
        <div className="w-80 sm:w-88 rounded-2xl bg-white dark:bg-[#161B22] border-2 border-[#88DFF2] shadow-2xl p-5 mb-2 anim-scale-in text-[#14213D] dark:text-white">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#D6EDF8] dark:border-[#2A3F54]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#88DFF2]/20 flex items-center justify-center text-[#0284C7] dark:text-[#88DFF2]">
                <Accessibility className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">Display & Accessibility</h3>
                <span className="text-[10px] text-[#5A7086] dark:text-[#7A9BB8]">Reading & visual enhancements</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isCustomized && (
                <button
                  onClick={handleReset}
                  className="px-2 py-1 rounded text-[11px] font-semibold text-[#5A7086] dark:text-[#7A9BB8] hover:text-[#F65936] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Reset all settings to default"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#5A7086] dark:text-[#7A9BB8] cursor-pointer"
                aria-label="Close accessibility menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="py-4 space-y-4 text-xs">
            {/* 1. Theme Mode: Light (Default) vs Dark */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold flex items-center gap-1.5 text-[#14213D] dark:text-white">
                  {isDark ? <Moon className="w-3.5 h-3.5 text-[#88DFF2]" /> : <Sun className="w-3.5 h-3.5 text-[#F2C53D]" />}
                  <span>Color Theme</span>
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#88DFF2]/15 text-[#0284C7] dark:text-[#88DFF2]">
                  {isDark ? 'Dark Mode' : 'Light (Default)'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onSetTheme(false)}
                  className={`py-2 px-3 rounded-xl font-semibold border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    !isDark
                      ? 'border-[#0284C7] bg-[#F0F8FF] text-[#0F172A] shadow-xs font-bold ring-2 ring-[#0284C7]/30'
                      : 'border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] dark:text-[#7A9BB8] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-[#F2C53D]" />
                  <span>Light Mode</span>
                  {!isDark && <Check className="w-3 h-3 text-[#0284C7]" />}
                </button>

                <button
                  onClick={() => onSetTheme(true)}
                  className={`py-2 px-3 rounded-xl font-semibold border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isDark
                      ? 'border-[#88DFF2] bg-[#88DFF2]/20 text-[#88DFF2] shadow-xs font-bold ring-2 ring-[#88DFF2]/30'
                      : 'border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] dark:text-[#7A9BB8] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-[#88DFF2]" />
                  <span>Dark Mode</span>
                  {isDark && <Check className="w-3 h-3 text-[#88DFF2]" />}
                </button>
              </div>
            </div>

            {/* 2. Color / Reading Mode: Full Color vs Grayscale vs Contrast */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold flex items-center gap-1.5 text-[#14213D] dark:text-white">
                  <Contrast className="w-3.5 h-3.5 text-[#F294C8]" />
                  <span>Visual Filter</span>
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[#5A7086] dark:text-[#7A9BB8]">
                  {colorMode === 'grayscale' ? 'Grayscale Active' : colorMode === 'contrast' ? 'High Contrast' : 'Full Color'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setColorMode('color')}
                  className={`py-2 px-2 rounded-xl text-center font-semibold border text-[11px] cursor-pointer transition-all ${
                    colorMode === 'color'
                      ? 'border-[#64BF56] bg-[#64BF56]/15 text-[#14213D] dark:text-[#64BF56] font-bold'
                      : 'border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] dark:text-[#7A9BB8] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  Full Color
                </button>

                <button
                  onClick={() => setColorMode('grayscale')}
                  className={`py-2 px-2 rounded-xl text-center font-semibold border text-[11px] cursor-pointer transition-all ${
                    colorMode === 'grayscale'
                      ? 'border-slate-500 bg-slate-500/20 text-[#14213D] dark:text-white font-bold ring-2 ring-slate-400'
                      : 'border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] dark:text-[#7A9BB8] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  title="Converts all colors to black & white for ease of reading"
                >
                  Grayscale
                </button>

                <button
                  onClick={() => setColorMode('contrast')}
                  className={`py-2 px-2 rounded-xl text-center font-semibold border text-[11px] cursor-pointer transition-all ${
                    colorMode === 'contrast'
                      ? 'border-[#F65936] bg-[#F65936]/15 text-[#F65936] font-bold ring-2 ring-[#F65936]/30'
                      : 'border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] dark:text-[#7A9BB8] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  title="Boosts contrast between text and background"
                >
                  Contrast
                </button>
              </div>
            </div>

            {/* 3. Font Size Scaling */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold flex items-center gap-1.5 text-[#14213D] dark:text-white">
                  <Type className="w-3.5 h-3.5 text-[#64BF56]" />
                  <span>Font Size / Text Zoom</span>
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[#5A7086] dark:text-[#7A9BB8]">
                  {fontSize === 'normal' ? '100% (Default)' : fontSize === 'large' ? '115% (+Large)' : '130% (+X-Large)'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setFontSize('normal')}
                  className={`py-2 px-2 rounded-xl font-semibold border text-center cursor-pointer transition-all ${
                    fontSize === 'normal'
                      ? 'border-[#88DFF2] bg-[#88DFF2]/20 text-[#14213D] dark:text-[#88DFF2] font-bold'
                      : 'border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] dark:text-[#7A9BB8] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="text-xs">A</span>
                  <span className="block text-[10px] font-normal text-[#5A7086] dark:text-[#7A9BB8]">Default</span>
                </button>

                <button
                  onClick={() => setFontSize('large')}
                  className={`py-2 px-2 rounded-xl font-semibold border text-center cursor-pointer transition-all ${
                    fontSize === 'large'
                      ? 'border-[#88DFF2] bg-[#88DFF2]/20 text-[#14213D] dark:text-[#88DFF2] font-bold'
                      : 'border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] dark:text-[#7A9BB8] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="text-sm font-bold">A+</span>
                  <span className="block text-[10px] font-normal text-[#5A7086] dark:text-[#7A9BB8]">Large</span>
                </button>

                <button
                  onClick={() => setFontSize('xlarge')}
                  className={`py-2 px-2 rounded-xl font-semibold border text-center cursor-pointer transition-all ${
                    fontSize === 'xlarge'
                      ? 'border-[#88DFF2] bg-[#88DFF2]/20 text-[#14213D] dark:text-[#88DFF2] font-bold'
                      : 'border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] dark:text-[#7A9BB8] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="text-base font-black">A++</span>
                  <span className="block text-[10px] font-normal text-[#5A7086] dark:text-[#7A9BB8]">X-Large</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-3 border-t border-[#D6EDF8] dark:border-[#2A3F54] flex items-center justify-between text-[11px] text-[#5A7086] dark:text-[#7A9BB8]">
            <span>Preferences saved locally</span>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 rounded-lg bg-[#88DFF2] text-[#14213D] font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── Single Floating Accessibility Button (Human User Icon) ── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`p-3.5 rounded-full transition-all cursor-pointer flex items-center justify-center relative shadow-xl border-2 backdrop-blur-md ${
          isOpen || isCustomized
            ? 'bg-[#88DFF2] border-[#0284C7] text-[#14213D] ring-4 ring-[#88DFF2]/40 scale-105'
            : 'bg-white/95 dark:bg-[#161B22]/95 border-[#D6EDF8] dark:border-[#2A3F54] text-[#14213D] dark:text-white hover:scale-110 active:scale-95 hover:border-[#88DFF2]'
        }`}
        title="Accessibility & Display Settings (Theme, Grayscale, Contrast, Font Size)"
        aria-label="Open Accessibility Menu"
        aria-expanded={isOpen}
      >
        <Accessibility className="w-5 h-5 text-[#0284C7] dark:text-[#88DFF2]" />
        {isCustomized && !isOpen && (
          <span
            className="absolute -top-1 -right-1 w-3 h-3 bg-[#64BF56] rounded-full border-2 border-white dark:border-[#161B22]"
            title="Custom display settings active"
          />
        )}
      </button>
    </div>
  );
};
