'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { driveImageUrl } from '@/lib/drive-image';

export interface DriveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  aspectRatioClass?: string;
  frameType?: 'poster' | 'analytics' | 'seo-site' | 'social' | 'ad' | 'work' | 'post' | 'avatar' | string;
  title?: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  unoptimized?: boolean;
}

export const DriveImage: React.FC<DriveImageProps> = ({
  src,
  alt,
  width = 600,
  height,
  aspectRatioClass = 'aspect-[16/10]',
  frameType = 'general',
  title,
  className = '',
  containerClassName = '',
  priority = false,
  unoptimized,
}) => {
  const [error, setError] = useState<boolean>(false);

  const resolvedSrc = driveImageUrl(src, width);

  const getFallbackIcon = () => {
    switch (frameType) {
      case 'poster':
        return 'campaign';
      case 'analytics':
        return 'monitoring';
      case 'seo-site':
        return 'language';
      case 'social':
        return 'share';
      case 'ad':
        return 'ad_units';
      case 'work':
        return 'work';
      case 'post':
        return 'article';
      case 'avatar':
        return 'person';
      default:
        return 'image';
    }
  };

  const getFallbackLabel = () => {
    switch (frameType) {
      case 'poster':
        return 'Ad Creative / Poster';
      case 'analytics':
        return 'Analytics Dashboard';
      case 'seo-site':
        return 'SEO Website Preview';
      case 'social':
        return 'Social Media Engagement';
      case 'ad':
        return 'High-Converting Ad Frame';
      case 'work':
        return 'Case Study Deliverable';
      case 'post':
        return 'Playbook Article Cover';
      case 'avatar':
        return 'Avatar Profile';
      default:
        return 'Growth Deliverable';
    }
  };

  // Render high-fidelity branded card fallback if no image or on image error
  if (!resolvedSrc || error) {
    return (
      <div
        className={`relative overflow-hidden bg-neutral-900 ${aspectRatioClass} ${containerClassName}`}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-slate-900 via-neutral-900 to-blue-950 text-white select-none">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-2 shadow-inner">
            <span className="material-symbols-outlined text-blue-400 text-2xl">
              {getFallbackIcon()}
            </span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
            {getFallbackLabel()}
          </span>
          <span className="text-xs text-neutral-200 font-semibold line-clamp-1 max-w-[90%] mt-1">
            {title || alt || 'Verified Performance Asset'}
          </span>
        </div>
      </div>
    );
  }

  // Auto-detect if image is external Google Drive / Google usercontent / unsplash
  const isExternalGoogle =
    resolvedSrc.includes('googleusercontent.com') ||
    resolvedSrc.includes('drive.google.com') ||
    resolvedSrc.includes('unsplash.com');

  return (
    <div
      className={`relative overflow-hidden bg-neutral-100 ${aspectRatioClass} ${containerClassName}`}
    >
      <Image
        src={resolvedSrc}
        alt={alt || 'Image'}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={priority}
        unoptimized={unoptimized ?? isExternalGoogle}
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
        className={`object-cover transition-opacity duration-300 ${className}`}
      />
    </div>
  );
};
