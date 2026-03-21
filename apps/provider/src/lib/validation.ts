import { z } from 'zod';

/** UUID v4 format validation */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/** Schemas for API route request bodies */
export const schemas = {
  assignModule: z.object({
    module_id: z.string().uuid('module_id must be a valid UUID'),
  }),

  triggerCheckin: z.object({
    patient_id: z.string().uuid('patient_id must be a valid UUID'),
  }),
} as const;
