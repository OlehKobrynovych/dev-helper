import Link from 'next/link';
import { Bug, Github, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-xl mb-4">
              <Bug className="w-6 h-6" />
              <span>DevHelper</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Інструмент для моніторингу та аналізу помилок у веб-проектах з AI-підтримкою.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Створено з</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>для розробників</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold mb-4">Навігація</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-black transition">
                  Головна
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-gray-600 hover:text-black transition">
                  Документація
                </Link>
              </li>
              <li>
                <Link href="/examples" className="text-gray-600 hover:text-black transition">
                  Приклади
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-black transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold mb-4">Ресурси</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/your-username/devhelper"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-black transition flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/your-username/devhelper/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-black transition"
                >
                  Issues
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/your-username/devhelper/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-black transition"
                >
                  Discussions
                </a>
              </li>
              <li>
                <Link href="/#integration" className="text-gray-600 hover:text-black transition">
                  Почати
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-gray-600">
          <p>© {currentYear} DevHelper. Всі права захищені. MIT License.</p>
        </div>
      </div>
    </footer>
  );
}
