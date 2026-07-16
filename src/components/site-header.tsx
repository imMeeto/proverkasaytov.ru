import Link from 'next/link';
import { SITE_SHORT_NAME } from '@/lib/site';
import { ShieldIcon } from '@/components/icons';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[rgba(186,215,247,0.08)] bg-[rgba(5,6,15,0.55)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[var(--page-max-width)] items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 text-frost-glow">
          <ShieldIcon className="text-blueprint-blue" />
          <span
            className="text-skywash text-subheading font-medium"
            style={{ fontFamily: 'var(--font-aeonikpro)' }}
          >
            {SITE_SHORT_NAME}
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-body-sm text-moon-mist sm:flex">
          <Link href="/#how" className="hover:text-frost-glow">
            Как работает
          </Link>
          <Link href="/#tariffs" className="hover:text-frost-glow">
            Тарифы
          </Link>
          <Link href="/#scan" className="hover:text-frost-glow">
            Проверить сайт
          </Link>
        </nav>
      </div>
    </header>
  );
}
