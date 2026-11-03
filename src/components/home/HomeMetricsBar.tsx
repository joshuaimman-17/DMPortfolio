'use client';

import React, { useState, useEffect } from 'react';

function useAnimatedCounter(targetValue: number, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setValue(Number((easeProgress * targetValue).toFixed(targetValue % 1 === 0 ? 0 : 1)));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setValue(targetValue);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetValue, duration]);

  return value;
}

export function HomeMetricsBar() {
  const c1 = useAnimatedCounter(120);
  const c2 = useAnimatedCounter(4.5);
  const c3 = useAnimatedCounter(50);
  const c4 = useAnimatedCounter(30);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-400 mb-2">
          <span className="material-symbols-outlined text-secondary text-[24px]">query_stats</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Verified Uplift</span>
        </div>
        <div className="font-mono text-3xl sm:text-4xl font-extrabold text-secondary tracking-tight">
          +{c1}%
        </div>
        <div className="text-xs font-bold text-on-surface mt-1">Organic Traffic</div>
        <div className="text-[11px] text-on-surface-variant line-clamp-1">Avg. 6-Month Organic Uplift Across Audited Clients</div>
      </div>

      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-400 mb-2">
          <span className="material-symbols-outlined text-primary-container text-[24px]">percent</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Blended</span>
        </div>
        <div className="font-mono text-3xl sm:text-4xl font-extrabold text-primary-container tracking-tight">
          {c2}x
        </div>
        <div className="text-xs font-bold text-on-surface mt-1">Blended ROAS</div>
        <div className="text-[11px] text-on-surface-variant line-clamp-1">Average Return on Ad Spend Across Meta &amp; Google</div>
      </div>

      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-400 mb-2">
          <span className="material-symbols-outlined text-on-surface text-[24px]">payments</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Capital</span>
        </div>
        <div className="font-mono text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
          ₹{c3}L+
        </div>
        <div className="text-xs font-bold text-on-surface mt-1">Ad Spend Managed</div>
        <div className="text-[11px] text-on-surface-variant line-clamp-1">Over Google &amp; Meta Ads Campaigns with Zero Wastage</div>
      </div>

      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-neutral-400 mb-2">
          <span className="material-symbols-outlined text-secondary text-[24px]">verified_user</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Track Record</span>
        </div>
        <div className="font-mono text-3xl sm:text-4xl font-extrabold text-secondary tracking-tight">
          {c4}+
        </div>
        <div className="text-xs font-bold text-on-surface mt-1">Completed Engagements</div>
        <div className="text-[11px] text-on-surface-variant line-clamp-1">Enterprise &amp; D2C Brands with Documented Growth Trajectories</div>
      </div>
    </div>
  );
}
