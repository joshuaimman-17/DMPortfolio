import React, { useState } from 'react';

/** Collapsible admin form section. Content stays mounted (hidden) so form state is never lost. */
export const Collapsible: React.FC<{
  title: string;
  icon?: string;
  iconClass?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, icon, iconClass = 'text-primary', defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-5 sm:px-8 py-4 text-left cursor-pointer hover:bg-neutral-50 transition-colors"
      >
        <span className="flex items-center gap-2 text-base font-bold text-neutral-900">
          {icon && <span className={`material-symbols-outlined text-[20px] ${iconClass}`}>{icon}</span>}
          <span>{title}</span>
        </span>
        <span
          className={`material-symbols-outlined text-[22px] text-neutral-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        >
          expand_more
        </span>
      </button>
      <div className={`${open ? 'flex' : 'hidden'} flex-col gap-4 px-5 sm:px-8 pb-6 pt-4 border-t border-neutral-100`}>
        {children}
      </div>
    </section>
  );
};
