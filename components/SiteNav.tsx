'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Essays' },
  { href: '/projects', label: 'Projects' },
  { href: '/library', label: 'Library' },
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
                    ? 'text-[#ac4c2e] underline underline-offset-4 decoration-[#ac4c2e]/40'
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
      <nav aria-label="Main" className="hidden lg:block absolute right-full top-0 h-full mr-16 xl:mr-24">
        <ul className="sticky top-12 flex flex-col gap-2 text-lg">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive(href) ? 'page' : undefined}
                className={`group relative transition-colors ${
                  isActive(href) ? 'text-[#ac4c2e]' : 'text-[var(--foreground)]/50 hover:text-[var(--foreground)]'
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute right-full mr-2 top-1/2 h-px transition-all ${
                    isActive(href) ? 'w-4 bg-[#ac4c2e]' : 'w-0 bg-[var(--foreground)]/40 group-hover:w-2'
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
