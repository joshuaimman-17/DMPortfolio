'use client';

import React, { useState, useEffect } from 'react';
import { DEFAULT_HOME } from '@/types/home-content';

function useAnimatedCounter(targetValue: number, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;
    const decimals = targetValue % 1 === 0 ? 0 : 1;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setValue(Number((easeProgress * targetValue).toFixed(decimals)));

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

export interface MetricsBarItem {
  value: string;
  label: string;
  desc: string;
}

// Splits "+120%", "4.5x", "₹50L+", "#1 SERP" into prefix / number / suffix so the number can animate.
function splitValue(raw: string) {
  const m = /^(\D*?)(\d+(?:\.\d+)?)(.*)$/.exec((raw || '').trim());
  if (!m) return { prefix: '', num: null as number | null, suffix: raw || '' };
  return { prefix: m[1], num: Number(m[2]), suffix: m[3] };
}

const STYLES = [
  { icon: 'text-secondary', tag: 'text-secondary', value: 'text-secondary', iconCls: 'text-secondary' },
  { icon: 'text-primary-container', tag: 'text-primary', value: 'text-primary-container', iconCls: 'text-primary-container' },
  { icon: 'text-on-surface', tag: 'text-neutral-500', value: 'text-on-surface', iconCls: 'text-on-surface' },
  { icon: 'text-secondary', tag: 'text-secondary', value: 'text-secondary', iconCls: 'text-secondary' },
];

function MetricCard({
  item,
  icon,
  tag,
  style,
}: {
  item: MetricsBarItem;
  icon: string;
  tag: string;
  style: (typeof STYLES)[number];
}) {
  const { prefix, num, suffix } = splitValue(item.value);
  const animated = useAnimatedCounter(num ?? 0);
  const shown = num === null ? item.value : `${prefix}${animated}${suffix}`;

  return (
    <div className="bg-surface-container-lowest p-3.5 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between text-neutral-400 mb-2">
        <span className={`material-symbols-outlined ${style.iconCls} text-[20px] sm:text-[24px]`}>{icon}</span>
        <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${style.tag}`}>{tag}</span>
      </div>
      <div className={`font-mono text-2xl xs:text-3xl sm:text-4xl font-extrabold ${style.value} tracking-tight`}>
        {shown}
      </div>
      <div className="text-[11px] sm:text-xs font-bold text-on-surface mt-1 truncate">{item.label}</div>
      <div className="text-[10px] sm:text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">{item.desc}</div>
    </div>
  );
}

export function HomeMetricsBar({
  metrics,
  decor,
}: {
  metrics?: MetricsBarItem[];
  decor?: { icon: string; tag: string }[];
}) {
  const items = metrics && metrics.length ? metrics : [];
  const deco = decor && decor.length ? decor : DEFAULT_HOME.metricsBar.items;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
      {items.map((item, i) => (
        <MetricCard
          key={`${i}-${item.label}`}
          item={item}
          icon={deco[i]?.icon || DEFAULT_HOME.metricsBar.items[i % 4].icon}
          tag={deco[i]?.tag ?? DEFAULT_HOME.metricsBar.items[i % 4].tag}
          style={STYLES[i % STYLES.length]}
        />
      ))}
    </div>
  );
}
