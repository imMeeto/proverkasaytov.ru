'use client';

import * as React from 'react';

// FAQ-аккордеон — копия секции «Вопросы и ответы» из docs/design-dev/SeoAudit.dc.html
// (строки 390-410, данные faqData). Первый пункт раскрыт по умолчанию.

const faqData = [
  { q: 'Экспресс-аудит правда бесплатный?', a: 'Да. Проверка одной страницы по 15 параметрам бесплатна и без ограничений по количеству. Платный только полный аудит всего сайта и мониторинг.' },
  { q: 'Нужна ли регистрация?', a: 'Нет. Вставьте адрес страницы и сразу получите результат. Почта нужна только если хотите PDF-отчёт полного аудита.' },
  { q: 'Чем экспресс-аудит отличается от полного?', a: 'Экспресс проверяет одну страницу и показывает основные проблемы. Полный аудит обходит весь сайт, находит проблемы на всех страницах и расставляет приоритеты по влиянию на трафик.' },
  { q: 'Как часто проверять сайт?', a: 'Разовую проверку — после каждого крупного обновления. Для рабочих сайтов удобнее мониторинг: он сам следит за скоростью, SSL и SEO-изменениями и присылает алерты.' },
  { q: 'Вы храните данные моего сайта?', a: 'Мы сохраняем только отчёт, чтобы вы могли открыть его по ссылке. Данные обрабатываются на серверах в России.' },
];

export function SeoFaq() {
  const [open, setOpen] = React.useState(0);

  return (
    <div
      style={{
        marginTop: 40,
        borderRadius: 16,
        background: 'linear-gradient(180deg, rgba(186,214,247,0.075), rgba(186,214,247,0.028))',
        boxShadow: 'rgba(216,236,248,0.14) 0px 1px 1px 0px inset, rgba(186,215,247,0.17) 0px 0px 0px 1px inset, rgba(0,0,0,0.5) 0px 20px 40px -14px',
        overflow: 'hidden',
      }}
    >
      {faqData.map((q, i) => {
        const isOpen = open === i;
        return (
          <div
            key={q.q}
            onClick={() => setOpen(isOpen ? -1 : i)}
            style={{ padding: '20px 24px', borderTop: i === 0 ? '1px solid transparent' : '1px solid rgba(186,215,247,0.1)', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#d8ecf8' }}>{q.q}</span>
              <span style={{ color: '#b6d9fc', flexShrink: 0, display: 'inline-block', transform: `rotate(${isOpen ? '180deg' : '0deg'})`, transition: 'transform 0.3s ease' }}>▾</span>
            </div>
            {isOpen && <div style={{ marginTop: 12, fontSize: 16, color: '#c7d3ea', lineHeight: 1.6, textWrap: 'pretty' }}>{q.a}</div>}
          </div>
        );
      })}
    </div>
  );
}
