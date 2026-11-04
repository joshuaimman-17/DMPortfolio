'use client';

import React, { useEffect } from 'react';
import { driveImageUrl } from '@/lib/drive-image';

export interface LightboxItem {
  id: string;
  title: string;
  image: string;
  badge?: string;
  subtitle?: string;
  client?: string;
  highlight?: string;
  caption?: string;
}

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: LightboxItem[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  onClose,
  items,
  currentIndex,
  onNavigate,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && items.length > 0) {
        onNavigate((currentIndex + 1) % items.length);
      }
      if (e.key === 'ArrowLeft' && items.length > 0) {
        onNavigate((currentIndex - 1 + items.length) % items.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, currentIndex, items.length, onClose, onNavigate]);

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate((currentIndex - 1 + items.length) % items.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate((currentIndex + 1) % items.length);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 transition-all duration-300"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        aria-label="Close Preview"
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all focus:outline-none cursor-pointer"
      >
        <span className="material-symbols-outlined text-[26px]">close</span>
      </button>

      {/* Navigation Arrows */}
      <button
        aria-label="Previous Item"
        onClick={handlePrev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all focus:outline-none cursor-pointer"
      >
        <span className="material-symbols-outlined text-[28px]">chevron_left</span>
      </button>

      <button
        aria-label="Next Item"
        onClick={handleNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all focus:outline-none cursor-pointer"
      >
        <span className="material-symbols-outlined text-[28px]">chevron_right</span>
      </button>

      {/* Main Container */}
      <div
        className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center justify-center z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-neutral-950 max-h-[72vh] flex items-center justify-center border border-white/10">
          <img
            src={currentItem.image}
            alt={currentItem.title}
            className="max-h-[72vh] w-auto max-w-full object-contain transition-transform duration-300"
          />
        </div>

        {/* Caption & Metadata */}
        <div className="w-full max-w-2xl text-center mt-4 text-white">
          <div className="flex items-center justify-center gap-2 mb-1">
            {currentItem.badge && (
              <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-xs font-semibold uppercase tracking-wider text-white">
                {currentItem.badge}
              </span>
            )}
            <span className="text-xs text-neutral-300">
              {currentItem.subtitle || currentItem.client}
            </span>
          </div>
          <p className="font-headline-md text-base md:text-lg font-bold drop-shadow">
            {currentItem.caption || currentItem.title}
          </p>
          {currentItem.highlight && (
            <p className="text-xs text-secondary-fixed mt-1 font-semibold">{currentItem.highlight}</p>
          )}
          <span className="text-xs text-neutral-400 mt-2 block">
            {currentIndex + 1} of {items.length}
          </span>
        </div>
      </div>
    </div>
  );
};
