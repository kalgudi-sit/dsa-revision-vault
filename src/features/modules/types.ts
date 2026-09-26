import { z } from 'zod';

export const ModuleSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Module name is required'),
  description: z.string().optional(),
  sheetIds: z.array(z.string()).default([]),
  order: z.number().default(0),
  createdAt: z.string(),
});

export type Module = z.infer<typeof ModuleSchema>;

export const CreateModuleInputSchema = z.object({
  name: z.string().min(1, 'Module name is required'),
  description: z.string().optional(),
  sheetIds: z.array(z.string()).default([]),
});

export type CreateModuleInput = z.infer<typeof CreateModuleInputSchema>;

export const UpdateModuleInputSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Module name is required'),
  description: z.string().optional(),
  sheetIds: z.array(z.string()).optional(),
});

export type UpdateModuleInput = z.infer<typeof UpdateModuleInputSchema>;
