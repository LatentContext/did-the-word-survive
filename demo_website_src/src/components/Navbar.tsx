import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { TabType } from '../types';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onLogoClick?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

const TABS: { id: TabType; label: string; emoji: string }[] = [
  { id: 'overview',   label: 'Overview',     emoji: '🌐' },
  { id: 'evaluator',  label: 'Evaluator',    emoji: '🧪' },
  { id: 'waveform',   label: 'SPSS & Audio', emoji: '🔬' },
  { id: 'compare',    label: 'Compare',      emoji: '📊' },
  { id: 'phonetics',  label: 'Phonetics',    emoji: '🎙️' },
  { id: 'asr',        label: 'ASR Models',   emoji: '🤖' },
  { id: 'protocol',   label: 'Protocol',     emoji: '📋' },
  { id: 'resources',  label: 'Resources',    emoji: '📂' },
];

// Accent color per tab (from happy palette)
const TAB_COLORS: Record<TabType, string> = {
  overview:  '#88DFF2',
  evaluator: '#64BF56',
  waveform:  '#F294C8',
  compare:   '#F2C53D',
  phonetics: '#88DFF2',
  asr:       '#64BF56',
  protocol:  '#F2C53D',
  resources: '#F65936',
};

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, onLogoClick, isDark, onToggleTheme }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      onTabChange('overview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[#D6EDF8] dark:border-[#2A3F54] bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo - Clickable to Home Page */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 group cursor-pointer text-left transition-all hover:opacity-95 active:scale-95 shrink-0"
            title="Did The Word Survive? · Click to return to Home"
            aria-label="Did The Word Survive? · Return to Home Page"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:shadow-md transition-all duration-200 overflow-hidden bg-[#0C1322] border border-[#88DFF2]/40">
              <img src="./images/ear_logo_icon.png" alt="Did the Word Survive? Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black tracking-tight text-sm sm:text-base text-[#14213D] dark:text-white group-hover:text-[#88DFF2] transition-colors">
                Did The Word Survive?
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#F294C8] to-[#88DFF2] text-slate-900 font-mono tracking-tight shadow-2xs">
                v2.0
              </span>
            </div>
          </button>

          {/* Desktop Tabs */}
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const color = TAB_COLORS[tab.id];
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-[#14213D] font-bold shadow-xs'
                      : 'text-[#5A7086] dark:text-[#7A9BB8] hover:text-[#14213D] dark:hover:text-white hover:bg-[#F0F8FF] dark:hover:bg-[#1A2332]'
                  }`}
                  style={isActive ? { backgroundColor: color + 'CC' } : {}}
                >
                  <span className="mr-1">{tab.emoji}</span>
                  {tab.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action / Reback Link & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="./v1_classic.html"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F0F8FF] dark:bg-[#1A2332] text-[#14213D] dark:text-[#E6F0F8] hover:text-[#BE185D] dark:hover:text-[#F294C8] border border-[#D6EDF8] dark:border-[#2A3F54] transition-all hover:border-[#F294C8] shadow-2xs cursor-pointer"
              title="Reback to Classic v1.0 Single-File Demo"
            >
              <span>↩️</span>
              <span className="hidden sm:inline">Reback to</span> v1.0
            </a>

            {/* Mobile hamburger toggle */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-xl border border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] hover:bg-[#F0F8FF] dark:hover:bg-[#1A2332] transition-colors cursor-pointer"
                aria-label="Toggle mobile navigation menu"
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Menu */}
        {mobileOpen && (
          <div className="lg:hidden py-3 border-t border-[#D6EDF8] dark:border-[#2A3F54] anim-fade-up">
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const color = TAB_COLORS[tab.id];
                return (
                  <button
                    key={tab.id}
                    onClick={() => { onTabChange(tab.id); setMobileOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                      isActive ? 'text-[#14213D] font-bold' : 'text-[#5A7086] dark:text-[#7A9BB8] hover:bg-[#F0F8FF] dark:hover:bg-[#1A2332]'
                    }`}
                    style={isActive ? { backgroundColor: color + 'CC' } : {}}
                  >
                    <span>{tab.emoji}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Reback link for mobile */}
            <div className="pt-2 border-t border-[#D6EDF8] dark:border-[#2A3F54]">
              <a
                href="./v1_classic.html"
                className="w-full text-center px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 bg-[#F0F8FF] dark:bg-[#1A2332] text-[#14213D] dark:text-[#E6F0F8] border border-[#D6EDF8] dark:border-[#2A3F54]"
              >
                <span>↩️ Reback to Classic v1.0 Demo</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
