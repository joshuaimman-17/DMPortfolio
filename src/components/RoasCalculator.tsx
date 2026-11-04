'use client';

import React, { useState } from 'react';

export const RoasCalculator: React.FC<{ onBookAudit: () => void }> = ({ onBookAudit }) => {
  const [monthlySpend, setMonthlySpend] = useState<number>(500000); // 5 Lakhs INR default
  const [conversionRate, setConversionRate] = useState<number>(2.4); // 2.4%
  const [averageOrderValue, setAverageOrderValue] = useState<number>(3200); // 3200 INR
  const [costPerClick, setCostPerClick] = useState<number>(24); // 24 INR

  // Calculations
  const estimatedClicks = Math.round(monthlySpend / costPerClick);
  const estimatedConversions = Math.round(estimatedClicks * (conversionRate / 100));
  const estimatedRevenue = Math.round(estimatedConversions * averageOrderValue);
  const blendedRoas = (estimatedRevenue / monthlySpend).toFixed(2);
  const acquisitionCost = estimatedConversions > 0 ? Math.round(monthlySpend / estimatedConversions) : 0;
  const netMargin = Math.round(estimatedRevenue * 0.42); // 42% average net gross margin

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakhs`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="w-full bg-surface-container-low rounded-2xl p-4 sm:p-6 md:p-8 border border-neutral-200/80 shadow-md">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-[16px]">calculate</span>
            Interactive Growth Modeler
          </div>
          <h3 className="font-headline-lg text-headline-lg text-on-surface">
            Estimate Your Revenue &amp; ROAS Potential
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Adjust budget, conversion rate, and average ticket size to project channel output with audited campaign hygiene.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface-container-lowest text-secondary border border-neutral-200">
          <span className="material-symbols-outlined text-[16px]">verified</span>
          Live Modeling Engine
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Controls Column */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Monthly Spend Slider */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-semibold text-on-surface">Monthly Ad Spend Budget</span>
              <span className="font-bold text-primary font-mono text-base">{formatCurrency(monthlySpend)}</span>
            </div>
            <input
              type="range"
              min={50000}
              max={3000000}
              step={25000}
              value={monthlySpend}
              onChange={(e) => setMonthlySpend(Number(e.target.value))}
              className="w-full h-2 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-primary-container"
            />
            <div className="flex justify-between text-[11px] text-on-surface-variant mt-1">
              <span>₹50K</span>
              <span>₹10L</span>
              <span>₹20L</span>
              <span>₹30L+</span>
            </div>
          </div>

          {/* Average Order Value (AOV) Slider */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-semibold text-on-surface">Average Order Value / Deal Size</span>
              <span className="font-bold text-on-surface font-mono text-base">{formatCurrency(averageOrderValue)}</span>
            </div>
            <input
              type="range"
              min={500}
              max={25000}
              step={250}
              value={averageOrderValue}
              onChange={(e) => setAverageOrderValue(Number(e.target.value))}
              className="w-full h-2 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-primary-container"
            />
            <div className="flex justify-between text-[11px] text-on-surface-variant mt-1">
              <span>₹500 (Mass)</span>
              <span>₹5,000 (Mid)</span>
              <span>₹15,000 (D2C Lux)</span>
              <span>₹25,000+ (B2B SaaS)</span>
            </div>
          </div>

          {/* Conversion Rate & CPC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-semibold text-on-surface">Conversion Rate</span>
                <span className="font-bold text-secondary font-mono text-base">{conversionRate}%</span>
              </div>
              <input
                type="range"
                min={0.8}
                max={6.0}
                step={0.1}
                value={conversionRate}
                onChange={(e) => setConversionRate(Number(e.target.value))}
                className="w-full h-2 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-secondary"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-semibold text-on-surface">Target CPC (Blended)</span>
                <span className="font-bold text-on-surface font-mono text-base">₹{costPerClick}</span>
              </div>
              <input
                type="range"
                min={8}
                max={80}
                step={2}
                value={costPerClick}
                onChange={(e) => setCostPerClick(Number(e.target.value))}
                className="w-full h-2 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-primary-container"
              />
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-4 sm:p-6 border border-neutral-200/90 shadow-lg flex flex-col justify-between gap-5">
          <div className="border-b border-neutral-200 pb-4">
            <span className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold block">
              Projected Outcome
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-extrabold text-primary tracking-tight font-mono">
                {blendedRoas}x
              </span>
              <span className="text-sm font-semibold text-secondary flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[18px]">trending_up</span>
                Target Return
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-surface-container-low p-3 rounded-lg">
              <span className="text-[11px] text-on-surface-variant font-medium block">Monthly Revenue</span>
              <span className="font-bold text-on-surface font-mono text-base">{formatCurrency(estimatedRevenue)}</span>
            </div>
            <div className="bg-surface-container-low p-3 rounded-lg">
              <span className="text-[11px] text-on-surface-variant font-medium block">Target CAC</span>
              <span className="font-bold text-secondary font-mono text-base">₹{acquisitionCost}</span>
            </div>
            <div className="bg-surface-container-low p-3 rounded-lg">
              <span className="text-[11px] text-on-surface-variant font-medium block">Est. Customers</span>
              <span className="font-bold text-on-surface font-mono text-base">{estimatedConversions.toLocaleString('en-IN')} / mo</span>
            </div>
            <div className="bg-surface-container-low p-3 rounded-lg">
              <span className="text-[11px] text-on-surface-variant font-medium block">Est. Gross Margin</span>
              <span className="font-bold text-primary font-mono text-base">{formatCurrency(netMargin)}</span>
            </div>
          </div>

          <button
            onClick={onBookAudit}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary-container text-on-primary font-label-md text-sm shadow-[0_4px_14px_0_rgba(37,99,235,0.35)] hover:bg-primary transition-all font-semibold"
          >
            <span>Audit My Funnel for This ROAS</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
