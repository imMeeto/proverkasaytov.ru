import type { Metadata } from 'next';
import * as React from 'react';
import { LeadCapture } from '@/components/lead-capture';
import { CopyButton } from '@/components/copy-button';

// Статическая страница-пример полного отчёта — точная копия экрана showFull из
// docs/design-dev/PravoScan.dc.html (строки ~715-986) на ДЕМО-данных из <script>
// (строки 1142-1573). Server-компонент; интерактив (копирование, лид-форма) — острова.
// Фон #161b36 и шапка/футер приходят из layout — здесь не дублируются.

export const metadata: Metadata = {
  title: 'Пример полного отчёта',
  description:
    'Как выглядит полный отчёт проверки сайта: балл риска, 13 нарушений с код-сниппетами, замечания, выполненные пункты и суммарный потенциальный риск. Демонстрация на примере данных.',
};

const dela = "'Dela Gothic One', sans-serif";
const mono = "'JetBrains Mono Variable', monospace";

const skywash: React.CSSProperties = {
  background: 'linear-gradient(180deg, #d8ecf8 0%, #98c0ef 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const btnTransition =
  'transform 0.3s cubic-bezier(0.2,0.7,0.2,1), box-shadow 0.3s ease, background 0.3s ease, color 0.2s ease, border-color 0.3s ease';

// ---- Демо-данные (дословно из макета) ----

interface Violation {
  num: string;
  badge: string;
  law: string;
  effort: string;
  risk: string;
  title: string;
  found: string;
  fix: string;
  snippet: string | null;
}

const violations: Violation[] = [
  {
    num: '01',
    badge: 'Критично',
    law: '152-ФЗ · ст. 9',
    effort: '≈ 30 минут',
    risk: 'до 700 000 ₽',
    title: 'Формы собирают персональные данные без согласия',
    found:
      'Форма «Заказать звонок» на /contacts отправляет имя и телефон, но рядом нет чекбокса согласия на обработку ПДн и ссылки на политику.',
    fix: 'Добавьте обязательный чекбокс согласия со ссылкой на политику к каждой форме, собирающей ПДн. Фиксируйте факт согласия.',
    snippet:
      '<label>\n  <input type="checkbox" name="pd_consent" required>\n  Соглашаюсь на обработку персональных данных\n  согласно <a href="/privacy">Политике</a>\n</label>',
  },
  {
    num: '02',
    badge: 'Критично',
    law: '149-ФЗ · авторизация-2026',
    effort: '≈ 2 часа',
    risk: 'предписание РКН',
    title: 'Авторизация через иностранный сервис (Google)',
    found:
      'На /login найдена кнопка «Sign in with Google». С 2026 года авторизация на российских сайтах допускается только разрешёнными способами.',
    fix: 'Уберите вход через Google/Apple. Замените на вход по почте или телефону, ЕСИА либо российские ID-сервисы.',
    snippet: null,
  },
  {
    num: '03',
    badge: 'Нарушение',
    law: '152-ФЗ · ст. 18.1',
    effort: '≈ 1 час',
    risk: 'до 300 000 ₽',
    title: 'Политика конфиденциальности не соответствует 152-ФЗ',
    found:
      'Документ на /privacy не содержит перечень обрабатываемых ПДн, цели и сроки обработки.',
    fix: 'Дополните политику обязательными разделами: состав данных, цели, сроки, порядок отзыва согласия.',
    snippet: null,
  },
  {
    num: '04',
    badge: 'Нарушение',
    law: '152-ФЗ · ст. 6',
    effort: '≈ 1 час',
    risk: 'до 300 000 ₽',
    title: 'Счётчики аналитики ставят cookie до согласия',
    found:
      'Яндекс.Метрика инициализируется при загрузке страницы — до того, как посетитель дал согласие в cookie-баннере.',
    fix: 'Инициализируйте счётчики только после явного согласия посетителя.',
    snippet: "consentBanner.on('accept', () => {\n  ym(12345678, 'init', { defer: true });\n});",
  },
  {
    num: '05',
    badge: 'Нарушение',
    law: '152-ФЗ · ст. 12',
    effort: '≈ 2 часа',
    risk: 'до 300 000 ₽',
    title: 'Шрифты и скрипты грузятся с иностранных серверов',
    found:
      'Страницы запрашивают fonts.googleapis.com и cdn.jsdelivr.net — IP-адреса посетителей уходят за рубеж без уведомления о трансграничной передаче.',
    fix: 'Разместите шрифты и библиотеки на своём сервере или российском CDN.',
    snippet: null,
  },
  {
    num: '06',
    badge: 'Нарушение',
    law: 'ЗОЗПП · ст. 8',
    effort: '≈ 30 минут',
    risk: 'до 40 000 ₽',
    title: 'Нет реквизитов продавца',
    found:
      'На сайте не найдены наименование юрлица/ИП, ОГРН, ИНН и адрес — обязательные сведения для продажи товаров и услуг.',
    fix: 'Добавьте полные реквизиты в футер и на страницу контактов.',
    snippet: null,
  },
  {
    num: '07',
    badge: 'Нарушение',
    law: '436-ФЗ · ст. 12',
    effort: '≈ 15 минут',
    risk: 'до 200 000 ₽',
    title: 'Отсутствует знак возрастной маркировки',
    found:
      'На страницах с информационной продукцией не найден знак возрастной категории (0+, 6+, 12+…).',
    fix: 'Определите категорию контента и разместите знак на видном месте главной страницы.',
    snippet: null,
  },
  {
    num: '08',
    badge: 'Критично',
    law: '152-ФЗ · ст. 22',
    effort: '≈ 1 день',
    risk: 'до 500 000 ₽',
    title: 'Уведомление в реестр операторов ПДн не подано',
    found:
      'Сайт собирает персональные данные, но в реестре Роскомнадзора оператор с вашим доменом не найден. Обработка без уведомления — самостоятельный состав.',
    fix: 'Подайте уведомление об обработке ПДн через сайт РКН до начала сбора данных.',
    snippet: null,
  },
  {
    num: '09',
    badge: 'Нарушение',
    law: '152-ФЗ · ст. 18',
    effort: '≈ 2 дня',
    risk: 'до 6 000 000 ₽',
    title: 'База клиентов хранится на зарубежном хостинге',
    found:
      'Формы отправляют данные на сервер с IP за пределами РФ. Первичная запись ПДн россиян должна происходить в базах на территории России.',
    fix: 'Перенесите первичную базу с ПДн на хостинг в РФ и настройте локализацию записи.',
    snippet: null,
  },
  {
    num: '10',
    badge: 'Нарушение',
    law: '152-ФЗ · ст. 9',
    effort: '≈ 30 минут',
    risk: 'до 150 000 ₽',
    title: 'Согласие на рассылку объединено с согласием на ПДн',
    found:
      'Один чекбокс отвечает сразу за обработку данных и за маркетинговую рассылку — согласия должны быть раздельными и добровольными.',
    fix: 'Разделите на два чекбокса: обязательное согласие на обработку и отдельное — на рекламную рассылку.',
    snippet:
      '<label><input type="checkbox" name="pd" required> Обработка данных</label>\n<label><input type="checkbox" name="ads"> Согласен на рассылку</label>',
  },
  {
    num: '11',
    badge: 'Нарушение',
    law: '38-ФЗ · ст. 18',
    effort: '≈ 1 час',
    risk: 'до 500 000 ₽',
    title: 'Рассылка без предварительного согласия получателя',
    found:
      'Форма подписки не фиксирует момент согласия (double opt-in). Реклама по e-mail без согласия — нарушение закона о рекламе.',
    fix: 'Внедрите подтверждение подписки по ссылке из письма и храните лог согласий.',
    snippet: null,
  },
  {
    num: '12',
    badge: 'Нарушение',
    law: 'ЗОЗПП · ст. 26.1',
    effort: '≈ 1 час',
    risk: 'до 50 000 ₽',
    title: 'Не указан порядок возврата при дистанционной продаже',
    found:
      'На страницах товара и в оферте нет условий и сроков возврата — обязательных для дистанционной торговли.',
    fix: 'Добавьте раздел о возврате: сроки, условия, порядок и контакты для обращения.',
    snippet: null,
  },
  {
    num: '13',
    badge: 'Нарушение',
    law: '152-ФЗ · ст. 7',
    effort: '≈ 30 минут',
    risk: 'до 300 000 ₽',
    title: 'Cookie-баннер без возможности отказа',
    found:
      'В баннере есть только кнопка «Принять». Пользователь лишён права отказаться от необязательных cookie.',
    fix: 'Добавьте равнозначную кнопку «Отклонить» и не запускайте трекеры до выбора.',
    snippet: null,
  },
];

const remarks: { title: string; note: string }[] = [
  {
    title: 'Cookie-баннер без кнопки «Отклонить»',
    note: 'Посетитель не может отказаться от необязательных cookie — только принять.',
  },
  {
    title: 'Согласие на рассылку объединено с согласием на ПДн',
    note: 'Один чекбокс на два разных согласия — рекомендуем разделить.',
  },
  {
    title: 'Политика не обновлялась с 2021 года',
    note: 'За это время требования 152-ФЗ менялись; проверьте актуальность.',
  },
  {
    title: 'В оферте нет порядка возврата',
    note: 'Для дистанционной продажи порядок возврата обязателен (ст. 26.1 ЗОЗПП).',
  },
  {
    title: 'Политика недоступна с внутренних страниц',
    note: 'Ссылка на политику есть только на главной — добавьте её в футер всех страниц.',
  },
  {
    title: 'Нет ссылки на политику рядом с кнопкой отправки',
    note: 'Пользователь должен видеть, на что соглашается, в момент отправки формы.',
  },
  {
    title: 'Виджет обратного звонка грузится с чужого домена',
    note: 'Сторонний скрипт получает данные посетителей — проверьте, где он размещён.',
  },
  {
    title: 'Отсутствует страница «Контакты» с полными данными',
    note: 'Наименование, адрес и способ связи должны быть доступны в один клик.',
  },
  {
    title: 'Форма поиска логирует запросы без предупреждения',
    note: 'Если запросы сохраняются, уведомите об этом в политике.',
  },
];

const passed: string[] = [
  'HTTPS-сертификат действителен',
  'Оферта опубликована',
  'Цены указаны в рублях',
  'Контактный телефон указан',
  'Данные форм передаются по HTTPS',
  'Возможность отписки от рассылки есть',
  'Признаков запрещённого контента нет',
  'Реклама кредитов без ставки не найдена',
  'Политика доступна без регистрации',
];

const priorityPlan: { n: string; title: string; note: string; time: string }[] = [
  {
    n: '1',
    title: 'Добавьте согласия ко всем формам',
    note: 'Готовый сниппет — в пункте 1, скопируйте разработчику',
    time: '≈ 30 минут',
  },
  {
    n: '2',
    title: 'Отключите вход через Google',
    note: 'Замените на почту, телефон или ЕСИА',
    time: '≈ 2 часа',
  },
  {
    n: '3',
    title: 'Обновите политику конфиденциальности',
    note: 'Список обязательных разделов — в пункте 3',
    time: '≈ 1 час',
  },
];

const fines: { big: string; text: string; shadow: string }[] = [
  {
    big: '60 000 000 ₽',
    text: 'суммарный штраф крупному оператору за утечку данных клиентов (2024)',
    shadow: 'rgba(228,109,76,0.2) 0px 0px 0px 1px inset',
  },
  {
    big: '> 40 000',
    text: 'дел по 152-ФЗ Роскомнадзор возбудил за один год',
    shadow: 'rgba(228,109,76,0.2) 0px 0px 0px 1px inset, rgba(6,8,18,0.55) 0px 12px 28px -6px',
  },
  {
    big: '300 000 ₽',
    text: 'типовой штраф интернет-магазину за формы без согласия на обработку ПДн',
    shadow: 'rgba(228,109,76,0.2) 0px 0px 0px 1px inset, rgba(6,8,18,0.55) 0px 12px 28px -6px',
  },
];

const legend: { dot: string; glow: string; bg: string; shadow: string; text: string }[] = [
  {
    dot: '#e46d4c',
    glow: 'rgba(228,109,76,0.9)',
    bg: 'rgba(228,109,76,0.08)',
    shadow: 'rgba(228,109,76,0.22) 0px 0px 0px 1px inset',
    text: 'красное — исправить срочно',
  },
  {
    dot: '#d9a84c',
    glow: 'rgba(217,168,76,0.9)',
    bg: 'rgba(217,168,76,0.07)',
    shadow: 'rgba(217,168,76,0.2) 0px 0px 0px 1px inset',
    text: 'жёлтое — желательно исправить',
  },
  {
    dot: '#269684',
    glow: 'rgba(38,150,132,0.9)',
    bg: 'rgba(38,150,132,0.07)',
    shadow: 'rgba(38,150,132,0.22) 0px 0px 0px 1px inset',
    text: 'зелёное — уже соответствует',
  },
];

const checklistText = [
  'Чек-лист исправлений — проверкасайтов.рф',
  '',
  '1. Добавить чекбокс согласия на обработку ПДн ко всем формам (152-ФЗ ст. 9)',
  '2. Убрать вход через Google, заменить на почту/телефон/ЕСИА (149-ФЗ)',
  '3. Дополнить политику конфиденциальности (152-ФЗ ст. 18.1)',
  '4. Инициализировать счётчики только после согласия (152-ФЗ ст. 6)',
  '5. Перенести шрифты и скрипты на российский хостинг (152-ФЗ ст. 12)',
  '6. Добавить реквизиты продавца (ЗОЗПП ст. 8)',
  '7. Разместить знак возрастной маркировки (436-ФЗ ст. 12)',
].join('\n');

const reportLinkText = 'проверкасайтов.рф/r/8f3a-2c1d-47e9';
const reportLinkFull = 'https://проверкасайтов.рф/r/8f3a-2c1d-47e9';

const fullScore = 23;
const ringOffset = 540 * (1 - fullScore / 100);

// ---- Пресеты кнопок для острова CopyButton ----

const linkBtnStyle: React.CSSProperties = {
  marginLeft: 'auto',
  border: 'none',
  borderRadius: 999,
  background: 'rgba(186,214,247,0.06)',
  boxShadow: 'rgba(186,215,247,0.12) 0px 0px 0px 1px inset',
  color: '#ffffff',
  fontFamily: 'inherit',
  fontSize: 14,
  fontWeight: 500,
  padding: '7px 14px',
  cursor: 'pointer',
  transition: btnTransition,
  whiteSpace: 'nowrap',
};

const snippetBtnStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: 999,
  background: 'rgba(186,214,247,0.08)',
  boxShadow: 'rgba(186,215,247,0.16) 0px 0px 0px 1px inset',
  color: '#ffffff',
  fontFamily: 'inherit',
  fontSize: 13,
  fontWeight: 500,
  padding: '6px 14px',
  cursor: 'pointer',
  transition: btnTransition,
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const tasksBtnStyle: React.CSSProperties = {
  marginTop: 12,
  border: 'none',
  borderRadius: 999,
  background: 'rgba(186,214,247,0.06)',
  boxShadow: 'rgba(186,215,247,0.12) 0px 0px 0px 1px inset',
  color: '#ffffff',
  fontFamily: 'inherit',
  fontSize: 15,
  fontWeight: 500,
  padding: '9px 18px',
  cursor: 'pointer',
  transition: btnTransition,
};

// ---- Мелкие презентационные помощники ----

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

function SectionHeader({
  dot,
  dotGlow,
  title,
  chipLabel,
  chipBg,
  chipShadow,
  chipColor,
}: {
  dot: string;
  dotGlow: string;
  title: string;
  chipLabel: string;
  chipBg: string;
  chipShadow: string;
  chipColor: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 9999,
          background: dot,
          boxShadow: `0 0 12px ${dotGlow}`,
          flexShrink: 0,
        }}
      />
      <h2
        style={{
          fontFamily: dela,
          fontWeight: 400,
          fontSize: 'clamp(19px, 2.2vw, 26px)',
          lineHeight: 1.05,
          textTransform: 'uppercase',
          color: '#d8ecf8',
          margin: 0,
        }}
      >
        {title}
      </h2>
      <span
        style={{
          borderRadius: 6,
          background: chipBg,
          boxShadow: chipShadow,
          color: chipColor,
          fontFamily: mono,
          fontSize: 15,
          padding: '3px 10px',
          whiteSpace: 'nowrap',
        }}
      >
        {chipLabel}
      </span>
      <div
        style={{
          flex: 1,
          height: 1,
          background: 'linear-gradient(90deg, rgba(186,215,247,0.18), transparent)',
        }}
      />
    </div>
  );
}

const sectionWrap: React.CSSProperties = { maxWidth: 960, margin: '0 auto' };

export default function ExamplePage() {
  return (
    <div style={{ position: 'relative', animation: 'fadeUp 0.4s ease both' }}>
      {/* ---- Демо-плашка + мета отчёта ---- */}
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
          Это пример отчёта на демо-данных
        </span>
        <span style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.08em', color: '#9da7ba' }}>
          mysite.ru · 14.07.2026
        </span>
      </div>

      {/* ---- Баннеры, ссылка, легенда, карточка балла ---- */}
      <section style={{ ...sectionWrap, padding: '16px 24px 0' }}>
        <div
          style={{
            borderRadius: 6,
            background: 'rgba(38,150,132,0.08)',
            boxShadow: 'rgba(38,150,132,0.25) 0px 0px 0px 1px inset, rgba(6,8,18,0.55) 0px 12px 28px -6px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 16,
            color: '#c7d3ea',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ color: '#269684' }}>✓</span>
          <span>Полный отчёт открыт. PDF отправлен на почту, ссылка на отчёт действует бессрочно.</span>
        </div>

        <div
          style={{
            marginTop: 10,
            borderRadius: 6,
            background: 'rgba(199,211,234,0.09)',
            boxShadow: 'rgba(186,215,247,0.2) 0px 0px 0px 1px inset, rgba(6,8,18,0.55) 0px 12px 28px -6px',
            padding: '8px 8px 8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9da7ba" strokeWidth="1.6" strokeLinecap="round">
            <path d="M10 14 a4 4 0 0 0 6 0 l3 -3 a4 4 0 0 0 -6 -6 l-1.5 1.5 M14 10 a4 4 0 0 0 -6 0 l-3 3 a4 4 0 0 0 6 6 l1.5 -1.5" />
          </svg>
          <span
            style={{
              fontFamily: mono,
              fontSize: 14.5,
              letterSpacing: '0.03em',
              color: '#b6d9fc',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {reportLinkText}
          </span>
          <CopyButton text={reportLinkFull} label="Копировать ссылку" style={linkBtnStyle} hoverBg="rgba(186,214,247,0.14)" />
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {legend.map((l) => (
            <div
              key={l.text}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 999,
                background: l.bg,
                boxShadow: l.shadow,
                padding: '7px 14px',
                fontSize: 14,
                color: '#c7d3ea',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 9999,
                  background: l.dot,
                  boxShadow: `0 0 8px ${l.glow}`,
                  flexShrink: 0,
                }}
              />
              {l.text}
            </div>
          ))}
        </div>

        {/* Карточка балла */}
        <div
          style={{
            position: 'relative',
            marginTop: 24,
            borderRadius: 16,
            background: 'rgba(17,21,44,0.97)',
            boxShadow:
              'rgba(216,236,248,0.22) 0px 1px 1px 0px inset, rgba(168,216,245,0.08) 0px 24px 48px 0px inset, rgba(186,215,247,0.16) 0px 0px 0px 1px inset, rgba(0,0,0,0.55) 0px 24px 48px 0px',
            padding: 24,
            display: 'flex',
            gap: 28,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <CornerDots />
          <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
            <svg width="160" height="160" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="86" fill="none" stroke="rgba(186,215,247,0.08)" strokeWidth="12" />
              <circle
                cx="100"
                cy="100"
                r="86"
                fill="none"
                stroke="#e46d4c"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="540"
                strokeDashoffset={ringOffset}
                transform="rotate(-90 100 100)"
                style={{ filter: 'drop-shadow(0 0 7px rgba(228,109,76,0.4))' }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontFamily: dela, fontSize: 38, fontWeight: 400, color: '#d8ecf8', lineHeight: 1 }}>
                {fullScore}
              </span>
              <span style={{ fontSize: 12, color: '#9da7ba', marginTop: 3 }}>из 100</span>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  color: '#e46d4c',
                  textTransform: 'uppercase',
                  marginTop: 2,
                }}
              >
                балл риска
              </span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 260 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                borderRadius: 8,
                background: 'rgba(228,109,76,0.14)',
                boxShadow: 'rgba(228,109,76,0.35) 0px 0px 0px 1px inset, 0 0 18px rgba(228,109,76,0.22)',
                padding: '9px 16px',
                fontSize: 'clamp(15px, 1.7vw, 19px)',
                fontWeight: 700,
                color: '#e46d4c',
              }}
            >
              <span style={{ fontSize: 17 }}>⚠</span>Критический риск · требуется срочная доработка
            </div>
            <div style={{ marginTop: 8, fontSize: 15, color: '#9da7ba', textWrap: 'pretty' }}>
              Пройдено лишь 9 пунктов, остальные — с замечаниями или нарушениями. Балл считается по весу нарушений:
              критичные снижают его сильнее всего.
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div
                style={{
                  flex: 1,
                  minWidth: 120,
                  borderRadius: 12,
                  background: 'rgba(228,109,76,0.08)',
                  boxShadow: 'rgba(228,109,76,0.25) 0px 0px 0px 1px inset, rgba(6,8,18,0.55) 0px 12px 28px -6px',
                  padding: '14px 16px',
                }}
              >
                <div style={{ fontSize: 32, fontWeight: 400, color: '#e46d4c', fontFamily: dela, lineHeight: 1 }}>13</div>
                <div style={{ marginTop: 6, fontSize: 14, color: '#c7d3ea' }}>нарушений</div>
              </div>
              <div
                style={{
                  flex: 1,
                  minWidth: 120,
                  borderRadius: 12,
                  background: 'rgba(217,168,76,0.07)',
                  boxShadow: 'rgba(217,168,76,0.22) 0px 0px 0px 1px inset, rgba(6,8,18,0.55) 0px 12px 28px -6px',
                  padding: '14px 16px',
                }}
              >
                <div style={{ fontSize: 32, fontWeight: 400, color: '#d9a84c', fontFamily: dela, lineHeight: 1 }}>9</div>
                <div style={{ marginTop: 6, fontSize: 14, color: '#c7d3ea' }}>замечаний</div>
                <div style={{ marginTop: 2, fontSize: 12, color: '#9da7ba' }}>риск претензий</div>
              </div>
              <div
                style={{
                  flex: 1,
                  minWidth: 120,
                  borderRadius: 12,
                  background: 'rgba(38,150,132,0.07)',
                  boxShadow: 'rgba(38,150,132,0.22) 0px 0px 0px 1px inset, rgba(6,8,18,0.55) 0px 12px 28px -6px',
                  padding: '14px 16px',
                }}
              >
                <div style={{ fontSize: 32, fontWeight: 400, color: '#269684', fontFamily: dela, lineHeight: 1 }}>9</div>
                <div style={{ marginTop: 6, fontSize: 14, color: '#c7d3ea' }}>выполнено</div>
                <div style={{ marginTop: 2, fontSize: 12, color: '#9da7ba' }}>уже в порядке</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Нарушения ---- */}
      <section style={{ ...sectionWrap, padding: '40px 24px 0' }}>
        <SectionHeader
          dot="#e46d4c"
          dotGlow="rgba(228,109,76,0.8)"
          title="Нарушения"
          chipLabel="13"
          chipBg="rgba(228,109,76,0.12)"
          chipShadow="rgba(228,109,76,0.3) 0px 0px 0px 1px inset"
          chipColor="#e46d4c"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {violations.map((v) => (
            <div
              key={v.num}
              style={{
                borderRadius: 16,
                borderLeft: '3px solid rgba(228,109,76,0.5)',
                background: 'linear-gradient(180deg, rgba(186,214,247,0.08), rgba(186,214,247,0.03))',
                boxShadow:
                  'rgba(216,236,248,0.16) 0px 1px 1px 0px inset, rgba(186,215,247,0.17) 0px 0px 0px 1px inset, rgba(6,8,18,0.7) 0px 24px 40px 0px',
                padding: 24,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: dela, fontSize: 24, lineHeight: 1, color: 'rgba(228,109,76,0.45)' }}>
                  {v.num}
                </span>
                <span
                  style={{
                    borderRadius: 6,
                    background: 'rgba(228,109,76,0.12)',
                    boxShadow: 'rgba(228,109,76,0.3) 0px 0px 0px 1px inset',
                    padding: '3px 8px',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#e46d4c',
                  }}
                >
                  {v.badge}
                </span>
                <span style={{ fontFamily: mono, fontSize: 14, letterSpacing: '0.06em', color: '#9da7ba' }}>{v.law}</span>
                <span
                  style={{
                    borderRadius: 6,
                    background: 'rgba(199,211,234,0.09)',
                    boxShadow: 'rgba(186,215,247,0.2) 0px 0px 0px 1px inset, rgba(6,8,18,0.55) 0px 12px 28px -6px',
                    padding: '3px 8px',
                    fontSize: 14,
                    color: '#c7d3ea',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ⏱ {v.effort}
                </span>
                <span
                  style={{
                    marginLeft: 'auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    borderRadius: 8,
                    background: 'rgba(228,109,76,0.14)',
                    boxShadow: 'rgba(228,109,76,0.35) 0px 0px 0px 1px inset, 0 0 18px rgba(228,109,76,0.25)',
                    padding: '6px 12px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ color: '#e46d4c', fontSize: 15 }}>⚠</span>
                  <span
                    style={{
                      fontFamily: dela,
                      fontSize: 19,
                      lineHeight: 1,
                      color: '#e46d4c',
                      textShadow: '0 0 14px rgba(228,109,76,0.6)',
                    }}
                  >
                    {v.risk}
                  </span>
                </span>
              </div>
              <h3 style={{ margin: '12px 0 0', fontSize: 22, fontWeight: 700, color: '#d8ecf8', lineHeight: 1.4 }}>
                {v.title}
              </h3>
              <div
                style={{
                  marginTop: 16,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 16,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#9da7ba',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Что нашли
                  </div>
                  <div style={{ marginTop: 8, fontSize: 17, color: '#c7d3ea', textWrap: 'pretty' }}>{v.found}</div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#9da7ba',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Что делать
                  </div>
                  <div style={{ marginTop: 8, fontSize: 17, color: '#c7d3ea', textWrap: 'pretty' }}>{v.fix}</div>
                </div>
              </div>
              {v.snippet && (
                <div
                  style={{
                    margin: '16px 0 0',
                    borderRadius: 6,
                    background: 'rgba(199,211,234,0.06)',
                    boxShadow: 'rgba(186,215,247,0.12) 0px 0px 0px 1px inset, rgba(6,8,18,0.55) 0px 12px 28px -6px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      padding: '8px 12px 8px 16px',
                      borderBottom: '1px solid rgba(186,215,247,0.1)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 13,
                        letterSpacing: '0.06em',
                        color: '#9da7ba',
                        textTransform: 'uppercase',
                      }}
                    >
                      сниппет для разработчика
                    </span>
                    <CopyButton
                      text={v.snippet}
                      label="Копировать"
                      style={snippetBtnStyle}
                      hoverBg="rgba(186,214,247,0.16)"
                      withIcon
                    />
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      padding: '14px 16px',
                      fontFamily: mono,
                      fontSize: 15.5,
                      lineHeight: 1.65,
                      color: '#b6d9fc',
                      overflowX: 'auto',
                      whiteSpace: 'pre',
                    }}
                  >
                    {v.snippet}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ---- Замечания ---- */}
      <section style={{ ...sectionWrap, padding: '40px 24px 0' }}>
        <SectionHeader
          dot="#d9a84c"
          dotGlow="rgba(217,168,76,0.8)"
          title="Замечания"
          chipLabel="9"
          chipBg="rgba(217,168,76,0.08)"
          chipShadow="rgba(217,168,76,0.22) 0px 0px 0px 1px inset, rgba(6,8,18,0.55) 0px 12px 28px -6px"
          chipColor="#d9a84c"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {remarks.map((r) => (
            <div
              key={r.title}
              style={{
                borderRadius: 16,
                borderLeft: '3px solid rgba(217,168,76,0.45)',
                background: 'linear-gradient(180deg, rgba(186,214,247,0.075), rgba(186,214,247,0.028))',
                boxShadow:
                  'rgba(216,236,248,0.14) 0px 1px 1px 0px inset, rgba(186,215,247,0.17) 0px 0px 0px 1px inset, rgba(0,0,0,0.5) 0px 20px 40px -14px',
                padding: '16px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: 9999, background: '#d9a84c', flexShrink: 0 }} />
                <span style={{ fontSize: 18, fontWeight: 700, color: '#d1e4fa' }}>{r.title}</span>
              </div>
              <div style={{ marginTop: 6, paddingLeft: 20, fontSize: 16, color: '#9da7ba', textWrap: 'pretty' }}>
                {r.note}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Выполнено + суммарный риск ---- */}
      <section style={{ ...sectionWrap, padding: '40px 24px 0' }}>
        <SectionHeader
          dot="#269684"
          dotGlow="rgba(38,150,132,0.8)"
          title="Выполнено на вашем сайте"
          chipLabel="9"
          chipBg="rgba(38,150,132,0.08)"
          chipShadow="rgba(38,150,132,0.25) 0px 0px 0px 1px inset, rgba(6,8,18,0.55) 0px 12px 28px -6px"
          chipColor="#269684"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 8 }}>
          {passed.map((p) => (
            <div
              key={p}
              style={{
                borderRadius: 16,
                background: 'linear-gradient(180deg, rgba(186,214,247,0.075), rgba(186,214,247,0.028))',
                boxShadow:
                  'rgba(216,236,248,0.14) 0px 1px 1px 0px inset, rgba(186,215,247,0.17) 0px 0px 0px 1px inset, rgba(0,0,0,0.5) 0px 20px 40px -14px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ color: '#269684', flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: 17, color: '#c7d3ea' }}>{p}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'relative',
            marginTop: 56,
            borderRadius: 16,
            borderLeft: '3px solid rgba(228,109,76,0.55)',
            background: 'linear-gradient(180deg, rgba(228,109,76,0.12), rgba(228,109,76,0.04))',
            boxShadow:
              'rgba(228,109,76,0.3) 0px 0px 0px 1px inset, rgba(6,8,18,0.55) 0px 20px 44px -8px, 0 0 64px rgba(228,109,76,0.15)',
            padding: '40px 36px',
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: 'clamp(16px, 1.9vw, 22px)',
              letterSpacing: '0.1em',
              color: '#e46d4c',
              textTransform: 'uppercase',
            }}
          >
            Суммарный потенциальный риск по отчёту
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: dela,
              fontSize: 'clamp(34px, 5vw, 60px)',
              lineHeight: 1,
              color: '#e46d4c',
              textShadow: '0 0 30px rgba(228,109,76,0.5)',
              whiteSpace: 'nowrap',
            }}
          >
            до 9 340 000 ₽
          </div>
          <div
            style={{
              marginTop: 14,
              fontSize: 17,
              color: '#c7d3ea',
              maxWidth: 580,
              marginLeft: 'auto',
              marginRight: 'auto',
              textWrap: 'pretty',
            }}
          >
            если все 13 нарушений зафиксирует Роскомнадзор. Исправление всех пунктов по этому отчёту — от 20 000 ₽.
          </div>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(228,109,76,0.2)' }}>
            <div
              style={{
                fontFamily: mono,
                fontSize: 13,
                letterSpacing: '0.1em',
                color: '#9da7ba',
                textTransform: 'uppercase',
              }}
            >
              Это не абстракция — так штрафуют в России
            </div>
            <div
              style={{
                marginTop: 16,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12,
                textAlign: 'left',
              }}
            >
              {fines.map((f) => (
                <div
                  key={f.big}
                  style={{
                    borderRadius: 12,
                    background: 'rgba(228,109,76,0.07)',
                    boxShadow: f.shadow,
                    padding: '16px 18px',
                  }}
                >
                  <div style={{ fontFamily: dela, fontSize: 22, color: '#e46d4c', lineHeight: 1 }}>{f.big}</div>
                  <div style={{ marginTop: 8, fontSize: 14, color: '#c7d3ea', lineHeight: 1.45 }}>{f.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---- С чего начать + CTA + PDF ---- */}
      <section style={{ ...sectionWrap, padding: '36px 24px 48px' }}>
        <SectionHeader
          dot="#b6d9fc"
          dotGlow="rgba(182,217,252,0.8)"
          title="С чего начать"
          chipLabel="план на день 1"
          chipBg="rgba(199,211,234,0.09)"
          chipShadow="rgba(186,215,247,0.2) 0px 0px 0px 1px inset, rgba(6,8,18,0.55) 0px 12px 28px -6px"
          chipColor="#b6d9fc"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {priorityPlan.map((p) => (
            <div
              key={p.n}
              style={{
                borderRadius: 16,
                background: 'linear-gradient(180deg, rgba(186,214,247,0.075), rgba(186,214,247,0.028))',
                boxShadow:
                  'rgba(216,236,248,0.14) 0px 1px 1px 0px inset, rgba(186,215,247,0.17) 0px 0px 0px 1px inset, rgba(0,0,0,0.5) 0px 20px 40px -14px',
                padding: '16px 20px',
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
                  fontSize: 16,
                  color: '#d1e4fa',
                }}
              >
                {p.n}
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 19, fontWeight: 700, color: '#d8ecf8' }}>{p.title}</div>
                <div style={{ marginTop: 2, fontSize: 15, color: '#9da7ba' }}>{p.note}</div>
              </div>
              <span style={{ fontFamily: mono, fontSize: 14, color: '#b6d9fc', whiteSpace: 'nowrap' }}>{p.time}</span>
            </div>
          ))}
        </div>
        <CopyButton
          text={checklistText}
          label="Скопировать чек-лист для разработчика"
          style={tasksBtnStyle}
          hoverBg="rgba(186,214,247,0.14)"
        />

        {/* Исправим за вас */}
        <div
          style={{
            position: 'relative',
            marginTop: 28,
            borderRadius: 16,
            background: 'rgba(17,21,44,0.97)',
            boxShadow:
              'rgba(216,236,248,0.22) 0px 1px 1px 0px inset, rgba(168,216,245,0.08) 0px 24px 48px 0px inset, rgba(186,215,247,0.16) 0px 0px 0px 1px inset, rgba(0,0,0,0.55) 0px 24px 48px 0px, rgba(102,58,243,0.28) 0px 0px 64px 0px',
            padding: 36,
            display: 'flex',
            gap: 32,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <CornerDots />
          <div style={{ flex: 1.4, minWidth: 280 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
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
                Исправим за вас
              </span>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 14,
                  letterSpacing: '0.08em',
                  color: '#9da7ba',
                  textTransform: 'uppercase',
                }}
              >
                от 20 000 ₽
              </span>
            </div>
            <h2
              style={{
                ...skywash,
                fontFamily: dela,
                fontWeight: 400,
                fontSize: 'clamp(24px, 3.2vw, 38px)',
                lineHeight: 1.05,
                textTransform: 'uppercase',
                margin: '14px 0 0',
              }}
            >
              Не хотите разбираться сами?
            </h2>
            <p style={{ margin: '12px 0 0', fontSize: 18, color: '#c7d3ea', lineHeight: 1.55, textWrap: 'pretty' }}>
              Наши разработчики устранят все 13 нарушений в коде вашего сайта, обновят документы и лично прогонят его по
              всем 21 пунктам проверки — до зелёного статуса.
            </p>
            <div style={{ marginTop: 16, display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 16, color: '#c7d3ea' }}>
              <span style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: '#269684' }}>✓</span>правки в коде
              </span>
              <span style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: '#269684' }}>✓</span>документы под ключ
              </span>
              <span style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: '#269684' }}>✓</span>личная проверка нашей командой
              </span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 16, color: '#9da7ba' }}>Куда написать по вашему сайту</div>
            <LeadCapture
              placeholder="телефон или @telegram"
              buttonLabel="Оставить заявку"
              sentLabel="Заявка отправлена — свяжемся в течение рабочего дня"
              successBlock
            />
            <div style={{ marginTop: 10, fontSize: 14, color: '#9da7ba', textAlign: 'center' }}>
              Ответим в течение рабочего дня. Полный отчёт уже включён в стоимость.
            </div>
          </div>
        </div>

        {/* Скачать PDF (визуально как в макете) */}
        <div
          style={{
            marginTop: 24,
            width: '100%',
            borderRadius: 16,
            background: 'linear-gradient(180deg, rgba(102,58,243,0.22), rgba(102,58,243,0.1))',
            boxShadow:
              'rgba(216,236,248,0.16) 0px 1px 1px 0px inset, rgba(102,58,243,0.5) 0px 0px 0px 1px inset, rgba(0,0,0,0.5) 0px 20px 40px -14px, 0 0 40px rgba(102,58,243,0.28)',
            padding: '28px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 14,
              flexShrink: 0,
              background: 'rgba(102,58,243,0.25)',
              boxShadow: 'rgba(102,58,243,0.55) 0px 0px 0px 1px inset, 0 0 24px rgba(102,58,243,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e5ddff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 V15 M12 15 L8 11 M12 15 L16 11" />
              <path d="M4 17 V19 a2 2 0 0 0 2 2 H18 a2 2 0 0 0 2 -2 V17" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
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
              Скачать PDF отчёт этой проверки
            </div>
            <div style={{ marginTop: 6, fontSize: 16, color: '#c7d3ea' }}>
              Полный отчёт со всеми пунктами и сниппетами — в один файл для команды или юриста
            </div>
          </div>
          <span
            style={{
              fontFamily: mono,
              fontSize: 14,
              letterSpacing: '0.06em',
              color: '#cbbcff',
              whiteSpace: 'nowrap',
            }}
          >
            PDF · 1.4 МБ
          </span>
        </div>

        <p style={{ margin: '32px 0 0', fontSize: 14, color: '#9da7ba', maxWidth: 720, textWrap: 'pretty' }}>
          Результаты носят информационный характер и не заменяют юридическую консультацию. Точный размер санкций
          определяет Роскомнадзор или суд.
        </p>
      </section>
    </div>
  );
}
