import { z } from 'zod';

// POST /api/scan (ПС-05 §1). Zod .strict() на каждом входе (CLAUDE.md).
export const scanCreateSchema = z
  .object({
    url: z.string().min(1).max(2048),
    consentPd: z.literal(true),
    consentOwnership: z.literal(true),
    // Фаза 5: серверная верификация SmartCaptcha станет обязательной.
    captchaToken: z.string().max(4096).optional().default(''),
  })
  .strict();

export type ScanCreateInput = z.infer<typeof scanCreateSchema>;
