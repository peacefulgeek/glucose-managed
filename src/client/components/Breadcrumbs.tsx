import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span className="breadcrumb-sep" aria-hidden="true">›</span>}
          {item.href ? (
            <Link to={item.href}>{item.label}</Link>
          ) : (
            <span aria-current="page" style={{ color: 'var(--color-text-muted)' }}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
