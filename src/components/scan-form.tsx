'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon, SpinnerIcon } from '@/components/icons';

export function ScanForm() {
  const router = useRouter();
  const [url, setUrl] = React.useState('');
  const [pd, setPd] = React.useState(false);
  const [own, setOwn] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const canSubmit = url.trim().length > 0 && pd && own && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
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
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder="адрес вашего сайта, например example.ru"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-label="Адрес сайта"
        />
        <Button type="submit" variant="primary" size="lg" disabled={!canSubmit} className="sm:w-auto">
          {loading ? (
            <>
              <SpinnerIcon /> Запускаю…
            </>
          ) : (
            <>
              Проверить <ArrowRightIcon />
            </>
          )}
        </Button>
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-body-sm text-moon-mist">
        <input
          type="checkbox"
          checked={pd}
          onChange={(e) => setPd(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#663af3]"
        />
        <span>
          Даю согласие на обработку персональных данных согласно{' '}
          <a href="/privacy" className="text-frost-glow underline underline-offset-2">
            Политике
          </a>{' '}
          и тексту{' '}
          <a href="/consent" className="text-frost-glow underline underline-offset-2">
            Согласия
          </a>
          .
        </span>
      </label>

      <label className="flex cursor-pointer items-start gap-3 text-body-sm text-moon-mist">
        <input
          type="checkbox"
          checked={own}
          onChange={(e) => setOwn(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#663af3]"
        />
        <span>Подтверждаю, что являюсь владельцем сайта или уполномочен на его проверку.</span>
      </label>

      {error && <p className="text-body-sm text-ember-glow">{error}</p>}

      <p className="text-caption text-fog-veil">
        Проверяем до 10 страниц в настоящем браузере. Обычно занимает 30–120 секунд.
      </p>
    </form>
  );
}
