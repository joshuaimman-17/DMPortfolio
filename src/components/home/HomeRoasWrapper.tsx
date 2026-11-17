'use client';

import React from 'react';
import { RoasCalculator } from '@/components/RoasCalculator';
import { useModalContext } from '@/context/ModalContext';
import type { HomeContent } from '@/types/home-content';

export function HomeRoasWrapper({ content }: { content?: HomeContent['roas'] }) {
  const { openAuditModal } = useModalContext();
  return <RoasCalculator onBookAudit={openAuditModal} content={content} />;
}
