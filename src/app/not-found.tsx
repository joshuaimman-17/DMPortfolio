import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center text-primary mb-4">
        <span className="material-symbols-outlined text-[36px]">search_off</span>
      </div>
      <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">404 - Page Not Found</h1>
      <p className="text-on-surface-variant max-w-md mb-8 text-sm">
        The page or resource you are looking for does not exist or has been relocated within the growth architecture.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">home</span>
          <span>Return Home</span>
        </Link>
        <Link
          href="/services"
          className="px-5 py-2.5 rounded-xl bg-surface-container-low border border-neutral-300 text-on-surface text-xs font-bold hover:bg-neutral-200 transition-colors"
        >
          Explore Services
        </Link>
        <Link
          href="/works"
          className="px-5 py-2.5 rounded-xl bg-surface-container-low border border-neutral-300 text-on-surface text-xs font-bold hover:bg-neutral-200 transition-colors"
        >
          View Case Studies
        </Link>
      </div>
    </div>
  );
}
