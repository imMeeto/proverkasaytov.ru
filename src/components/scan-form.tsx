'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

// Форма скана — точная копия карточки из docs/design-dev/PravoScan.dc.html (строки 74-101),
// поверх рабочей логики отправки (POST /api/scan → редирект на /report/[id]).

const CornerDot = ({ pos }: { pos: React.CSSProperties }) => (
  <span
    style={{
      position: 'absolute',
      width: 4,
      height: 4,
      borderRadius: 9999,
      background: '#d8ecf8',
      opacity: 0.5,
      boxShadow: '0 0 6px rgba(216,236,248,0.9)',
      ...pos,
    }}
  />
);

export function ScanForm() {
  const router = useRouter();
  const [url, setUrl] = React.useState('');
  const [pd, setPd] = React.useState(false);
  const [own, setOwn] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const canSubmit = url.trim().length > 0 && pd && own && !loading;

  async function onSubmit() {
    if (!canSubmit) {
      if (!pd || !own) setError('Отметьте оба согласия ниже');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, consentPd: true, consentOwnership: true, captchaToken: '' }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error?.message ?? 'Не удалось запустить проверку');
        setLoading(false);
        return;
      }
      router.push(`/report/${json.data.scanId}`);
    } catch {
      setError('Сеть недоступна. Попробуйте ещё раз.');
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        marginTop: 40,
        width: '100%',
        maxWidth: 780,
        borderRadius: 16,
        background: 'rgba(17,21,44,0.97)',
        boxShadow:
          'rgba(216,236,248,0.22) 0px 1px 1px 0px inset, rgba(168,216,245,0.08) 0px 24px 48px 0px inset, rgba(186,215,247,0.16) 0px 0px 0px 1px inset, rgba(0,0,0,0.55) 0px 24px 48px 0px, rgba(102,58,243,0.15) 0px 0px 64px 0px',
        padding: '30px 32px 26px',
        textAlign: 'left',
      }}
    >
      <CornerDot pos={{ top: -2, left: -2 }} />
      <CornerDot pos={{ top: -2, right: -2 }} />
      <CornerDot pos={{ bottom: -2, left: -2 }} />
      <CornerDot pos={{ bottom: -2, right: -2 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b6d9fc" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12 H21 M12 3 C15 6.5 15 17.5 12 21 C9 17.5 9 6.5 12 3" />
        </svg>
        <span
          style={{
            fontFamily: "'JetBrains Mono Variable', monospace",
            fontSize: 16,
            letterSpacing: '0.12em',
            color: '#b6d9fc',
            textTransform: 'uppercase',
          }}
        >
          Введите адрес сайта — проверка начнётся сразу
        </span>
        <span style={{ width: 8, height: 14, background: '#663af3', animation: 'blinkDot 1.1s steps(1) infinite' }} />
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div
          style={{
            position: 'relative',
            flex: 1,
            minWidth: 250,
            borderRadius: 8,
            animation: loading ? undefined : 'inputPulse 2.6s ease-in-out infinite',
          }}
        >
          <svg
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9da7ba"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21 L16.5 16.5" />
          </svg>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
            placeholder="mysite.ru"
            inputMode="url"
            aria-label="Адрес сайта"
            style={{
              width: '100%',
              height: 66,
              border: 'none',
              outline: 'none',
              borderRadius: 8,
              background: 'rgba(199,211,234,0.07)',
              boxShadow: 'rgba(102,58,243,0.5) 0px 0px 0px 1px inset',
              color: '#ffffff',
              fontSize: 24,
              fontFamily: 'inherit',
              padding: '0 18px 0 52px',
            }}
          />
        </div>
        <button
          onClick={onSubmit}
          disabled={loading}
          style={{
            height: 66,
            padding: '0 30px',
            border: 'none',
            borderRadius: 999,
            background: '#663af3',
            color: '#ffffff',
            fontFamily: 'inherit',
            fontSize: 20,
            fontWeight: 700,
            cursor: loading ? 'default' : 'pointer',
            transition: 'transform 0.3s cubic-bezier(0.2,0.7,0.2,1), box-shadow 0.3s ease, background 0.3s ease',
            whiteSpace: 'nowrap',
            boxShadow: '0 0 28px rgba(102,58,243,0.45)',
            opacity: loading ? 0.75 : 1,
          }}
          onMouseEnter={(e) => {
            if (loading) return;
            e.currentTarget.style.background = '#744ef5';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#663af3';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {loading ? 'Запускаю…' : 'Проверить бесплатно'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 15, color: '#9da7ba', cursor: 'pointer' }}>
          <input type="checkbox" checked={pd} onChange={(e) => setPd(e.target.checked)} style={{ marginTop: 2, accentColor: '#663af3' }} />
          <span>
            Соглашаюсь на обработку персональных данных согласно{' '}
            <a href="/privacy" style={{ color: '#c7d3ea', textDecoration: 'underline', textDecorationColor: 'rgba(186,215,247,0.3)' }}>
              политике
            </a>
          </span>
        </label>
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 15, color: '#9da7ba', cursor: 'pointer' }}>
          <input type="checkbox" checked={own} onChange={(e) => setOwn(e.target.checked)} style={{ marginTop: 2, accentColor: '#663af3' }} />
          <span>Подтверждаю, что являюсь владельцем сайта или уполномочен на его проверку</span>
        </label>
      </div>

      {error && <p style={{ marginTop: 12, fontSize: 15, color: '#e46d4c' }}>{error}</p>}

      <div
        style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: '1px solid rgba(186,215,247,0.08)',
          display: 'flex',
          gap: 14,
          flexWrap: 'wrap',
          fontFamily: "'JetBrains Mono Variable', monospace",
          fontSize: 13,
          letterSpacing: '0.08em',
          color: '#9da7ba',
          textTransform: 'uppercase',
        }}
      >
        <span>занимает 30–120 сек</span>
        <span>·</span>
        <span>отчёт до 10 страниц</span>
        <span>·</span>
        <span>умный робот</span>
        <span>·</span>
        <span>попробовать бесплатно</span>
      </div>
    </div>
  );
}
