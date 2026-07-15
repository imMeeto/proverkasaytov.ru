import { Eyebrow } from '@/components/ui/eyebrow';
import { GlassCard } from '@/components/ui/glass-card';
import { ScanForm } from '@/components/scan-form';
import { PRICE_FULL_REPORT_RUB } from '@/lib/site';
import { CheckIcon } from '@/components/icons';

const lawAreas = [
  { title: '152-ФЗ · персональные данные', desc: 'Политика, согласия в формах, уведомление РКН, локализация.' },
  { title: 'Cookie и трекеры', desc: 'Баннер, запуск счётчиков до согласия, иностранная аналитика.' },
  { title: 'Авторизация 2026', desc: 'Вход через Google/Apple и другие иностранные сервисы (ст. 13.55 КоАП).' },
  { title: 'ЗОЗПП и оферта', desc: 'Реквизиты продавца, публичная оферта, условия возврата.' },
  { title: '436-ФЗ · маркировка', desc: 'Возрастная маркировка контента.' },
  { title: 'Реестр операторов РКН', desc: 'Сверка ИНН сайта с реестром операторов персональных данных.' },
];

const steps = [
  { n: '01', title: 'Вводите адрес сайта', desc: 'Подтверждаете согласие и права на проверку — и запускаете скан.' },
  { n: '02', title: 'Робот обходит страницы', desc: 'До 10 страниц в настоящем браузере, 21 проверка по законам РФ.' },
  { n: '03', title: 'Получаете отчёт', desc: 'Балл из 100, светофор нарушений и что именно исправить.' },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-[var(--page-max-width)] px-5">
      {/* Hero */}
      <section className="flex flex-col items-center pt-20 pb-16 text-center sm:pt-28">
        <Eyebrow>Проверка по 152-ФЗ и не только</Eyebrow>
        <h1
          className="mt-6 max-w-3xl text-heading-lg sm:text-display"
          style={{ fontFamily: 'var(--font-aeonikpro)', fontWeight: 500 }}
        >
          <span className="text-skywash">Узнайте, что нарушает ваш сайт —</span>
          <br />
          <span className="text-skywash">раньше, чем это найдёт робот РКН</span>
        </h1>
        <p className="mt-5 max-w-xl text-body text-moon-mist">
          Автоматическая проверка сайта на соответствие законодательству РФ. Балл из 100 и список
          нарушений за пару минут — бесплатно.
        </p>

        <div id="scan" className="mt-10 w-full max-w-2xl scroll-mt-24">
          <GlassCard variant="modal" className="text-left">
            <ScanForm />
          </GlassCard>
        </div>
      </section>

      {/* Что проверяем */}
      <section className="py-16">
        <Eyebrow>Что проверяем</Eyebrow>
        <h2 className="mt-5 text-center text-heading-sm text-ice-highlight">21 проверка по актуальным нормам</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lawAreas.map((a) => (
            <GlassCard key={a.title}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(102,58,243,0.18)] text-void-violet">
                  <CheckIcon />
                </span>
                <div>
                  <div className="text-body-sm font-medium text-frost-glow">{a.title}</div>
                  <p className="mt-1 text-body-sm text-fog-veil">{a.desc}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Как работает */}
      <section id="how" className="scroll-mt-20 py-16">
        <Eyebrow>Как это работает</Eyebrow>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {steps.map((s) => (
            <GlassCard key={s.n}>
              <div className="eyebrow text-blueprint-blue">{s.n}</div>
              <div className="mt-3 text-subheading text-ice-highlight">{s.title}</div>
              <p className="mt-2 text-body-sm text-fog-veil">{s.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Тарифы */}
      <section id="tariffs" className="scroll-mt-20 py-16">
        <Eyebrow>Тарифы</Eyebrow>
        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          <GlassCard>
            <div className="text-heading-sm text-ice-highlight">0 ₽</div>
            <div className="mt-1 text-body-sm text-moon-mist">Бесплатный скан</div>
            <ul className="mt-4 flex flex-col gap-2 text-body-sm text-fog-veil">
              <li>Балл из 100 и светофор нарушений</li>
              <li>Счётчики: нарушения / замечания / выполнено</li>
              <li>Два самых критичных нарушения полностью</li>
            </ul>
          </GlassCard>
          <GlassCard variant="modal">
            <div className="text-heading-sm text-ice-highlight">{PRICE_FULL_REPORT_RUB} ₽</div>
            <div className="mt-1 text-body-sm text-moon-mist">Полный отчёт</div>
            <ul className="mt-4 flex flex-col gap-2 text-body-sm text-fog-veil">
              <li>Все нарушения: что нашли / что делать / статья</li>
              <li>Готовые код-сниппеты для исправления</li>
              <li>PDF-отчёт на почту, доступ по ссылке</li>
            </ul>
          </GlassCard>
        </div>
        <p className="mx-auto mt-6 max-w-xl text-center text-caption text-fog-veil">
          Результаты носят информационный характер и не заменяют юридическую консультацию.
        </p>
      </section>
    </div>
  );
}
