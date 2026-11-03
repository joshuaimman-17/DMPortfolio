'use client';

import React from 'react';
import { useModalContext } from '@/context/ModalContext';
import { LightboxItem } from '@/components/LightboxModal';

export function AuditButton({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { openAuditModal } = useModalContext();
  return (
    <button
      type="button"
      onClick={openAuditModal}
      className={className}
    >
      {children}
    </button>
  );
}

export function LightboxTrigger({
  index,
  items,
  children,
  className = '',
}: {
  index: number;
  items?: LightboxItem[];
  children: React.ReactNode;
  className?: string;
}) {
  const { openLightbox } = useModalContext();
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openLightbox(index, items)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index, items);
        }
      }}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </div>
  );
}
