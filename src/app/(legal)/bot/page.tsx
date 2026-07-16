import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, Section, Fact } from '@/components/legal';
import { BOT_MAX_PAGES, BOT_MIN_INTERVAL_HOURS, BOT_USER_AGENT, SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: 'О роботе',
  description:
    'Кто такой наш робот, зачем он приходит на сайт, какие соблюдает лимиты и как запретить ему проверки.',
};

// Этика робота — ПС-08 §6. Страница обязана честно раскрывать UA, причину визита,
// лимиты и канал для блокировки домена. Обещания здесь = обязательства краулера (Фаза 2).

export default function BotPage() {
  return (
    <LegalPage
      title="О роботе"
      intro={`Робот сервиса «${SITE_NAME}» приходит на сайт только по заявке его владельца. Здесь — как его опознать и как запретить ему визиты.`}
    >
      <Section title="Как опознать робота">
        <Fact>Робот представляется этим User-Agent:</Fact>
        <pre className="-mx-5 overflow-x-auto px-5">
          <code className="block rounded-md bg-[rgba(199,211,234,0.06)] px-3 py-2 font-mono text-caption text-frost-glow">
            {BOT_USER_AGENT}
          </code>
        </pre>
      </Section>

      <Section title="Зачем он приходит">
        <Fact>
          Робот запускается только тогда, когда владелец сайта (или уполномоченное им лицо) сам
          заказал проверку и подтвердил свои права на домен. Мы не обходим сайты по своей
          инициативе, не составляем каталогов и не собираем содержимое сайтов впрок.
        </Fact>
        <Fact>
          Робот открывает страницы так же, как обычный посетитель в браузере, и анализирует только
          технические признаки: есть ли политика обработки данных, как устроены формы согласия, какие
          подключены счётчики. Копии страниц не сохраняются.
        </Fact>
      </Section>

      <Section title="Какие лимиты он соблюдает">
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li>не более {BOT_MAX_PAGES} страниц за одну проверку;</li>
          <li>не чаще одной проверки домена в {BOT_MIN_INTERVAL_HOURS} час;</li>
          <li>страницы одного сайта загружаются последовательно, с паузой между ними;</li>
          <li>соблюдает директивы robots.txt, включая Disallow и Crawl-delay;</li>
          <li>
            никогда не обходит формы авторизации, CAPTCHA и защиту от ботов и не пытается получить
            доступ к закрытым разделам.
          </li>
        </ul>
      </Section>

      <Section title="Как запретить роботу проверки вашего сайта">
        <Fact>
          Напишите нам с контактов, указанных в разделе{' '}
          <Link href="/requisites" className="text-frost-glow underline underline-offset-2">
            «Реквизиты»
          </Link>
          , — мы внесём домен в список исключений, и сервис будет отказывать в проверке этого сайта
          любому заказчику.
        </Fact>
        <Fact>
          Робот также подчиняется вашему robots.txt: закрытые в нём страницы он не запрашивает.
        </Fact>
      </Section>
    </LegalPage>
  );
}
