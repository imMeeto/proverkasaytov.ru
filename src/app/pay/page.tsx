import type { Metadata } from 'next';
import Link from 'next/link';
import * as React from 'react';
import { LeadCapture } from '@/components/lead-capture';
import { BackReportLink, ReturnToReportButton, PaymentBox } from './pay-client';

// Экран «Оплата» — точная копия showPaywall из docs/design-dev/PravoScan.dc.html
// (строки ~639-712). Фон #161b36, шапка и футер — в layout. Здесь — три тарифа.
// Реального приёма платежей нет: поле почты и кнопка оплаты визуальные (Фаза 4).

export const metadata: Metadata = {
  title: 'Оплата',
  description:
    'Выберите, как закрыть нарушения: бесплатный отчёт, полный отчёт за 700 ₽ или исправление под ключ. Оплата картой или по СБП.',
};

const dela = "'Dela Gothic One', sans-serif";
const mono = "'JetBrains Mono Variable', monospace";

const skywash: React.CSSProperties = {
  background: 'linear-gradient(180deg, #d8ecf8 0%, #98c0ef 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const glassCard: React.CSSProperties = {
  borderRadius: 16,
  background: 'linear-gradient(180deg, rgba(186,214,247,0.075), rgba(186,214,247,0.028))',
  boxShadow:
    'rgba(216,236,248,0.14) 0px 1px 1px 0px inset, rgba(186,215,247,0.17) 0px 0px 0px 1px inset, rgba(0,0,0,0.5) 0px 20px 40px -14px',
  padding: 24,
};

// Приподнятая «модальная» поверхность ключевых карточек.
const modalShadow =
  'rgba(216,236,248,0.22) 0px 1px 1px 0px inset, rgba(168,216,245,0.08) 0px 24px 48px 0px inset, rgba(186,215,247,0.16) 0px 0px 0px 1px inset, rgba(0,0,0,0.55) 0px 24px 48px 0px';

const greenBadge: React.CSSProperties = {
  borderRadius: 6,
  background: 'rgba(38,150,132,0.12)',
  boxShadow: 'rgba(38,150,132,0.3) 0px 0px 0px 1px inset',
  color: '#3fbca6',
  fontWeight: 700,
  padding: '4px 10px',
};

const miniTile: React.CSSProperties = {
  borderRadius: 10,
  background: 'rgba(199,211,234,0.09)',
  boxShadow: 'rgba(186,215,247,0.2) 0px 0px 0px 1px inset, rgba(6,8,18,0.55) 0px 12px 28px -6px',
  padding: '12px 14px',
};

// Четыре угловых «искры» приподнятых карточек.
function CornerDots() {
  const dot: React.CSSProperties = {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 9999,
    background: '#d8ecf8',
    opacity: 0.5,
    boxShadow: '0 0 6px rgba(216,236,248,0.9)',
  };
  return (
    <>
      <span style={{ ...dot, top: -2, left: -2 }} />
      <span style={{ ...dot, top: -2, right: -2 }} />
      <span style={{ ...dot, bottom: -2, left: -2 }} />
      <span style={{ ...dot, bottom: -2, right: -2 }} />
    </>
  );
}

export default function PayPage() {
  return (
    <section style={{ position: 'relative', padding: '48px 24px', animation: 'fadeUp 0.4s ease both' }}>
      <div style={{ width: '100%', maxWidth: 1360, margin: '0 auto' }}>
        <BackReportLink />

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1
            style={{
              ...skywash,
              fontFamily: dela,
              fontWeight: 400,
              fontSize: 'clamp(22px, 3vw, 36px)',
              lineHeight: 1.05,
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            Выберите, как закрыть нарушения
          </h1>
          <div
            style={{
              marginTop: 12,
              fontFamily: mono,
              fontSize: 14,
              letterSpacing: '0.1em',
              color: '#9da7ba',
              textTransform: 'uppercase',
            }}
          >
            7 нарушений · 5 замечаний · оплата картой или по СБП
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 20,
            alignItems: 'stretch',
            textAlign: 'left',
          }}
        >
          {/* ===== Тариф 1 — Бесплатный отчёт ===== */}
          <div style={{ ...glassCard, position: 'relative', padding: 28, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.1em', color: '#9da7ba', textTransform: 'uppercase' }}>
              Бесплатный отчёт
            </div>
            <div style={{ fontFamily: dela, fontSize: 38, color: '#d8ecf8', marginTop: 12 }}>0 ₽</div>
            <div style={{ marginTop: 8 }}>
              <span style={{ ...greenBadge, fontSize: 14 }}>уже открыт для вашего сайта</span>
            </div>
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 16, color: '#c7d3ea' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: '#269684' }}>✓</span>
                <span>Балл риска из 100</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: '#269684' }}>✓</span>
                <span>Счётчики: нарушения / замечания / выполнено</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: '#269684' }}>✓</span>
                <span>2 самых критичных нарушения полностью</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: '#9da7ba' }}>·</span>
                <span style={{ color: '#9da7ba' }}>Остальные 10 пунктов — под замком</span>
              </div>
            </div>
            <div style={{ marginTop: 'auto', paddingTop: 20 }}>
              <ReturnToReportButton />
            </div>
          </div>

          {/* ===== Тариф 2 — Полный отчёт 700 ₽ (центр) ===== */}
          <div style={{ position: 'relative', borderRadius: 16, background: 'rgba(17,21,44,0.97)', boxShadow: modalShadow, padding: 32 }}>
            <CornerDots />
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 6,
                background: 'rgba(228,109,76,0.12)',
                boxShadow: 'rgba(228,109,76,0.3) 0px 0px 0px 1px inset',
                padding: '6px 12px',
                fontSize: 15,
                fontWeight: 700,
                color: '#e46d4c',
              }}
            >
              ⚠ Найдено 7 нарушений — 5 из них скрыты
            </div>
            <h2
              style={{
                fontFamily: dela,
                fontWeight: 400,
                fontSize: 'clamp(23px, 2.8vw, 30px)',
                lineHeight: 1.08,
                color: '#d8ecf8',
                textTransform: 'uppercase',
                margin: '16px 0 0',
              }}
            >
              Узнайте все нарушения — пока их не нашёл Роскомнадзор
            </h2>
            <div style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.1em', color: '#9da7ba', textTransform: 'uppercase', marginTop: 10 }}>
              Полный отчёт · доступ навсегда
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 18, flexWrap: 'wrap' }}>
              <div style={{ ...skywash, fontFamily: dela, fontSize: 60, lineHeight: 1 }}>700 ₽</div>
              <div style={{ fontSize: 18, color: '#9da7ba', textDecoration: 'line-through' }}>1 900 ₽</div>
              <span style={{ ...greenBadge, fontSize: 15 }}>−63% к цене конкурентов</span>
            </div>
            <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
              <div style={miniTile}>
                <div style={{ fontFamily: dela, fontSize: 19, color: '#d8ecf8' }}>7 + 5</div>
                <div style={{ marginTop: 4, fontSize: 14, color: '#9da7ba' }}>нарушений и замечаний — полностью</div>
              </div>
              <div style={miniTile}>
                <div style={{ fontFamily: dela, fontSize: 19, color: '#d8ecf8' }}>{'<код>'}</div>
                <div style={{ marginTop: 4, fontSize: 14, color: '#9da7ba' }}>готовые сниппеты для разработчика</div>
              </div>
              <div style={miniTile}>
                <div style={{ fontFamily: dela, fontSize: 19, color: '#d8ecf8' }}>PDF</div>
                <div style={{ marginTop: 4, fontSize: 14, color: '#9da7ba' }}>на почту + вечная ссылка</div>
              </div>
            </div>
            <div style={{ marginTop: 24, borderTop: '1px solid rgba(186,215,247,0.08)', paddingTop: 20 }}>
              <label style={{ fontSize: 16, color: '#9da7ba' }}>Почта для PDF-отчёта</label>
              <PaymentBox />
              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                  fontFamily: mono,
                  fontSize: 13,
                  letterSpacing: '0.06em',
                  color: '#9da7ba',
                  textTransform: 'uppercase',
                }}
              >
                <span>доступ сразу после оплаты</span>
                <span>·</span>
                <span>карта или СБП</span>
                <span>·</span>
                <span>без регистрации</span>
              </div>
              <div style={{ marginTop: 12, fontSize: 14, color: '#9da7ba', textAlign: 'center' }}>
                Оплачивая, вы принимаете{' '}
                <Link href="/offer" style={{ color: '#c7d3ea', textDecoration: 'underline', textDecorationColor: 'rgba(186,215,247,0.3)' }}>
                  оферту
                </Link>
                . Отчёт носит информационный характер.
              </div>
            </div>
          </div>

          {/* ===== Тариф 3 — Исправим за вас от 20 000 ₽ ===== */}
          <div
            style={{
              position: 'relative',
              borderRadius: 16,
              background: 'rgba(17,21,44,0.97)',
              boxShadow: `${modalShadow}, rgba(102,58,243,0.28) 0px 0px 56px 0px`,
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CornerDots />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.1em', color: '#c7d3ea', textTransform: 'uppercase' }}>
                Исправим за вас
              </div>
              <span
                style={{
                  marginLeft: 'auto',
                  borderRadius: 6,
                  background: 'rgba(102,58,243,0.18)',
                  boxShadow: 'rgba(102,58,243,0.45) 0px 0px 0px 1px inset',
                  color: '#cbbcff',
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '4px 10px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Рекомендуем
              </span>
            </div>
            <div style={{ ...skywash, fontFamily: dela, fontSize: 38, marginTop: 12 }}>от 20 000 ₽</div>
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 16, color: '#c7d3ea' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: '#269684' }}>✓</span>
                <span style={{ fontWeight: 700, color: '#d8ecf8' }}>Полный отчёт за 700 ₽ — уже включён</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: '#269684' }}>✓</span>
                <span>Доработаем код сайта по всем пунктам отчёта</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: '#269684' }}>✓</span>
                <span>Обновим документы: политика, оферта, согласия</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: '#269684' }}>✓</span>
                <span>Перепроверим сайт до зелёного статуса</span>
              </div>
            </div>
            <div style={{ marginTop: 'auto', paddingTop: 20 }}>
              <LeadCapture
                placeholder="телефон или @telegram"
                buttonLabel="Оставить заявку"
                sentLabel="Заявка отправлена — свяжемся в течение рабочего дня"
                successBlock
                compact
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
