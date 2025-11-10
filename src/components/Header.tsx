'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bug, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: '/', label: 'Головна' },
    { href: '/docs', label: 'Документація' },
    { href: '/examples', label: 'Приклади' },
    { href: '/faq', label: 'FAQ' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition">
            <Bug className="w-6 h-6" />
            <span>DevHelper</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-black ${isActive(link.href)
                    ? 'text-black border-b-2 border-black pb-1'
                    : 'text-gray-600'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="https://github.com/your-username/devhelper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-black transition"
            >
              GitHub
            </a>
            <Link
              href="/#integration"
              className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition"
            >
              Почати
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium transition-colors hover:text-black ${isActive(link.href) ? 'text-black font-bold' : 'text-gray-600'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t flex flex-col gap-3">
                <a
                  href="https://github.com/your-username/devhelper"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-black transition"
                >
                  GitHub
                </a>
                <Link
                  href="/#integration"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition text-center"
                >
                  Почати
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
