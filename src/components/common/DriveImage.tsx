import React, { useState } from 'react';
import { driveImageUrl } from '../../lib/backend';

export interface DriveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  aspectRatioClass?: string;
  frameType?: 'poster' | 'analytics' | 'seo-site' | 'social' | 'ad' | 'work' | 'post' | 'avatar' | string;
  title?: string;
  containerClassName?: string;
}

export const DriveImage: React.FC<DriveImageProps> = ({
  src,
  alt,
  width = 600,
  aspectRatioClass = 'aspect-[16/10]',
  frameType = 'general',
  title,
  className = '',
  containerClassName = '',
  loading = 'lazy',
  ...rest
}) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const resolvedSrc = driveImageUrl(src, width);

  // Fallback badge styling based on frameType
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

  return (
    <div
      className={`relative overflow-hidden bg-neutral-100 ${aspectRatioClass} ${containerClassName}`}
    >
      {/* Loading Skeleton */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-neutral-100 via-neutral-200/70 to-neutral-100 animate-pulse">
          <span className="material-symbols-outlined text-neutral-300 text-3xl">
            {getFallbackIcon()}
          </span>
        </div>
      )}

      {/* Styled Gradient Fallback on Error */}
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-neutral-800 via-neutral-900 to-slate-950 text-white select-none">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-blue-400 text-2xl">
              {getFallbackIcon()}
            </span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
            {getFallbackLabel()}
          </span>
          <span className="text-xs text-neutral-300 font-semibold line-clamp-1 max-w-[90%] mt-1">
            {title || alt || 'Growth Asset'}
          </span>
        </div>
      ) : (
        <img
          src={resolvedSrc}
          alt={alt}
          loading={loading}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...rest}
        />
      )}
    </div>
  );
};
