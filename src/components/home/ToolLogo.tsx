'use client';

import React, { useState } from 'react';
import { brandLogoUrl } from '@/lib/brand-logos';

/** Official brand logo when `brand` is set and loads; otherwise the Material Symbol icon. */
export function ToolLogo({ brand, icon, name, color }: { brand?: string; icon: string; name: string; color?: string }) {
  const [failed, setFailed] = useState(false);
  if (brand && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={brandLogoUrl(brand)}
        alt={`${name} logo`}
        width={28}
        height={28}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-7 w-7 object-contain"
      />
    );
  }
  return <span className={`material-symbols-outlined text-[24px] ${color || ''}`}>{icon}</span>;
}
