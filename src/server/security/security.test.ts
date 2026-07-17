import { describe, it, expect } from 'vitest';
import { isForbiddenHostname, isPrivateIPv4, isPrivateIPv6, isPrivateIp, assertPublicUrl } from './ssrf';
import { checkKii } from './kii';
import { maskEmail, maskPii } from './pii';

// Слой безопасности — самый критичный код проекта. Ошибка здесь = реальная уязвимость,
// поэтому проверяем именно граничные случаи, а не happy path.

describe('ssrf: приватные IPv4', () => {
  it.each([
    '0.0.0.0',
    '10.0.0.1',
    '10.255.255.255',
    '100.64.0.1', // CGNAT
    '127.0.0.1',
    '169.254.169.254', // metadata-сервис облака — классический SSRF-вектор
    '172.16.0.1',
    '172.31.255.255',
    '192.168.1.1',
    '198.18.0.1',
    '224.0.0.1', // multicast
    '255.255.255.255',
  ])('блокирует %s', (ip) => {
    expect(isPrivateIPv4(ip)).toBe(true);
  });

  it.each(['8.8.8.8', '1.1.1.1', '93.158.134.11', '172.32.0.1', '11.0.0.1', '100.63.255.255'])(
    'пропускает публичный %s',
    (ip) => {
      expect(isPrivateIPv4(ip)).toBe(false);
    },
  );

  it('считает небезопасным мусор вместо IP', () => {
    expect(isPrivateIPv4('999.1.1.1')).toBe(true);
    expect(isPrivateIPv4('10.0.0')).toBe(true);
    expect(isPrivateIPv4('')).toBe(true);
  });
});

describe('ssrf: приватные IPv6', () => {
  it.each(['::1', '::', 'fc00::1', 'fd12:3456::1', 'fe80::1', 'fe80::1%eth0'])(
    'блокирует %s',
    (ip) => {
      expect(isPrivateIPv6(ip)).toBe(true);
    },
  );

  it('блокирует IPv4-mapped на приватный адрес', () => {
    expect(isPrivateIPv6('::ffff:127.0.0.1')).toBe(true);
    expect(isPrivateIPv6('::ffff:192.168.0.1')).toBe(true);
  });

  it('пропускает публичные', () => {
    expect(isPrivateIPv6('2001:4860:4860::8888')).toBe(false);
    expect(isPrivateIPv6('::ffff:8.8.8.8')).toBe(false);
  });

  // Регрессия: WHATWG-URL сериализует встроенный IPv4 в HEX — обход SSRF (аудит 07.2026).
  it('блокирует IPv4-mapped в hex-форме (как отдаёт new URL)', () => {
    expect(isPrivateIPv6('::ffff:a9fe:a9fe')).toBe(true); // 169.254.169.254 metadata
    expect(isPrivateIPv6('::ffff:a00:1')).toBe(true); // 10.0.0.1
    expect(isPrivateIPv6('::ffff:7f00:1')).toBe(true); // 127.0.0.1
    expect(isPrivateIPv6('::ffff:c0a8:1')).toBe(true); // 192.168.0.1
  });

  it('пропускает публичный IPv4-mapped в hex-форме', () => {
    expect(isPrivateIPv6('::ffff:808:808')).toBe(false); // 8.8.8.8
  });
});

describe('ssrf: assertPublicUrl (шлюз API и воркера)', () => {
  it('отклоняет не-http(s) схемы', async () => {
    expect((await assertPublicUrl('ftp://example.ru')).ok).toBe(false);
  });

  it('отклоняет credentials в URL', async () => {
    expect((await assertPublicUrl('http://user:pass@example.ru')).ok).toBe(false);
  });

  it('отклоняет нестандартный порт', async () => {
    expect((await assertPublicUrl('http://example.ru:8080')).ok).toBe(false);
  });

  it('отклоняет приватный IP-литерал', async () => {
    expect((await assertPublicUrl('http://127.0.0.1')).ok).toBe(false);
    expect((await assertPublicUrl('http://169.254.169.254/latest/meta-data/')).ok).toBe(false);
    expect((await assertPublicUrl('http://192.168.1.1')).ok).toBe(false);
  });

  // Ключевая регрессия: hex-mapped literal должен отклоняться на шлюзе.
  it('отклоняет IPv4-mapped IPv6 в hex-форме (cloud metadata через литерал)', async () => {
    expect((await assertPublicUrl('http://[::ffff:a9fe:a9fe]/')).ok).toBe(false);
  });
});

describe('ssrf: имена хостов', () => {
  it.each([
    'localhost',
    'app.localhost',
    'router.local',
    'db.internal',
    'foo.home.arpa',
    '127.0.0.1',
    '169.254.169.254',
    '[::1]',
  ])('блокирует %s', (h) => {
    expect(isForbiddenHostname(h)).toBe(true);
  });

  it.each(['example.ru', 'www.example.com', 'sub.domain.example.ru', '8.8.8.8'])(
    'пропускает %s',
    (h) => {
      expect(isForbiddenHostname(h)).toBe(false);
    },
  );

  it('не обманывается регистром и точкой в конце', () => {
    expect(isForbiddenHostname('LOCALHOST')).toBe(true);
    expect(isForbiddenHostname('localhost.')).toBe(true);
  });

  it('isPrivateIp считает не-IP небезопасным', () => {
    expect(isPrivateIp('example.ru')).toBe(true);
  });
});

describe('kii: стоп-лист', () => {
  it.each([
    ['gov.ru', 'www.gov.ru'],
    ['sberbank.ru', 'online.sberbank.ru'],
    ['nalog.ru', 'lkfl2.nalog.ru'],
    ['rt.ru', 'rt.ru'],
    ['rosatom.ru', 'rosatom.ru'],
    ['cbr.ru', 'cbr.ru'],
  ])('блокирует %s', (domain, hostname) => {
    expect(checkKii(domain, hostname).blocked).toBe(true);
  });

  it('ловит госресурс по маркеру в поддомене', () => {
    expect(checkKii('example.ru', 'mvd.example.ru').blocked).toBe(true);
  });

  it('пропускает обычный малый бизнес — иначе сервис бесполезен', () => {
    expect(checkKii('example.ru', 'www.example.ru').blocked).toBe(false);
    expect(checkKii('shop-cvety.ru', 'shop-cvety.ru').blocked).toBe(false);
    // «government» в названии частной фирмы не должен триггерить
    expect(checkKii('mygov-consulting.ru', 'mygov-consulting.ru').blocked).toBe(false);
  });
});

describe('pii: маскировка', () => {
  it('маскирует email', () => {
    expect(maskEmail('john.doe@example.com')).toBe('j***@example.com');
    expect(maskPii('Пишите на ivan@mail.ru прямо сейчас')).toBe(
      'Пишите на i***@mail.ru прямо сейчас',
    );
  });

  it('маскирует телефоны РФ в разных форматах', () => {
    const masked = '+7 *** *** ** **';
    expect(maskPii('+7 999 123-45-67')).toBe(masked);
    expect(maskPii('8(999)1234567')).toBe(masked);
    expect(maskPii('+79991234567')).toBe(masked);
    expect(maskPii('+7.495.123.45.67')).toBe(masked); // точечная запись (аудит 07.2026)
    expect(maskPii('Телефон: 8 999 123 45 67, звоните')).toBe(`Телефон: ${masked}, звоните`);
  });

  // Ключевой кейс: ИНН/ОГРН нужны чекам B3/F1 (сверка с реестром РКН).
  // Если маскировка их съест — сломается основная функциональность.
  it('НЕ трогает ИНН и ОГРН', () => {
    expect(maskPii('ИНН 7712345678')).toBe('ИНН 7712345678');
    expect(maskPii('ИНН 812345678901')).toBe('ИНН 812345678901'); // 12 цифр, начинается с 8
    expect(maskPii('ОГРН 1234567890123')).toBe('ОГРН 1234567890123');
    expect(maskPii('ОГРНИП 312345678901234')).toBe('ОГРНИП 312345678901234');
  });

  it('обрабатывает текст с несколькими находками', () => {
    expect(maskPii('a@b.ru и +7 999 123 45 67 и c@d.com')).toBe(
      'a***@b.ru и +7 *** *** ** ** и c***@d.com',
    );
  });

  it('не ломается на пустой строке', () => {
    expect(maskPii('')).toBe('');
  });
});
