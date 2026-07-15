import {
  pgEnum,
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  serial,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import type { ScanMeta, Evidence } from './types';

// ===== enums =====
export const scanStatus = pgEnum('scan_status', ['queued', 'running', 'done', 'failed']);
export const checkStatus = pgEnum('check_status', ['pass', 'warn', 'fail', 'unable', 'not_applicable']);
export const severity = pgEnum('severity', ['critical', 'major', 'minor']);
export const paymentStatus = pgEnum('payment_status', ['pending', 'succeeded', 'canceled', 'refunded']);

// ===== scans =====
export const scans = pgTable(
  'scans',
  {
    id: uuid('id').primaryKey().defaultRandom(), // = публичная ссылка на отчёт
    url: text('url').notNull(),
    domain: text('domain').notNull(), // eTLD+1, для дедупа
    status: scanStatus('status').notNull().default('queued'),
    score: integer('score'), // 0..100, null пока не done
    isPaid: boolean('is_paid').notNull().default(false),
    email: text('email'), // появляется при оплате
    meta: jsonb('meta').$type<ScanMeta>(),
    error: text('error'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    startedAt: timestamp('started_at'),
    finishedAt: timestamp('finished_at'),
  },
  (t) => [index('idx_scans_domain_created').on(t.domain, t.createdAt)],
);

// ===== check_results =====
export const checkResults = pgTable(
  'check_results',
  {
    id: serial('id').primaryKey(),
    scanId: uuid('scan_id')
      .notNull()
      .references(() => scans.id, { onDelete: 'cascade' }),
    checkId: text('check_id').notNull(),
    status: checkStatus('status').notNull(),
    severity: severity('severity').notNull(),
    evidence: jsonb('evidence').$type<Evidence[]>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('uq_scan_check').on(t.scanId, t.checkId)],
);

// ===== payments (RESTRICT: финансовые записи не удаляем каскадом) =====
export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    scanId: uuid('scan_id')
      .notNull()
      .references(() => scans.id),
    provider: text('provider').notNull().default('yookassa'),
    externalId: text('external_id').notNull(), // id платежа у провайдера
    amount: integer('amount').notNull(), // в копейках: 70000
    status: paymentStatus('status').notNull().default('pending'),
    email: text('email').notNull(),
    receiptUrl: text('receipt_url'),
    raw: jsonb('raw'), // последний webhook как есть
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('uq_payment_external').on(t.provider, t.externalId)],
);

// ===== email_log =====
export const emailLog = pgTable('email_log', {
  id: serial('id').primaryKey(),
  scanId: uuid('scan_id').references(() => scans.id),
  to: text('to').notNull(),
  type: text('type').notNull(), // 'report' | 'payment_failed'
  status: text('status').notNull(), // 'sent' | 'error'
  error: text('error'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ===== inferred TS-типы =====
export type Scan = typeof scans.$inferSelect;
export type NewScan = typeof scans.$inferInsert;
export type CheckResultRow = typeof checkResults.$inferSelect;
export type NewCheckResult = typeof checkResults.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type EmailLogRow = typeof emailLog.$inferSelect;

export type ScanStatus = (typeof scanStatus.enumValues)[number];
export type CheckStatusValue = (typeof checkStatus.enumValues)[number];
export type SeverityValue = (typeof severity.enumValues)[number];
