import { z } from 'zod';

export const SheetSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Sheet name is required'),
  description: z.string().optional(),
  order: z.number().default(0),
  createdAt: z.string(),
});

export type Sheet = z.infer<typeof SheetSchema>;

export const CreateSheetInputSchema = z.object({
  name: z.string().min(1, 'Sheet name is required'),
  description: z.string().optional(),
});

export type CreateSheetInput = z.infer<typeof CreateSheetInputSchema>;

export const UpdateSheetInputSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Sheet name is required'),
  description: z.string().optional(),
});

export type UpdateSheetInput = z.infer<typeof UpdateSheetInputSchema>;
