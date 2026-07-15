import Link from 'next/link';
import { SITE_SHORT_NAME } from '@/lib/site';

// Дисклеймер обязателен в футере (ПС-00 §3, ПС-09 §2).
// Ссылки на юрдокументы — каркасы появятся в Фазе 5; помечены как заглушки.
const legalLinks = [
  { href: '/offer', label: 'Оферта' },
  { href: '/privacy', label: 'Политика' },
  { href: '/consent', label: 'Согласие' },
  { href: '/cookies', label: 'Cookie' },
  { href: '/requisites', label: 'Реквизиты' },
  { href: '/contacts', label: 'Контакты' },
  { href: '/bot', label: 'О роботе' },
];

export function SiteFooter() {
  return (
    <footer className="mt-[var(--spacing-120)] border-t border-[rgba(186,215,247,0.08)]">
      <div className="mx-auto max-w-[var(--page-max-width)] px-5 py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <div
              className="text-skywash text-subheading font-medium"
              style={{ fontFamily: 'var(--font-aeonikpro)' }}
            >
              {SITE_SHORT_NAME}
            </div>
            <p className="mt-3 text-body-sm text-fog-veil">
              Сервис носит информационный характер и не заменяет юридическую консультацию.
              Точный размер санкций определяет Роскомнадзор или суд.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-8 gap-y-2 text-body-sm text-moon-mist sm:grid-cols-1">
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-frost-glow">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-10 text-caption text-fog-veil">
          © {SITE_SHORT_NAME}. Все проверки автоматические и носят рекомендательный характер.
        </div>
      </div>
    </footer>
  );
}
