import type { Metadata } from 'next';
// Self-hosted шрифты (woff2 в бандле, ноль внешних запросов). Google Fonts запрещены (CLAUDE.md §1).
import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/jetbrains-mono';
import './globals.css';
import { SITE_NAME, SITE_SHORT_NAME, SITE_URL } from '@/lib/site';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_SHORT_NAME}`,
  },
  description:
    'Автоматическая проверка сайта на соответствие 152-ФЗ, ЗОЗПП, 436-ФЗ и другим законам РФ. Балл из 100 и список нарушений за пару минут.',
  applicationName: SITE_SHORT_NAME,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
