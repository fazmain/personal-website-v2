'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/research', label: 'Research' },
  // { href: '/publications', label: 'Publications' },
  { href: '/essays', label: 'Essays' },
  // { href: '/notes', label: 'Notes' },
  { href: '/projects', label: 'Projects' },
  // { href: '/library', label: 'Library' },
  { href: '/about', label: 'About' },
];

export default function SiteNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Mobile: a quiet row of links above the content */}
      <nav aria-label="Main" className="lg:hidden mb-10">
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-base">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive(href) ? 'page' : undefined}
                className={
                  isActive(href)
                    ? 'text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40'
                    : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors'
                }
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Desktop: a vertical list sitting in the margin, left of the content column */}
      <nav aria-label="Main" className="hidden lg:block absolute right-full top-0 h-full pt-10 mr-16 xl:mr-28 2xl:mr-36">
        <ul className="sticky top-24 flex flex-col gap-3 text-lg">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive(href) ? 'page' : undefined}
                className={`group relative transition-colors ${
                  isActive(href) ? 'text-[var(--accent)]' : 'text-[var(--foreground)]/50 hover:text-[var(--foreground)]'
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute right-full mr-2 top-1/2 h-px transition-all ${
                    isActive(href) ? 'w-4 bg-[var(--accent)]' : 'w-0 bg-[var(--foreground)]/40 group-hover:w-2'
                  }`}
                />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
