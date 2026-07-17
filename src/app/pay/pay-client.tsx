'use client';

import * as React from 'react';
import Link from 'next/link';

// Интерактивные островки экрана «Оплата» (hover-эффекты + поле почты).
// Реальной оплаты здесь НЕТ — приём платежей будет в Фазе 4. Кнопка оплаты
// только визуальная (без сабмита), поле почты — обычный текстовый инпут.

// «← Назад к отчёту» — текстовая ссылка с hover-подсветкой.
export function BackReportLink() {
  return (
    <Link
      href="/example"
      style={{
        color: '#9da7ba',
        fontSize: 16,
        textDecoration: 'none',
        marginBottom: 20,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = '#d1e4fa';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = '#9da7ba';
      }}
    >
      ← Назад к отчёту
    </Link>
  );
}

// «Вернуться к отчёту» — pill-кнопка (ссылка) в карточке бесплатного тарифа.
export function ReturnToReportButton() {
  return (
    <Link
      href="/example"
      style={{
        width: '100%',
        height: 48,
        borderRadius: 999,
        background: 'rgba(186,214,247,0.06)',
        boxShadow: 'rgba(186,215,247,0.16) 0px 0px 0px 1px inset',
        color: '#ffffff',
        fontSize: 17,
        fontWeight: 500,
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.3s cubic-bezier(0.2,0.7,0.2,1), background 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(186,214,247,0.14)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(186,214,247,0.06)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      Вернуться к отчёту
    </Link>
  );
}

// Поле почты для PDF + кнопка оплаты. Визуальные: сабмита/оплаты нет (Фаза 4).
export function PaymentBox() {
  const [email, setEmail] = React.useState('');
  return (
    <>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.ru"
        style={{
          marginTop: 8,
          width: '100%',
          height: 46,
          border: 'none',
          outline: 'none',
          borderRadius: 6,
          background: 'rgba(199,211,234,0.06)',
          boxShadow: 'rgba(186,215,247,0.12) 0px 0px 0px 1px inset',
          color: '#ffffff',
          fontSize: 18,
          fontFamily: 'inherit',
          padding: '0 14px',
        }}
      />
      <button
        type="button"
        style={{
          marginTop: 14,
          width: '100%',
          height: 56,
          border: 'none',
          borderRadius: 999,
          background: '#663af3',
          boxShadow: '0 0 32px rgba(102,58,243,0.5)',
          color: '#ffffff',
          fontFamily: 'inherit',
          fontSize: 19,
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'transform 0.3s cubic-bezier(0.2,0.7,0.2,1), background 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#744ef5';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#663af3';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        Открыть полный отчёт — 700 ₽
      </button>
    </>
  );
}
