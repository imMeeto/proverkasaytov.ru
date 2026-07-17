import Link from 'next/link';
import { LeadCapture } from '@/components/lead-capture';

// Футер — точная копия из docs/design-dev/PravoScan.dc.html (строки 424-479).
// Дисклеймеры обязательны (ПС-00 §3, ПС-09 §2). Ссылки ведут на реальные юрстраницы.

const serviceLinks = [
  { label: 'Проверить сайт', href: '/#scan' },
  { label: 'Что проверяем', href: '/#laws' },
  { label: 'Блог', href: '/#blog' },
  { label: 'Вопросы и ответы', href: '/#pricing' },
  { label: 'Пример отчёта', href: '/#pricing' },
];

const docLinks = [
  { label: 'Политика конфиденциальности', href: '/privacy' },
  { label: 'Условия использования', href: '/offer' },
  { label: 'Публичная оферта', href: '/offer' },
  { label: 'Согласие на обработку ПД', href: '/consent' },
  { label: 'Согласие на рекламную рассылку', href: '/consent' },
  { label: 'Политика Cookie', href: '/cookies' },
  { label: 'Реквизиты', href: '/requisites' },
];

const colTitle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono Variable', monospace",
  fontSize: 13,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#c7d3ea',
  marginBottom: 14,
};
const colLink: React.CSSProperties = { fontSize: 15, color: '#9da7ba', display: 'block', marginBottom: 10 };

export function SiteFooter() {
  return (
    <footer style={{ marginTop: 120, borderTop: '1px solid rgba(186,215,247,0.08)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 32 }}>
          {/* Колонка 1 — бренд */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9999,
                  background: 'rgba(186,214,247,0.06)',
                  boxShadow: 'rgba(186,215,247,0.12) 0px 0px 0px 1px inset',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1e4fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2 L20 6 V11 C20 16.5 16.6 20.7 12 22 C7.4 20.7 4 16.5 4 11 V6 Z" />
                  <path d="M9 12 L11 14 L15 9.5" />
                </svg>
              </span>
              <span style={{ fontFamily: "'Dela Gothic One', sans-serif", fontSize: 15, letterSpacing: '0.02em' }}>
                <span className="text-skywash">ПРОВЕРКАСАЙТОВ</span>
                <span style={{ color: '#b6d9fc' }}>.РФ</span>
              </span>
            </div>
            <p style={{ marginTop: 14, fontSize: 15, color: '#9da7ba', maxWidth: 280 }}>
              Автоматическая проверка сайта на соответствие требованиям Роскомнадзора и 152-ФЗ. Быстро и точно.
            </p>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 15, color: '#9da7ba' }}>
              <span>support@проверкасайтов.рф</span>
              <span>@proverkasaytovrf_bot</span>
            </div>
            <p style={{ marginTop: 16, fontSize: 15, color: '#9da7ba', maxWidth: 300 }}>
              Сервис является частным. Не является государственным органом, не связан и не аффилирован с Роскомнадзором.
            </p>
          </div>

          {/* Колонка 2 — сервис */}
          <div>
            <div style={colTitle}>Сервис</div>
            {serviceLinks.map((l) => (
              <Link key={l.label} href={l.href} style={colLink}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Колонка 3 — документы */}
          <div>
            <div style={colTitle}>Документы</div>
            {docLinks.map((l) => (
              <Link key={l.label} href={l.href} style={colLink}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Колонка 4 — подписка */}
          <div>
            <div style={colTitle}>Следите за изменениями</div>
            <p style={{ fontSize: 15, color: '#9da7ba' }}>Уведомим о новых штрафах, законах и требованиях РКН — без спама.</p>
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
        <div
          style={{
            marginTop: 40,
            paddingTop: 20,
            borderTop: '1px solid rgba(186,215,247,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: 14,
            color: '#9da7ba',
          }}
        >
          <span>Данные обрабатываются на серверах в России</span>
          <span>© 2026 ПРОВЕРКАСАЙТОВ.РФ</span>
        </div>
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#9da7ba' }}>
          Результаты проверки носят информационный характер и не являются юридической консультацией.
        </p>
      </div>
    </footer>
  );
}
