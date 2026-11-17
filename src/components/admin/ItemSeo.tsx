import React from 'react';
import { usePortfolioData } from '../../context/PortfolioContext';
import { AdminMetadata } from './AdminMetadata';
import { Collapsible } from './Collapsible';

type Kind = 'service' | 'work' | 'post';

/**
 * SEO & social-card metadata for one service / work / blog item (its public detail page).
 * Stored in Firestore `pages_metadata/route_<kind>_<slug>` and has its own Save button.
 */
export const ItemSeo: React.FC<{ kind: Kind; slug?: string; isNew: boolean }> = ({ kind, slug, isNew }) => {
  const { services, works, blogPosts } = usePortfolioData();
  const list: any[] = kind === 'service' ? services : kind === 'work' ? works : blogPosts;
  const exists = !isNew && !!slug && list.some((x) => x.slug === slug);

  return (
    <Collapsible title="SEO & Metadata (page title, description, social card)" icon="travel_explore" iconClass="text-secondary">
      {exists ? (
        <AdminMetadata key={`${kind}-${slug}`} routeId={`route_${kind}_${slug}`} />
      ) : (
        <p className="text-sm text-neutral-600">
          Save this item first (as a draft or published), then reopen it to set its SEO title, description and
          social share image.
        </p>
      )}
    </Collapsible>
  );
};
