'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Головна' },
    { href: '/docs', label: 'Документація' },
    { href: '/examples', label: 'Приклади' },
    { href: '/faq', label: 'FAQ' },
  ];

  return (
    <nav className="mb-8 flex justify-center gap-4 flex-wrap">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-2 rounded-lg transition ${isActive
                ? 'bg-black text-white'
                : 'border border-gray-300 hover:border-gray-400'
              }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
