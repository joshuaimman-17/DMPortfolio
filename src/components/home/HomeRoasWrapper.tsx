'use client';

import React from 'react';
import { RoasCalculator } from '@/components/RoasCalculator';
import { useModalContext } from '@/context/ModalContext';

export function HomeRoasWrapper() {
  const { openAuditModal } = useModalContext();
  return <RoasCalculator onBookAudit={openAuditModal} />;
}
