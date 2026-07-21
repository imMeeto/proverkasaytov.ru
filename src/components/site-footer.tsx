'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LeadCapture } from '@/components/lead-capture';

// Футер — точная копия из docs/design-dev (PravoScan.dc.html / SeoAudit.dc.html).
// Адаптивен по силосу: на /seo/* — колонки SEO-сервиса, иначе — юридического.
// Дисклеймеры обязательны (ПС-00 §3, ПС-09 §2).

type Col = { title: string; links: { label: string; href: string }[] };

const lawCols: Col[] = [
  {
    title: 'Сервис',
    links: [
      { label: 'Проверить сайт', href: '/#scan' },
      { label: 'Что проверяем', href: '/#laws' },
      { label: 'Блог', href: '/blog' },
      { label: 'Вопросы и ответы', href: '/#pricing' },
      { label: 'Пример отчёта', href: '/example' },
    ],
  },
  {
    title: 'Документы',
    links: [
      { label: 'Политика конфиденциальности', href: '/privacy' },
      { label: 'Условия использования', href: '/offer' },
      { label: 'Публичная оферта', href: '/offer' },
      { label: 'Согласие на обработку ПД', href: '/consent' },
      { label: 'Согласие на рекламную рассылку', href: '/consent' },
      { label: 'Политика Cookie', href: '/cookies' },
      { label: 'Реквизиты', href: '/requisites' },
    ],
  },
];

const seoCols: Col[] = [
  {
    title: 'SEO-инструменты',
    links: [
      { label: 'Экспресс-аудит', href: '/seo#tools' },
      { label: 'Все инструменты', href: '/seo#tools' },
      { label: 'Полный аудит', href: '/seo/example' },
      { label: 'Мониторинг', href: '/seo#pricing' },
      { label: 'Тарифы SEO', href: '/seo#pricing' },
    ],
  },
  {
    title: 'Проверка по закону',
    links: [
      { label: 'Проверить сайт', href: '/' },
      { label: 'Что проверяем', href: '/#laws' },
      { label: 'Блог', href: '/blog' },
      { label: 'Пример полного отчёта', href: '/example' },
    ],
  },
];

const colTitle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono Variable', monospace",
  fontSize: 14,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#9da7ba',
  marginBottom: 16,
};
const colLink: React.CSSProperties = { fontSize: 16, color: '#c7d3ea', display: 'block', marginBottom: 10 };

export function SiteFooter() {
  const pathname = usePathname();
  const isSeo = pathname === '/seo' || pathname.startsWith('/seo/');
  const cols = isSeo ? seoCols : lawCols;
  const subtitle = isSeo ? 'ПО SEO ОПТИМИЗАЦИИ' : 'НА ЗАКОНЫ РФ';
  const brandDesc = isSeo
    ? 'Проверка сайта по законам РФ и технический SEO-аудит — в одном сервисе.'
    : 'Автоматическая проверка сайта на соответствие требованиям Роскомнадзора и 152-ФЗ. Быстро и точно.';

  return (
    <footer style={{ maxWidth: 1200, margin: '100px auto 0', padding: '48px 24px 40px', borderTop: '1px solid rgba(186,215,247,0.08)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px 56px', textAlign: 'left', alignItems: 'flex-start' }}>
        {/* Бренд */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 9999, background: 'rgba(186,214,247,0.06)', boxShadow: 'rgba(186,215,247,0.16) 0px 0px 0px 1px inset', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1e4fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2 L20 6 V11 C20 16.5 16.6 20.7 12 22 C7.4 20.7 4 16.5 4 11 V6 Z" />
                <path d="M9 12 L11 14 L15 9.5" />
              </svg>
            </div>
            <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: "'Dela Gothic One', sans-serif", fontSize: 17, letterSpacing: '0.02em', display: 'inline-flex', alignItems: 'baseline', textShadow: '0 0 18px rgba(152,192,239,0.35)' }}>
                <span style={{ background: 'linear-gradient(90deg, #98c0ef, #d8ecf8, #e5ddff, #d8ecf8, #98c0ef)', backgroundSize: '250% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'sheen 4.5s linear infinite' }}>
                  ПРОВЕРКАСАЙТОВ
                </span>
                <span style={{ color: '#b6d9fc' }}>.РФ</span>
              </span>
              <span style={{ fontFamily: "'Dela Gothic One', sans-serif", fontSize: 11, letterSpacing: '0.16em', color: '#9da7ba' }}>{subtitle}</span>
            </span>
          </div>
          <p style={{ margin: '16px 0 0', fontSize: 15, color: '#9da7ba', lineHeight: 1.6, maxWidth: 260 }}>{brandDesc}</p>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15, color: '#c7d3ea' }}>
            <span>support@проверкасайтов.рф</span>
            <span>@proverkasaytovrf_bot</span>
          </div>
          <p style={{ marginTop: 16, fontSize: 15, color: '#9da7ba', maxWidth: 300 }}>
            Сервис частный. Не является государственным органом, не связан и не аффилирован с Роскомнадзором.
          </p>
        </div>

        {/* Колонки-ссылки (по силосу) */}
        {cols.map((c) => (
          <div key={c.title}>
            <div style={colTitle}>{c.title}</div>
            {c.links.map((l) => (
              <Link key={l.label} href={l.href} style={colLink}>
                {l.label}
              </Link>
            ))}
          </div>
        ))}

        {/* Подписка */}
        <div style={{ marginLeft: 'auto', flex: '1 1 240px', minWidth: 220, maxWidth: 340 }}>
          <div style={colTitle}>Следите за изменениями</div>
          <p style={{ fontSize: 15, color: '#9da7ba', lineHeight: 1.6 }}>
            {isSeo
              ? 'Уведомим об изменениях в алгоритмах, новых требованиях к скорости и SEO, которые касаются вашего сайта.'
              : 'Уведомим о новых штрафах, законах и требованиях РКН, которые касаются вашего сайта.'}
          </p>
          <LeadCapture
            placeholder="Ваш email"
            buttonLabel="Подписаться на обновления"
            sentLabel="Вы подписаны ✓"
            consent={
              <>
                Соглашаюсь с{' '}
                <a href="/privacy" style={{ color: '#c7d3ea', textDecoration: 'underline', textDecorationColor: 'rgba(186,215,247,0.3)' }}>
                  политикой конфиденциальности
                </a>
              </>
            }
          />
        </div>
      </div>

      {/* Нижняя полоса */}
      <div style={{ marginTop: 44, paddingTop: 20, borderTop: '1px solid rgba(186,215,247,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px 20px', flexWrap: 'wrap', fontSize: 14, color: '#9da7ba' }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <span>Данные обрабатываются на серверах в России</span>
          {isSeo && (
            <>
              <Link href="/offer" style={{ color: '#9da7ba' }}>Оферта</Link>
              <Link href="/privacy" style={{ color: '#9da7ba' }}>Политика конфиденциальности</Link>
              <Link href="/contacts" style={{ color: '#9da7ba' }}>Контакты</Link>
            </>
          )}
        </div>
        <span>© 2026 ПРОВЕРКАСАЙТОВ.РФ</span>
      </div>
      <p style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(186,215,247,0.06)', textAlign: 'center', fontSize: 14, color: '#9da7ba' }}>
        Результаты проверки носят информационный характер и не являются юридической консультацией.
      </p>
    </footer>
  );
}
