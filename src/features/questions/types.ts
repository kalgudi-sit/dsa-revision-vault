import { z } from 'zod';
import { CodeBlockSchema, type CodeBlock } from '../code-blocks/types';

export const DifficultyEnum = z.enum(['EASY', 'MEDIUM', 'HARD']);
export type Difficulty = z.infer<typeof DifficultyEnum>;

export const RevisionStatusEnum = z.enum(['NOT_REVISED', 'NEEDS_REVISION', 'CONFIDENT']);
export type RevisionStatus = z.infer<typeof RevisionStatusEnum>;

export const QuestionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  links: z.array(z.string().url('Must be a valid URL')).default([]),
  difficulty: DifficultyEnum.default('MEDIUM'),
  tags: z.array(z.string()).default([]),
  status: RevisionStatusEnum.default('NOT_REVISED'),
  notes: z.string().default(''),
  moduleIds: z.array(z.string()).default([]),
  sheetIds: z.array(z.string()).default([]),
  codeBlocks: z.array(CodeBlockSchema).default([]),
  lastViewedAt: z.string().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Question = z.infer<typeof QuestionSchema>;

export const QuickAddQuestionInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  primaryLink: z.string().optional(),
  difficulty: DifficultyEnum.default('MEDIUM'),
  moduleId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  initialCode: z.string().optional(),
  initialLanguage: z.enum(['JAVA', 'CPP', 'PYTHON']).optional(),
  initialNote: z.string().optional(),
});

export type QuickAddQuestionInput = z.infer<typeof QuickAddQuestionInputSchema>;

export const UpdateQuestionInputSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  links: z.array(z.string()).default([]),
  difficulty: DifficultyEnum,
  tags: z.array(z.string()).default([]),
  status: RevisionStatusEnum,
  notes: z.string().default(''),
  moduleIds: z.array(z.string()).default([]),
  sheetIds: z.array(z.string()).default([]),
});

export type UpdateQuestionInput = z.infer<typeof UpdateQuestionInputSchema>;

export type QuestionFilterOptions = {
  sheetId?: string;
  moduleId?: string;
  difficulty?: Difficulty;
  status?: RevisionStatus;
  tag?: string;
  search?: string;
};
