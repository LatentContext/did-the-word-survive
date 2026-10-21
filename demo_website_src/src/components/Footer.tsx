import React from 'react';
import { TabType } from '../types';

interface FooterProps {
  currentTab?: TabType;
  onSelectTab?: (tab: TabType) => void;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="mt-16 border-t border-[#D6EDF8] dark:border-[#2A3F54] bg-white dark:bg-[#161B22] transition-colors py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-[#5A7086] dark:text-[#7A9BB8]">
        <p className="font-medium leading-relaxed">
          Did The Word Survive? ·{' '}
          <a
            href="https://github.com/LatentContext/did-the-word-survive"
            target="_blank"
            rel="noreferrer"
            className="text-[#88DFF2] hover:underline font-semibold"
          >
            LatentContext / did-the-word-survive
          </a>{' '}
          · Audited Benchmark Release
        </p>
      </div>
    </footer>
  );
};
