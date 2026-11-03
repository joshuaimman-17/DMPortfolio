import React from 'react';

export const NotFoundView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-xl ring-1 ring-neutral-200/80 p-8 sm:p-12 text-center flex flex-col items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center font-mono font-bold text-2xl">
          404
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
          Page Not Found
        </h1>

        <p className="text-sm text-on-surface-variant leading-relaxed">
          The page or route you are looking for doesn't exist or may have been moved. Return to the home overview or browse recent growth case studies.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="#/"
            className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>Back to Home</span>
          </a>
          <a
            href="#/works"
            className="px-6 py-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-sm border border-neutral-200 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">work</span>
            <span>View My Works</span>
          </a>
        </div>
      </div>
    </div>
  );
};
