import { z } from 'zod';

export const SolutionSourceEnum = z.enum(['MY_SOLUTION', 'INTERNET_SOLUTION']);
export type SolutionSource = z.infer<typeof SolutionSourceEnum>;

export const LanguageEnum = z.enum(['JAVA', 'CPP', 'PYTHON']);
export type Language = z.infer<typeof LanguageEnum>;

export interface LanguageConfig {
  id: Language;
  name: string;
  extension: string;
  defaultBoilerplate: string;
  badgeBg: string;
  badgeText: string;
}

export const SUPPORTED_LANGUAGES: Record<Language, LanguageConfig> = {
  JAVA: {
    id: 'JAVA',
    name: 'Java',
    extension: '.java',
    defaultBoilerplate: `class Solution {\n    public int solve() {\n        // Your implementation here\n        return 0;\n    }\n}`,
    badgeBg: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-900',
    badgeText: 'text-red-600',
  },
  CPP: {
    id: 'CPP',
    name: 'C++',
    extension: '.cpp',
    defaultBoilerplate: `#include <vector>\n#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    int solve() {\n        // Your implementation here\n        return 0;\n    }\n};`,
    badgeBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900',
    badgeText: 'text-blue-600',
  },
  PYTHON: {
    id: 'PYTHON',
    name: 'Python',
    extension: '.py',
    defaultBoilerplate: `class Solution:\n    def solve(self) -> int:\n        # Your implementation here\n        return 0`,
    badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
    badgeText: 'text-emerald-600',
  },
};

export const CodeBlockSchema = z.object({
  id: z.string(),
  questionId: z.string(),
  source: SolutionSourceEnum,
  language: LanguageEnum,
  label: z.string().min(1, 'Label is required'),
  code: z.string(),
  order: z.number().default(0),
  createdAt: z.string(),
});

export type CodeBlock = z.infer<typeof CodeBlockSchema>;

export const CreateCodeBlockInputSchema = z.object({
  questionId: z.string(),
  source: SolutionSourceEnum,
  language: LanguageEnum,
  label: z.string().min(1, 'Label is required'),
  code: z.string(),
});

export type CreateCodeBlockInput = z.infer<typeof CreateCodeBlockInputSchema>;
