import React from 'react';
import { slugifyTitle, validateSlug } from '../../lib/slug';

type Kind = 'service' | 'work' | 'post';
const ROUTE: Record<Kind, string> = { service: '/services', work: '/works', post: '/blog' };

interface Props {
  kind: Kind;
  value: string;
  onChange: (slug: string) => void;
  /** Current title, used by "Regenerate from title". */
  title: string;
  /** Slug the item is saved under now; null while creating a new item. */
  savedSlug: string | null;
  /** Retired URLs that already redirect to this item. */
  previousSlugs?: string[];
  placeholder?: string;
}

/**
 * Slug input shared by the Works / Services / Posts forms.
 * The slug is independent of the title: it only changes when edited here or when
 * "Regenerate from title" is pressed. Any change to a saved item is rename-safe on save
 * (old URL 308-redirects, SEO metadata moves) — the notice below says exactly what will happen.
 */
export const SlugField: React.FC<Props> = ({ kind, value, onChange, title, savedSlug, previousSlugs = [], placeholder }) => {
  const route = ROUTE[kind];
  const isExisting = savedSlug !== null;
  const changed = isExisting && value !== savedSlug;
  const valid = validateSlug(value) === null;
  const suggestion = slugifyTitle(title);
  const canRegenerate = isExisting && suggestion.length > 0 && suggestion !== value;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <label className="text-xs font-bold text-neutral-800">URL Slug (Unique ID) *</label>
        {canRegenerate && (
          <button
            type="button"
            onClick={() => onChange(suggestion)}
            className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
            title={`Set slug to "${suggestion}"`}
          >
            Regenerate from title
          </button>
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      {isExisting && !changed && (
        <p className="mt-1.5 text-[11px] text-neutral-500">
          Editing the title does not change this URL. Change the slug here only if you want a new URL.
        </p>
      )}

      {changed && (
        <div className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-900">
          {valid ? (
            <>
              Saving will move this page from <span className="font-mono font-bold">{route}/{savedSlug}</span> to{' '}
              <span className="font-mono font-bold">{route}/{value}</span>. The old URL will permanently redirect (308) to the new one, and
              this item&apos;s SEO title/description move with it. Links to the old URL from other sites keep working through the redirect.
            </>
          ) : (
            <>{validateSlug(value)}</>
          )}
        </div>
      )}

      {previousSlugs.length > 0 && (
        <p className="mt-1.5 text-[11px] text-neutral-500">
          Old URLs redirecting here:{' '}
          {previousSlugs.map((s, i) => (
            <span key={s} className="font-mono">
              {route}/{s}
              {i < previousSlugs.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>
      )}
    </div>
  );
};
