'use client';

import React, { useState } from 'react';

interface FaqItem {
  q: string;
  a: string;
}

export function HomeFaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="rounded-2xl border border-neutral-200/80 bg-surface-container-low overflow-hidden transition-all duration-200"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-on-surface hover:text-primary transition-colors cursor-pointer"
            >
              <span>{faq.q}</span>
              <span
                className={`material-symbols-outlined text-[20px] transition-transform duration-200 text-neutral-500 ${
                  isOpen ? 'rotate-180 text-primary' : ''
                }`}
              >
                expand_more
              </span>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-xs text-on-surface-variant leading-relaxed border-t border-neutral-200/50">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
