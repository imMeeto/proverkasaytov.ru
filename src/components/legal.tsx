import * as React from 'react';

// Примитивы юридических страниц.
// ПС-09 §0: нейросеть создаёт ТОЛЬКО каркас разделов с плейсхолдерами {{TODO_OWNER}};
// юридические формулировки пишет и утверждает владелец (с юристом). Не сочинять текст норм.

export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-[760px] px-5 py-16">
      <h1
        className="text-heading text-skywash sm:text-heading-lg"
        style={{ fontFamily: 'var(--font-aeonikpro)', fontWeight: 500 }}
      >
        {title}
      </h1>
      {intro && <p className="mt-4 text-body-sm text-fog-veil">{intro}</p>}
      <div className="mt-10 flex flex-col gap-8">{children}</div>
    </article>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-subheading text-ice-highlight">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-body-sm text-moon-mist">{children}</div>
    </section>
  );
}

// Видимый плейсхолдер — владелец и юрист должны сразу видеть, где нужен их текст.
export function TodoOwner({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-[rgba(228,109,76,0.4)] bg-[rgba(228,109,76,0.07)] px-3 py-2 text-body-sm text-ember-glow">
      <span className="font-medium">{'{{TODO_OWNER}}'}</span> — {children}
    </p>
  );
}

// Установленный факт (техническая правда о сервисе), а не юридическая формулировка.
export function Fact({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}
