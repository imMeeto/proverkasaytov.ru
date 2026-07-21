import type { Metadata } from 'next';
import Link from 'next/link';
import * as React from 'react';
import { SeoReportOverview } from '@/components/seo-report-overview';

// Статическая страница-пример SEO-отчёта — точная копия экрана data-screen-label="SEO-отчёт"
// (showReport) из docs/design-dev/SeoAudit.dc.html на ДЕМО-данных из <script> макета.
// Server-компонент; единственный интерактив — табы устройства (островок SeoReportOverview).
// Фон #161b36, шапка и футер приходят из layout — здесь не дублируются.

export const metadata: Metadata = {
  title: 'Пример SEO-отчёта',
  description:
    'Как выглядит SEO-отчёт проверки: балл скорости, кольца категорий PageSpeed, Core Web Vitals, сгруппированные проверки скорости и SEO, план и рекомендации. Демонстрация на примере данных.',
};

const dela = "'Dela Gothic One', sans-serif";
const mono = "'JetBrains Mono Variable', monospace";

// ---- Цвета светофора и серьёзности (дословно из <script> макета) ----
type Tok = 'gold' | 'red' | 'green';
const COLOR: Record<Tok, string> = { gold: '#d9a84c', red: '#e46d4c', green: '#269684' };
const GLOW: Record<Tok, string> = {
  gold: 'rgba(217,168,76,0.9)',
  red: 'rgba(228,109,76,0.9)',
  green: 'rgba(38,150,132,0.9)',
};

interface SevStyle {
  bg: string;
  ring: string;
  color: string;
}
function sevStyle(sev: string): SevStyle {
  if (sev === 'критично') return { bg: 'rgba(228,109,76,0.16)', ring: 'rgba(228,109,76,0.45)', color: '#e46d4c' };
  if (sev === 'важно') return { bg: 'rgba(217,168,76,0.16)', ring: 'rgba(217,168,76,0.45)', color: '#d9a84c' };
  if (sev === 'ок') return { bg: 'rgba(38,150,132,0.16)', ring: 'rgba(38,150,132,0.45)', color: '#3fbca6' };
  if (sev.charAt(0) === '−' || sev.charAt(0) === '-')
    return { bg: 'rgba(102,58,243,0.18)', ring: 'rgba(102,58,243,0.5)', color: '#cbbcff' };
  return { bg: 'rgba(199,211,234,0.1)', ring: 'rgba(186,215,247,0.22)', color: '#c7d3ea' };
}

// ---- Демо-данные проверок ----
interface Row {
  dot: Tok;
  title: string;
  note: string;
  sev: string;
  fix?: string;
}
interface Group {
  name: string;
  dot: Tok;
  rows: Row[];
}

// Секция 01 — Скорость и техническое здоровье (speedGroups макета, порядок сохранён).
const speedGroups: Group[] = [
  {
    name: 'Возможности ускорения',
    dot: 'red',
    rows: [
      {
        dot: 'red',
        title: 'Отложите ресурсы, блокирующие рендеринг',
        note: 'CSS и JS в <head> задерживают первую отрисовку страницы.',
        sev: '− 1,4 с',
        fix: 'Вынесите критический CSS inline, остальной CSS/JS подключайте с defer/async.',
      },
      {
        dot: 'red',
        title: 'Настройте показ изображений нужного размера',
        note: 'Браузер грузит картинки крупнее, чем нужно контейнеру.',
        sev: '− 1,1 с',
        fix: 'Отдавайте изображения под размер контейнера через srcset/sizes.',
      },
      {
        dot: 'gold',
        title: 'Используйте современные форматы изображений',
        note: 'JPEG/PNG весят больше, чем WebP/AVIF.',
        sev: '− 720 КБ',
        fix: 'Конвертируйте изображения в WebP или AVIF.',
      },
      {
        dot: 'gold',
        title: 'Удалите неиспользуемый JavaScript',
        note: 'В бандл попадает код, который не выполняется на странице.',
        sev: '− 480 КБ',
        fix: 'Включите tree-shaking и code-splitting, уберите лишние библиотеки.',
      },
      {
        dot: 'gold',
        title: 'Удалите неиспользуемый CSS',
        note: 'Неиспользуемые правила увеличивают вес и время отрисовки.',
        sev: '− 90 КБ',
        fix: 'Уберите мёртвый CSS (PurgeCSS), выделите критический CSS.',
      },
      {
        dot: 'gold',
        title: 'Отложите загрузку внеэкранных изображений',
        note: 'Картинки ниже сгиба грузятся сразу и тормозят первый экран.',
        sev: '− 0,6 с',
        fix: 'Добавьте loading="lazy" офскрин-изображениям.',
      },
      {
        dot: 'gold',
        title: 'Включите текстовое сжатие',
        note: 'HTML, CSS и JS отдаются без gzip/brotli.',
        sev: '− 0,4 с',
        fix: 'Включите brotli или gzip на сервере/CDN.',
      },
      {
        dot: 'gold',
        title: 'Сократите время ответа сервера (TTFB 0,9 с)',
        note: 'Сервер долго отдаёт первый байт.',
        sev: '− 0,3 с',
        fix: 'Кэшируйте ответы, используйте CDN, оптимизируйте бэкенд и БД.',
      },
    ],
  },
  {
    name: 'Диагностика',
    dot: 'gold',
    rows: [
      {
        dot: 'gold',
        title: 'Основной поток занят 2,8 с',
        note: 'Долгие задачи JS блокируют отклик интерфейса.',
        sev: 'важно',
        fix: 'Разбейте длинные задачи, вынесите тяжёлые вычисления в web worker.',
      },
      {
        dot: 'gold',
        title: 'Слишком большой DOM — 1 840 узлов',
        note: 'Большое дерево DOM замедляет стиль и компоновку.',
        sev: 'совет',
        fix: 'Упростите разметку, виртуализируйте длинные списки.',
      },
      {
        dot: 'green',
        title: 'Кэш статических ресурсов настроен частично',
        note: 'Часть файлов имеет короткий срок кэша.',
        sev: 'совет',
        fix: 'Задайте Cache-Control: max-age для статики (30+ дней).',
      },
    ],
  },
  {
    name: 'Лучшие практики',
    dot: 'gold',
    rows: [
      { dot: 'green', title: 'Сайт использует HTTPS', note: 'Соединение защищено.', sev: 'ок' },
      {
        dot: 'gold',
        title: 'Ошибки в консоли браузера',
        note: 'В консоли зафиксированы JS-ошибки.',
        sev: 'совет',
        fix: 'Исправьте ошибки в консоли — они влияют на стабильность и доверие.',
      },
      {
        dot: 'gold',
        title: 'Изображения без указания размеров',
        note: 'Отсутствие width/height вызывает сдвиги вёрстки (CLS).',
        sev: 'важно',
        fix: 'Задайте width и height (или aspect-ratio) всем изображениям.',
      },
    ],
  },
  {
    name: 'Скорость',
    dot: 'red',
    rows: [
      {
        dot: 'red',
        title: 'LCP 4.1 с на мобильных',
        note: 'Основной контент грузится слишком долго (норма — до 2.5 с).',
        sev: 'критично',
        fix: 'Оптимизируйте главное изображение: WebP/AVIF, preload, размер под контейнер. Уберите блокирующий JS.',
      },
      {
        dot: 'gold',
        title: 'Изображения без сжатия',
        note: 'Несколько картинок весят более 1 МБ и тормозят загрузку.',
        sev: 'важно',
        fix: 'Сожмите изображения и отдавайте в форматах WebP/AVIF с адаптивными размерами (srcset).',
      },
      {
        dot: 'gold',
        title: 'Нет кэширования статики',
        note: 'Браузер повторно грузит одни и те же файлы при каждом визите.',
        sev: 'совет',
        fix: 'Настройте Cache-Control: max-age для CSS, JS и изображений (например, 30 дней).',
      },
    ],
  },
  {
    name: 'Безопасность и SSL',
    dot: 'gold',
    rows: [
      {
        dot: 'green',
        title: 'SSL-сертификат действителен',
        note: 'HTTPS настроен корректно, цепочка доверия полная.',
        sev: 'ок',
      },
      {
        dot: 'gold',
        title: 'Отсутствует заголовок CSP',
        note: 'Content-Security-Policy защищает от внедрения чужих скриптов.',
        sev: 'важно',
        fix: 'Добавьте заголовок Content-Security-Policy, начните с режима report-only, затем ужесточайте.',
      },
    ],
  },
];

// Секция 02 — SEO и контент (seoGroups макета, порядок сохранён).
const seoGroups: Group[] = [
  {
    name: 'Доступность',
    dot: 'gold',
    rows: [
      {
        dot: 'gold',
        title: 'Недостаточный контраст текста',
        note: 'Часть текста плохо читается на фоне.',
        sev: 'важно',
        fix: 'Повысьте контраст до соотношения не ниже 4,5:1 для обычного текста.',
      },
      {
        dot: 'gold',
        title: 'У изображений нет атрибута alt',
        note: 'Скринридеры и поисковик не понимают содержимое картинок.',
        sev: 'важно',
        fix: 'Добавьте осмысленный alt каждому значимому изображению.',
      },
      {
        dot: 'green',
        title: 'У элементов форм есть подписи',
        note: 'Поля ввода корректно связаны с label.',
        sev: 'ок',
      },
    ],
  },
  {
    name: 'Мета-теги',
    dot: 'gold',
    rows: [
      {
        dot: 'gold',
        title: 'Title длиннее 60 символов',
        note: 'Заголовок обрежется в поисковой выдаче — часть текста пользователь не увидит.',
        sev: 'важно',
        fix: 'Сократите Title до 50–57 символов, вынесите ключевой запрос в начало.',
      },
      {
        dot: 'red',
        title: 'Пропущено мета-описание на 4 страницах',
        note: 'Description не задан — сниппеты формируются автоматически и часто неудачно.',
        sev: 'критично',
        fix: 'Добавьте уникальное описание на 150–160 символов на каждую страницу с выгодой и призывом.',
      },
    ],
  },
  {
    name: 'Индексация',
    dot: 'gold',
    rows: [
      {
        dot: 'gold',
        title: 'sitemap.xml устарел',
        note: 'В карте сайта есть удалённые страницы — робот тратит краулинговый бюджет впустую.',
        sev: 'совет',
        fix: 'Настройте автогенерацию sitemap и удалите из него страницы, отдающие 404.',
      },
      {
        dot: 'green',
        title: 'robots.txt корректен',
        note: 'Важные разделы открыты для индексации.',
        sev: 'ок',
      },
    ],
  },
];

// Светофор категорий (reportCats макета): n проблем → цвет и подпись.
const reportCats: { name: string; dot: Tok; label: string }[] = [
  { name: 'Производительность', dot: 'red', label: '8 проблем' },
  { name: 'Доступность', dot: 'gold', label: '2 проблемы' },
  { name: 'Лучшие практики', dot: 'gold', label: '2 проблемы' },
  { name: 'Мета-теги', dot: 'gold', label: '2 проблемы' },
  { name: 'Индексация', dot: 'gold', label: '1 проблема' },
  { name: 'SSL', dot: 'green', label: 'без проблем' },
];

// План «С чего начать» (reportPlan макета).
const reportPlan: { n: string; title: string; impact: string; effort: string }[] = [
  { n: '1', title: 'Добавьте мета-описания на 4 страницы', impact: 'Рост CTR в выдаче', effort: '≈ 40 минут' },
  { n: '2', title: 'Ускорьте загрузку: LCP до 2.5 с', impact: 'Позиции и меньше отказов', effort: '≈ 1 день' },
  { n: '3', title: 'Сожмите изображения и включите кэш', impact: 'Скорость на всех страницах', effort: '≈ 2 часа' },
];

const sectionWrap: React.CSSProperties = { maxWidth: 960, margin: '0 auto' };
const modalShadow =
  'rgba(216,236,248,0.22) 0px 1px 1px 0px inset, rgba(168,216,245,0.08) 0px 24px 48px 0px inset, rgba(186,215,247,0.16) 0px 0px 0px 1px inset, rgba(0,0,0,0.55) 0px 24px 48px 0px';

// ---- Презентационные помощники ----

function CheckRow({ r }: { r: Row }) {
  const st = sevStyle(r.sev);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        padding: '18px 20px',
        borderRadius: 14,
        background: 'linear-gradient(180deg, rgba(186,214,247,0.06), rgba(186,214,247,0.022))',
        boxShadow: 'rgba(186,215,247,0.14) 0px 0px 0px 1px inset, rgba(0,0,0,0.4) 0px 12px 28px -12px',
      }}
    >
      <span
        style={{
          marginTop: 5,
          width: 10,
          height: 10,
          borderRadius: 9999,
          background: COLOR[r.dot],
          boxShadow: `0 0 10px ${GLOW[r.dot]}`,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#d1e4fa' }}>{r.title}</div>
        <div style={{ marginTop: 2, fontSize: 15, color: '#9da7ba', textWrap: 'pretty' }}>{r.note}</div>
        {r.fix && (
          <div
            style={{
              marginTop: 10,
              borderRadius: 10,
              background: 'rgba(102,58,243,0.08)',
              boxShadow: 'rgba(102,58,243,0.28) 0px 0px 0px 1px inset',
              padding: '10px 14px',
            }}
          >
            <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: '0.08em', color: '#cbbcff', textTransform: 'uppercase' }}>
              Как исправить
            </div>
            <div style={{ marginTop: 4, fontSize: 15, color: '#c7d3ea', textWrap: 'pretty' }}>{r.fix}</div>
          </div>
        )}
      </div>
      <span
        style={{
          borderRadius: 999,
          background: st.bg,
          boxShadow: `${st.ring} 0px 0px 0px 1px inset`,
          color: st.color,
          fontSize: 15,
          fontWeight: 700,
          padding: '6px 14px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          alignSelf: 'flex-start',
        }}
      >
        {r.sev}
      </span>
    </div>
  );
}

function CheckGroup({ g }: { g: Group }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 9999,
            background: COLOR[g.dot],
            boxShadow: `0 0 12px ${GLOW[g.dot]}`,
            flexShrink: 0,
          }}
        />
        <h2
          style={{
            fontFamily: dela,
            fontWeight: 400,
            fontSize: 'clamp(18px, 2vw, 24px)',
            lineHeight: 1.05,
            textTransform: 'uppercase',
            color: '#d8ecf8',
            margin: 0,
          }}
        >
          {g.name}
        </h2>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(186,215,247,0.18), transparent)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {g.rows.map((r) => (
          <CheckRow key={r.title} r={r} />
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ num, title }: { num: string; title: string }) {
  return (
    <div style={{ margin: '8px 0 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontFamily: dela, fontSize: 'clamp(24px, 3vw, 34px)', color: 'rgba(182,217,252,0.4)', lineHeight: 1 }}>
          {num}
        </span>
        <h2
          style={{
            fontFamily: dela,
            fontWeight: 400,
            fontSize: 'clamp(22px, 2.8vw, 32px)',
            lineHeight: 1.05,
            textTransform: 'uppercase',
            color: '#d8ecf8',
            margin: 0,
          }}
        >
          {title}
        </h2>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(186,215,247,0.25), transparent)' }} />
      </div>
    </div>
  );
}

const shieldIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: '#b6d9fc' }}>
    <path d="M12 2 L20 6 V11 C20 16.5 16.6 20.7 12 22 C7.4 20.7 4 16.5 4 11 V6 Z" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M9 12 L11 14 L15 9.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function SeoExamplePage() {
  return (
    <div style={{ position: 'relative', animation: 'fadeUp 0.4s ease both' }}>
      {/* ---- Демо-плашка ---- */}
      <div
        style={{
          ...sectionWrap,
          padding: '20px 24px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontFamily: mono,
            fontSize: 13,
            letterSpacing: '0.06em',
            color: '#9da7ba',
            textTransform: 'uppercase',
            borderRadius: 999,
            background: 'rgba(199,211,234,0.06)',
            boxShadow: 'rgba(186,215,247,0.12) 0px 0px 0px 1px inset',
            padding: '6px 12px',
          }}
        >
          Это пример SEO-отчёта на демо-данных
        </span>
        <span style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.08em', color: '#9da7ba' }}>
          mysite.ru · 20.07.2026
        </span>
      </div>

      {/* ---- Обзор: табы устройства + шапка + кольца + Core Web Vitals (островок) ---- */}
      <section style={{ ...sectionWrap, padding: '20px 24px 0' }}>
        <SeoReportOverview />

        {/* Светофор категорий */}
        <div
          style={{
            marginTop: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          {reportCats.map((c) => (
            <div
              key={c.name}
              style={{
                borderRadius: 16,
                background: 'linear-gradient(180deg, rgba(186,214,247,0.075), rgba(186,214,247,0.028))',
                boxShadow:
                  'rgba(216,236,248,0.14) 0px 1px 1px 0px inset, rgba(186,215,247,0.17) 0px 0px 0px 1px inset, rgba(0,0,0,0.5) 0px 20px 40px -14px',
                padding: '16px 18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span
                  style={{
                    marginTop: 6,
                    width: 9,
                    height: 9,
                    borderRadius: 9999,
                    background: COLOR[c.dot],
                    boxShadow: `0 0 8px ${GLOW[c.dot]}`,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 15, color: '#d1e4fa', overflowWrap: 'anywhere', lineHeight: 1.2 }}>{c.name}</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 14, color: '#9da7ba' }}>{c.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Проверки: 01 Скорость и техническое здоровье ---- */}
      <section style={{ ...sectionWrap, padding: '40px 24px 0' }}>
        <SectionTitle num="01" title="Скорость и техническое здоровье" />
        {speedGroups.map((g) => (
          <CheckGroup key={g.name} g={g} />
        ))}

        <div style={{ marginTop: 44 }} />
        <SectionTitle num="02" title="SEO и контент" />
        {seoGroups.map((g) => (
          <CheckGroup key={g.name} g={g} />
        ))}
      </section>

      {/* ---- С чего начать (план) ---- */}
      <section style={{ ...sectionWrap, padding: '16px 24px 0' }}>
        <div style={{ borderRadius: 16, background: 'rgba(17,21,44,0.97)', boxShadow: modalShadow, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 9999,
                background: '#b6d9fc',
                boxShadow: '0 0 12px rgba(182,217,252,0.8)',
                flexShrink: 0,
              }}
            />
            <div
              style={{
                fontFamily: dela,
                fontSize: 'clamp(18px, 2vw, 24px)',
                lineHeight: 1.05,
                textTransform: 'uppercase',
                color: '#d8ecf8',
              }}
            >
              С чего начать
            </div>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(186,215,247,0.18), transparent)' }} />
          </div>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reportPlan.map((p) => (
              <div
                key={p.n}
                style={{
                  borderRadius: 12,
                  background: 'rgba(199,211,234,0.05)',
                  boxShadow: 'rgba(186,215,247,0.12) 0px 0px 0px 1px inset',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    flexShrink: 0,
                    background: 'linear-gradient(180deg, rgba(199,211,234,0.12), rgba(199,211,234,0.03))',
                    boxShadow: 'rgba(216,236,248,0.2) 0px 1px 1px 0px inset, rgba(186,215,247,0.12) 0px 0px 0px 1px inset',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: mono,
                    fontSize: 15,
                    color: '#d1e4fa',
                  }}
                >
                  {p.n}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#d8ecf8' }}>{p.title}</div>
                  <div style={{ marginTop: 2, fontSize: 14, color: '#9da7ba' }}>{p.impact}</div>
                </div>
                <span style={{ fontFamily: mono, fontSize: 13, color: '#b6d9fc', whiteSpace: 'nowrap' }}>⏱ {p.effort}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Скачать PDF (визуально как в макете) */}
        <div
          className="hover-cta"
          style={{
            marginTop: 20,
            width: '100%',
            borderRadius: 16,
            background: 'linear-gradient(180deg, rgba(102,58,243,0.22), rgba(102,58,243,0.1))',
            boxShadow:
              'rgba(216,236,248,0.16) 0px 1px 1px 0px inset, rgba(102,58,243,0.5) 0px 0px 0px 1px inset, rgba(0,0,0,0.5) 0px 20px 40px -14px, 0 0 40px rgba(102,58,243,0.28)',
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              flexShrink: 0,
              background: 'rgba(102,58,243,0.25)',
              boxShadow: 'rgba(102,58,243,0.55) 0px 0px 0px 1px inset, 0 0 24px rgba(102,58,243,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e5ddff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 V15 M12 15 L8 11 M12 15 L16 11" />
              <path d="M4 17 V19 a2 2 0 0 0 2 2 H18 a2 2 0 0 0 2 -2 V17" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: dela,
                fontSize: 'clamp(15px, 1.7vw, 19px)',
                fontWeight: 400,
                color: '#ffffff',
                lineHeight: 1.2,
                textTransform: 'uppercase',
              }}
            >
              Скачать отчёт в PDF
            </div>
            <div style={{ marginTop: 6, fontSize: 15, color: '#c7d3ea' }}>
              Полный SEO-отчёт с планом и рекомендациями — в один файл для команды или подрядчика
            </div>
          </div>
          <span style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.06em', color: '#cbbcff', whiteSpace: 'nowrap' }}>
            PDF · 1.2 МБ
          </span>
        </div>

        {/* Скачать Markdown */}
        <div
          className="hover-cta"
          style={{
            marginTop: 12,
            width: '100%',
            borderRadius: 16,
            background: 'linear-gradient(180deg, rgba(186,214,247,0.075), rgba(186,214,247,0.028))',
            boxShadow:
              'rgba(216,236,248,0.14) 0px 1px 1px 0px inset, rgba(186,215,247,0.17) 0px 0px 0px 1px inset, rgba(0,0,0,0.5) 0px 20px 40px -14px',
            padding: '22px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              flexShrink: 0,
              background: 'rgba(186,214,247,0.06)',
              boxShadow: 'rgba(186,215,247,0.16) 0px 0px 0px 1px inset',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#b6d9fc" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2.5" />
              <path d="M6.5 15 V9.5 L9.5 12.5 L12.5 9.5 V15 M16 9.5 V14 M14 12 L16 14.4 L18 12" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: dela,
                fontSize: 'clamp(15px, 1.7vw, 19px)',
                fontWeight: 400,
                color: '#ffffff',
                lineHeight: 1.2,
                textTransform: 'uppercase',
              }}
            >
              Скачать отчёт в Markdown (.md)
            </div>
            <div style={{ marginTop: 6, fontSize: 15, color: '#c7d3ea' }}>
              Тот же отчёт в Markdown — удобно вставить в задачу, репозиторий или ИИ-ассистент
            </div>
          </div>
          <span style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.06em', color: '#b6d9fc', whiteSpace: 'nowrap' }}>
            .md · 18 КБ
          </span>
        </div>
      </section>

      {/* ---- Paywall: проверьте весь сайт целиком ---- */}
      <section style={{ ...sectionWrap, padding: '40px 24px 0' }}>
        <div
          style={{
            position: 'relative',
            borderRadius: 16,
            background: 'rgba(17,21,44,0.97)',
            boxShadow: `${modalShadow}, rgba(102,58,243,0.28) 0px 0px 64px 0px`,
            padding: 36,
            display: 'flex',
            gap: 32,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1.4, minWidth: 280 }}>
            <div style={{ fontFamily: mono, fontSize: 13, letterSpacing: '0.1em', color: '#b6d9fc', textTransform: 'uppercase' }}>
              Это аудит одной страницы
            </div>
            <h2
              style={{
                fontFamily: dela,
                fontWeight: 400,
                fontSize: 'clamp(22px, 2.8vw, 32px)',
                lineHeight: 1.08,
                textTransform: 'uppercase',
                margin: '12px 0 0',
                background: 'linear-gradient(180deg, #d8ecf8 0%, #98c0ef 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Проверьте весь сайт целиком
            </h2>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15, color: '#c7d3ea' }}>
              {['50+ проверок на всех страницах сайта', 'Приоритизация: что чинить первым по влиянию на трафик', 'PDF-отчёт для команды или подрядчика'].map(
                (t) => (
                  <div key={t} style={{ display: 'flex', gap: 10 }}>
                    <span style={{ color: '#269684' }}>✓</span>
                    <span>{t}</span>
                  </div>
                ),
              )}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <div
                style={{
                  fontFamily: dela,
                  fontSize: 44,
                  fontWeight: 400,
                  lineHeight: 1,
                  background: 'linear-gradient(180deg, #d8ecf8 0%, #98c0ef 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                от 390 ₽
              </div>
              <span
                style={{
                  borderRadius: 6,
                  background: 'rgba(38,150,132,0.12)',
                  boxShadow: 'rgba(38,150,132,0.3) 0px 0px 0px 1px inset',
                  color: '#3fbca6',
                  fontSize: 15,
                  fontWeight: 700,
                  padding: '4px 10px',
                }}
              >
                −80% в сравнении с агентством
              </span>
            </div>
            <label style={{ display: 'block', marginTop: 14, fontSize: 15, color: '#9da7ba' }}>Почта для получения отчёта</label>
            <input
              placeholder="you@company.ru"
              style={{
                marginTop: 8,
                width: '100%',
                height: 48,
                border: 'none',
                outline: 'none',
                borderRadius: 8,
                background: 'rgba(199,211,234,0.06)',
                boxShadow: 'rgba(186,215,247,0.12) 0px 0px 0px 1px inset',
                color: '#ffffff',
                fontSize: 16,
                fontFamily: 'inherit',
                padding: '0 14px',
              }}
            />
            <div
              className="hover-cta"
              style={{
                marginTop: 12,
                width: '100%',
                height: 54,
                borderRadius: 999,
                background: '#663af3',
                boxShadow: '0 0 32px rgba(102,58,243,0.5)',
                color: '#ffffff',
                fontSize: 17,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Открыть полный SEO отчёт
            </div>
            <div style={{ marginTop: 10, fontSize: 13, color: '#9da7ba', textAlign: 'center' }}>
              Оплата картой или по СБП · доступ сразу
            </div>
          </div>
        </div>

        {/* ---- Кросс-селл на юр-сервис ---- */}
        <div
          style={{
            marginTop: 16,
            borderRadius: 16,
            background: 'linear-gradient(180deg, rgba(186,214,247,0.075), rgba(186,214,247,0.028))',
            boxShadow:
              'rgba(216,236,248,0.14) 0px 1px 1px 0px inset, rgba(186,215,247,0.17) 0px 0px 0px 1px inset, rgba(0,0,0,0.5) 0px 20px 40px -14px',
            padding: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 9999,
                background: 'rgba(186,214,247,0.06)',
                boxShadow: 'rgba(186,215,247,0.12) 0px 0px 0px 1px inset',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {shieldIcon}
            </div>
            <div>
              <div
                style={{
                  fontFamily: dela,
                  fontWeight: 400,
                  fontSize: 20,
                  lineHeight: 1.1,
                  textTransform: 'uppercase',
                  color: '#d8ecf8',
                }}
              >
                Проверили ваш сайт на SEO и техническую часть? Теперь обязательно проверьте сайт на законы РФ
              </div>
              <div style={{ marginTop: 6, fontSize: 15, color: '#c7d3ea' }}>Проверьте mysite.ru по 21 пункту РФ — бесплатно</div>
            </div>
          </div>
          <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 240, borderRadius: 8 }}>
              <svg
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9da7ba' }}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="7" strokeWidth="1.6" />
                <path d="M21 21 L16.5 16.5" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                value="mysite.ru"
                readOnly
                style={{
                  width: '100%',
                  height: 48,
                  border: 'none',
                  outline: 'none',
                  borderRadius: 8,
                  background: 'rgba(199,211,234,0.06)',
                  boxShadow: 'rgba(186,215,247,0.16) 0px 0px 0px 1px inset',
                  color: '#d1e4fa',
                  fontSize: 16,
                  fontFamily: 'inherit',
                  padding: '0 14px 0 40px',
                }}
              />
            </div>
            <Link
              href="/"
              className="hover-cta"
              style={{
                height: 48,
                display: 'flex',
                alignItems: 'center',
                padding: '0 22px',
                borderRadius: 999,
                background: 'rgba(186,214,247,0.06)',
                boxShadow: 'rgba(186,215,247,0.16) 0px 0px 0px 1px inset',
                color: '#ffffff',
                fontSize: 15,
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              Проверить по законам РФ →
            </Link>
          </div>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: '#9da7ba', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ marginTop: 2, accentColor: '#663af3' }} />
              <span>
                Соглашаюсь на обработку персональных данных согласно{' '}
                <a href="/privacy" style={{ color: '#c7d3ea', textDecoration: 'underline', textDecorationColor: 'rgba(186,215,247,0.3)' }}>
                  политике
                </a>
              </span>
            </label>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: '#9da7ba', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ marginTop: 2, accentColor: '#663af3' }} />
              <span>
                Подтверждаю, что являюсь владельцем сайта или уполномочен на его проверку, и принимаю{' '}
                <a href="/offer" style={{ color: '#c7d3ea', textDecoration: 'underline', textDecorationColor: 'rgba(186,215,247,0.3)' }}>
                  оферту
                </a>
              </span>
            </label>
          </div>
        </div>

        <p style={{ margin: '32px 0 48px', fontSize: 14, color: '#9da7ba', maxWidth: 720, textWrap: 'pretty' }}>
          Результаты проверки носят информационный характер. Демонстрация выполнена на примере данных и не является
          реальной проверкой сайта.
        </p>
      </section>
    </div>
  );
}
