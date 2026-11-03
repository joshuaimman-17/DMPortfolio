'use client';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="text-sm text-neutral-600 mb-4">{error?.message || 'An unexpected error occurred'}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}
