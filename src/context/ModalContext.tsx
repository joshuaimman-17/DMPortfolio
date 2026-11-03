'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import { AuditBookingModal } from '@/components/AuditBookingModal';
import { LightboxModal, LightboxItem } from '@/components/LightboxModal';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SiteSettings } from '@/types/settings';

interface ModalContextType {
  openAuditModal: () => void;
  closeAuditModal: () => void;
  openLightbox: (index: number, items?: LightboxItem[]) => void;
  closeLightbox: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    return {
      openAuditModal: () => {},
      closeAuditModal: () => {},
      openLightbox: () => {},
      closeLightbox: () => {},
    };
  }
  return context;
}

interface SiteShellProps {
  children: React.ReactNode;
  settings?: SiteSettings;
  defaultLightboxItems?: LightboxItem[];
  isAdmin?: boolean;
}

export function SiteShell({
  children,
  settings,
  defaultLightboxItems = [],
  isAdmin = false,
}: SiteShellProps) {
  const [auditOpen, setAuditOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxItems, setLightboxItems] = useState<LightboxItem[]>(defaultLightboxItems);

  const value = useMemo(
    () => ({
      openAuditModal: () => setAuditOpen(true),
      closeAuditModal: () => setAuditOpen(false),
      openLightbox: (index: number, items?: LightboxItem[]) => {
        if (items && items.length > 0) {
          setLightboxItems(items);
        } else if (defaultLightboxItems.length > 0) {
          setLightboxItems(defaultLightboxItems);
        }
        setLightboxIndex(index >= 0 ? index : 0);
        setLightboxOpen(true);
      },
      closeLightbox: () => setLightboxOpen(false),
    }),
    [defaultLightboxItems]
  );

  return (
    <ModalContext.Provider value={value}>
      <Navbar onOpenAudit={() => setAuditOpen(true)} />
      <main className="flex-1 pt-20">{children}</main>
      <Footer
        settings={settings}
        onOpenAudit={() => setAuditOpen(true)}
        isAdmin={isAdmin}
      />

      <AuditBookingModal
        isOpen={auditOpen}
        onClose={() => setAuditOpen(false)}
      />

      <LightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        items={lightboxItems}
        currentIndex={lightboxIndex}
        onNavigate={(idx) => setLightboxIndex(idx)}
      />
    </ModalContext.Provider>
  );
}
