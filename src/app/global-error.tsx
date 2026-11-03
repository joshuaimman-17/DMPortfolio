'use client';

export const dynamic = 'force-dynamic';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#fbf9f8] text-[#1b1c1c] p-8 flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <button
          type="button"
          onClick={() => reset()}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
