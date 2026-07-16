import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, Section, TodoOwner, Fact } from '@/components/legal';

export const metadata: Metadata = {
  title: 'Контакты',
  description: 'Как связаться с сервисом: обращения субъектов персональных данных, жалобы на робота, поддержка.',
};

export default function ContactsPage() {
  return (
    <LegalPage title="Контакты" intro="Как с нами связаться и куда писать по разным вопросам.">
      <Section title="Общие вопросы и поддержка">
        <TodoOwner>контактный email и, при наличии, телефон. Ожидаемый срок ответа.</TodoOwner>
      </Section>

      <Section title="Обращения по персональным данным">
        <Fact>
          Запросы субъектов персональных данных (доступ, уточнение, удаление, отзыв согласия)
          принимаются по адресу, указанному в разделе{' '}
          <Link href="/requisites" className="text-frost-glow underline underline-offset-2">
            «Реквизиты»
          </Link>
          .
        </Fact>
        <TodoOwner>указать срок реакции — он должен совпадать с текстом политики.</TodoOwner>
      </Section>

      <Section title="Жалобы на робота">
        <Fact>
          Если наш робот обошёл ваш сайт нежелательно, напишите нам — мы внесём домен в список
          исключений, и проверки по нему больше запускаться не будут. Подробности о роботе — на
          странице{' '}
          <Link href="/bot" className="text-frost-glow underline underline-offset-2">
            «О роботе»
          </Link>
          .
        </Fact>
      </Section>
    </LegalPage>
  );
}
