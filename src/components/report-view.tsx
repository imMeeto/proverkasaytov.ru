'use client';

import * as React from 'react';
import Link from 'next/link';
import type { PublicScan, PublicCheckResult } from '@/server/report/serialize';
import type { ScanEvent } from '@/lib/constants';
import { ScoreRing } from '@/components/score-ring';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { SpinnerIcon } from '@/components/icons';

const STAGE_PERCENT: Record<string, number> = {
  queued: 6,
  infra: 18,
  pages: 30,
  crawl: 55,
  registry: 70,
  checks: 85,
  scoring: 95,
  done: 100,
  failed: 100,
};

const STAGE_LABEL: Record<string, string> = {
  queued: 'В очереди на проверку…',
  infra: 'Проверяю соединение и сертификат',
  pages: 'Выбираю страницы для обхода',
  crawl: 'Обхожу страницы сайта',
  registry: 'Сверяю данные с реестром РКН',
  checks: 'Прогоняю проверки',
  scoring: 'Считаю итоговый балл',
  done: 'Готово',
  failed: 'Не удалось проверить сайт',
};

function verdict(score: number | null): { label: string; color: string } {
  if (score == null) return { label: 'Проверка завершена', color: 'var(--color-fog-veil)' };
  if (score >= 80) return { label: 'Серьёзных проблем не найдено', color: 'var(--color-verdict-green)' };
  if (score >= 50) return { label: 'Есть нарушения', color: 'var(--color-verdict-yellow)' };
  return { label: 'Найдено много нарушений', color: 'var(--color-verdict-red)' };
}

export function ReportView({
  initialScan,
  initialResults,
}: {
  initialScan: PublicScan;
  initialResults: PublicCheckResult[];
}) {
  const [scan, setScan] = React.useState<PublicScan>(initialScan);
  const [results, setResults] = React.useState<PublicCheckResult[]>(initialResults);
  const [stage, setStage] = React.useState<string>(initialScan.status);
  const [message, setMessage] = React.useState<string>('');

  const refetch = React.useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`/api/scans/${initialScan.id}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.ok) {
        setScan(json.data.scan);
        setResults(json.data.results);
        return json.data.scan.status as string;
      }
    } catch {
      /* ignore */
    }
    return null;
  }, [initialScan.id]);

  React.useEffect(() => {
    if (initialScan.status === 'done' || initialScan.status === 'failed') return;

    let es: EventSource | null = null;
    let poll: ReturnType<typeof setInterval> | null = null;
    let stopped = false;

    const stopPoll = () => {
      if (poll) {
        clearInterval(poll);
        poll = null;
      }
    };
    const startPoll = () => {
      if (poll || stopped) return;
      poll = setInterval(async () => {
        const st = await refetch();
        if (st === 'done' || st === 'failed') stopPoll();
      }, 3000);
    };
    const finish = () => {
      stopped = true;
      es?.close();
      stopPoll();
      void refetch();
    };

    try {
      es = new EventSource(`/api/events/scan/${initialScan.id}`);
      es.onmessage = (ev) => {
        let data: ScanEvent;
        try {
          data = JSON.parse(ev.data) as ScanEvent;
        } catch {
          return;
        }
        setStage(data.stage);
        if (data.message) setMessage(data.message);
        if (data.stage === 'done' || data.stage === 'failed') finish();
      };
      es.onerror = () => {
        es?.close();
        es = null;
        startPoll(); // фолбэк на поллинг (ПС-05 §3)
      };
    } catch {
      startPoll();
    }

    return () => {
      stopped = true;
      es?.close();
      stopPoll();
    };
  }, [initialScan.id, initialScan.status, refetch]);

  const domain = scan.domain;

  // ---- Состояние: выполняется ----
  if (scan.status === 'queued' || scan.status === 'running') {
    const pct = STAGE_PERCENT[stage] ?? 6;
    return (
      <div className="flex flex-col gap-6">
        <ReportHeader domain={domain} url={scan.url} />
        <GlassCard variant="modal">
          <div className="flex items-center gap-3 text-frost-glow">
            <SpinnerIcon className="text-blueprint-blue" />
            <span className="text-subheading">{message || STAGE_LABEL[stage] || 'Проверяю…'}</span>
          </div>
          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-[rgba(186,215,247,0.08)]">
            <div
              className="h-full rounded-full bg-void-violet transition-[width] duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-6 flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-4 rounded bg-[rgba(186,215,247,0.06)]"
                style={{ width: `${90 - i * 18}%` }}
              />
            ))}
          </div>
          <p className="mt-6 text-caption text-fog-veil">
            Обычно проверка занимает 30–120 секунд. Страница обновится автоматически.
          </p>
        </GlassCard>
      </div>
    );
  }

  // ---- Состояние: ошибка ----
  if (scan.status === 'failed') {
    return (
      <div className="flex flex-col gap-6">
        <ReportHeader domain={domain} url={scan.url} />
        <GlassCard variant="modal">
          <h2 className="text-heading-sm text-ice-highlight">Не удалось проверить сайт</h2>
          <p className="mt-3 text-body-sm text-fog-veil">
            {scan.error || 'Сайт не отвечает или проверка прервалась. Попробуйте позже.'}
          </p>
          <div className="mt-6">
            <Link href="/#scan">
              <Button variant="primary">Проверить заново</Button>
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  // ---- Состояние: готово ----
  const v = verdict(scan.score);
  return (
    <div className="flex flex-col gap-6">
      <ReportHeader domain={domain} url={scan.url} />
      <GlassCard variant="modal">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-10">
          <ScoreRing score={scan.score} />
          <div className="text-center sm:text-left">
            <div className="text-heading-sm" style={{ color: v.color }}>
              {v.label}
            </div>
            <div className="mt-2 text-body-sm text-fog-veil">
              Проверено страниц: {scan.pagesCrawled}. Домен: {domain}.
            </div>
          </div>
        </div>
      </GlassCard>

      {results.length > 0 ? (
        <div className="flex flex-col gap-3">
          {results.map((r) => (
            <GlassCard key={r.checkId} className="flex items-center justify-between">
              <span className="text-body-sm text-moon-mist">{r.checkId}</span>
              <span className="text-caption text-fog-veil uppercase">{r.status}</span>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard>
          <p className="text-body-sm text-fog-veil">
            Каркас готов: сквозной путь «запрос → очередь → воркер → отчёт» работает. Движок из 21
            проверки и разбор нарушений подключаются в Фазах 2–3.
          </p>
        </GlassCard>
      )}
    </div>
  );
}

function ReportHeader({ domain, url }: { domain: string; url: string }) {
  return (
    <div>
      <div className="eyebrow">Отчёт проверки</div>
      <h1 className="mt-2 text-heading text-ice-highlight" style={{ fontFamily: 'var(--font-aeonikpro)' }}>
        {domain}
      </h1>
      <a href={url} target="_blank" rel="noreferrer" className="mt-1 block text-caption text-fog-veil">
        {url}
      </a>
    </div>
  );
}
