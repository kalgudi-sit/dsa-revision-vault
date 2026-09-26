import {
  QuickAddQuestionInputSchema,
  UpdateQuestionInputSchema,
  type Question,
  type QuickAddQuestionInput,
  type UpdateQuestionInput,
  type RevisionStatus,
  type QuestionFilterOptions,
} from './types';
import { type CodeBlock, type CreateCodeBlockInput, SUPPORTED_LANGUAGES } from '../code-blocks/types';
import { questionRepository, type IQuestionRepository } from './repository';
import { moduleRepository } from '../modules/repository';

export class QuestionService {
  constructor(private repo: IQuestionRepository = questionRepository) {}

  getAllQuestions(): Question[] {
    return this.repo.getAll();
  }

  getQuestion(id: string): Question | null {
    return this.repo.getById(id);
  }

  filterQuestions(options: QuestionFilterOptions): Question[] {
    return this.repo.filter(options);
  }

  getRevisionQueue(): Question[] {
    return this.repo.getRevisionQueue();
  }

  /**
   * Fast quick-add flow to capture solved questions in under 60 seconds
   */
  quickAdd(input: QuickAddQuestionInput): { success: true; data: Question } | { success: false; error: string } {
    const parsed = QuickAddQuestionInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid input' };
    }

    const now = new Date().toISOString();
    const links: string[] = [];
    if (parsed.data.primaryLink && parsed.data.primaryLink.trim()) {
      links.push(parsed.data.primaryLink.trim());
    }

    const moduleIds: string[] = [];
    const sheetIds: string[] = [];
    if (parsed.data.moduleId) {
      moduleIds.push(parsed.data.moduleId);
      const mod = moduleRepository.getById(parsed.data.moduleId);
      if (mod) {
        mod.sheetIds.forEach((sid) => {
          if (!sheetIds.includes(sid)) sheetIds.push(sid);
        });
      }
    }

    const initialCodeBlocks: CodeBlock[] = [];
    if (parsed.data.initialCode && parsed.data.initialCode.trim() && parsed.data.initialLanguage) {
      initialCodeBlocks.push({
        id: `cb-${Date.now()}`,
        questionId: `q-${Date.now()}`,
        source: 'MY_SOLUTION',
        language: parsed.data.initialLanguage,
        label: 'Initial Solution',
        code: parsed.data.initialCode.trim(),
        order: 0,
        createdAt: now,
      });
    }

    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      title: parsed.data.title.trim(),
      links,
      difficulty: parsed.data.difficulty,
      tags: parsed.data.tags || [],
      status: 'NEEDS_REVISION',
      notes: parsed.data.initialNote ? parsed.data.initialNote.trim() : '',
      moduleIds,
      sheetIds,
      codeBlocks: initialCodeBlocks,
      lastViewedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const saved = this.repo.save(newQuestion);
    return { success: true, data: saved };
  }

  /**
   * Complete multi-page question creation with both My Solution and Optimal Solution
   */
  createFullQuestion(input: {
    title: string;
    links: string[];
    difficulty: any;
    status: any;
    tags: string[];
    notes: string;
    sheetIds: string[];
    moduleIds: string[];
    mySolutionCode: string;
    mySolutionLanguage: any;
    optimalSolutionCode: string;
    optimalSolutionLanguage: any;
  }): { success: true; data: Question } | { success: false; error: string } {
    if (!input.title || !input.title.trim()) {
      return { success: false, error: 'Question title is required.' };
    }

    const now = new Date().toISOString();
    const questionId = `q-${Date.now()}`;
    const codeBlocks: CodeBlock[] = [];

    if (input.mySolutionCode && input.mySolutionCode.trim()) {
      codeBlocks.push({
        id: `cb-${Date.now()}-1`,
        questionId,
        source: 'MY_SOLUTION',
        language: input.mySolutionLanguage || 'JAVA',
        label: 'My Implementation',
        code: input.mySolutionCode.trim(),
        order: 0,
        createdAt: now,
      });
    }

    if (input.optimalSolutionCode && input.optimalSolutionCode.trim()) {
      codeBlocks.push({
        id: `cb-${Date.now()}-2`,
        questionId,
        source: 'INTERNET_SOLUTION',
        language: input.optimalSolutionLanguage || 'CPP',
        label: 'Optimal / Reference Solution',
        code: input.optimalSolutionCode.trim(),
        order: 1,
        createdAt: now,
      });
    }

    const newQuestion: Question = {
      id: questionId,
      title: input.title.trim(),
      links: input.links || [],
      difficulty: input.difficulty || 'MEDIUM',
      tags: input.tags || [],
      status: input.status || 'NEEDS_REVISION',
      notes: input.notes || '',
      moduleIds: input.moduleIds || [],
      sheetIds: input.sheetIds || [],
      codeBlocks,
      lastViewedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const saved = this.repo.save(newQuestion);
    return { success: true, data: saved };
  }

  updateQuestion(input: UpdateQuestionInput): { success: true; data: Question } | { success: false; error: string } {
    const parsed = UpdateQuestionInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid question data' };
    }

    const existing = this.repo.getById(parsed.data.id);
    if (!existing) {
      return { success: false, error: 'Question not found' };
    }

    const updated: Question = {
      ...existing,
      title: parsed.data.title.trim(),
      links: parsed.data.links,
      difficulty: parsed.data.difficulty,
      tags: parsed.data.tags,
      status: parsed.data.status,
      notes: parsed.data.notes,
      moduleIds: parsed.data.moduleIds,
      sheetIds: parsed.data.sheetIds,
      updatedAt: new Date().toISOString(),
    };

    const saved = this.repo.save(updated);
    return { success: true, data: saved };
  }

  recordView(id: string): Question | null {
    const existing = this.repo.getById(id);
    if (!existing) return null;
    const updated: Question = {
      ...existing,
      lastViewedAt: new Date().toISOString(),
    };
    return this.repo.save(updated);
  }

  updateStatus(id: string, status: RevisionStatus): { success: boolean; data?: Question; error?: string } {
    const existing = this.repo.getById(id);
    if (!existing) return { success: false, error: 'Question not found' };
    const updated: Question = {
      ...existing,
      status,
      lastViewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const saved = this.repo.save(updated);
    return { success: true, data: saved };
  }

  updateNotes(id: string, notes: string): { success: boolean; data?: Question; error?: string } {
    const existing = this.repo.getById(id);
    if (!existing) return { success: false, error: 'Question not found' };
    const updated: Question = {
      ...existing,
      notes,
      updatedAt: new Date().toISOString(),
    };
    const saved = this.repo.save(updated);
    return { success: true, data: saved };
  }

  addCodeVersion(input: CreateCodeBlockInput): { success: true; data: CodeBlock } | { success: false; error: string } {
    const existing = this.repo.getById(input.questionId);
    if (!existing) return { success: false, error: 'Question not found' };

    const matchingVersions = existing.codeBlocks.filter(
      (b) => b.source === input.source && b.language === input.language
    );

    const newBlock: CodeBlock = {
      id: `cb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      questionId: input.questionId,
      source: input.source,
      language: input.language,
      label: input.label.trim() || `Version ${matchingVersions.length + 1}`,
      code: input.code || SUPPORTED_LANGUAGES[input.language].defaultBoilerplate,
      order: matchingVersions.length,
      createdAt: new Date().toISOString(),
    };

    const updated: Question = {
      ...existing,
      codeBlocks: [...existing.codeBlocks, newBlock],
      updatedAt: new Date().toISOString(),
    };

    this.repo.save(updated);
    return { success: true, data: newBlock };
  }

  updateCodeBlock(codeBlock: CodeBlock): { success: true; data: CodeBlock } | { success: false; error: string } {
    const existing = this.repo.getById(codeBlock.questionId);
    if (!existing) return { success: false, error: 'Question not found' };

    const updatedBlocks = existing.codeBlocks.map((b) => (b.id === codeBlock.id ? codeBlock : b));
    const updated: Question = {
      ...existing,
      codeBlocks: updatedBlocks,
      updatedAt: new Date().toISOString(),
    };

    this.repo.save(updated);
    return { success: true, data: codeBlock };
  }

  deleteCodeBlock(questionId: string, codeBlockId: string): { success: boolean; error?: string } {
    const existing = this.repo.getById(questionId);
    if (!existing) return { success: false, error: 'Question not found' };

    const filtered = existing.codeBlocks.filter((b) => b.id !== codeBlockId);
    const updated: Question = {
      ...existing,
      codeBlocks: filtered,
      updatedAt: new Date().toISOString(),
    };

    this.repo.save(updated);
    return { success: true };
  }

  deleteQuestion(id: string): { success: boolean; error?: string } {
    const ok = this.repo.delete(id);
    if (!ok) return { success: false, error: 'Question not found' };
    return { success: true };
  }

  getAllTags(): string[] {
    const tagSet = new Set<string>();
    this.repo.getAll().forEach((q) => {
      q.tags.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }
}

export const questionService = new QuestionService();
