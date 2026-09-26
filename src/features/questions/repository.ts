import { type Question, type QuestionFilterOptions, type RevisionStatus } from './types';
import { vaultStorage } from '../../lib/storage';

export interface IQuestionRepository {
  getAll(): Question[];
  getById(id: string): Question | null;
  save(question: Question): Question;
  delete(id: string): boolean;
  filter(options: QuestionFilterOptions): Question[];
  getRevisionQueue(): Question[];
}

export class LocalQuestionRepository implements IQuestionRepository {
  getAll(): Question[] {
    return vaultStorage.getQuestions();
  }

  getById(id: string): Question | null {
    return this.getAll().find((q) => q.id === id) || null;
  }

  save(question: Question): Question {
    const list = this.getAll();
    const index = list.findIndex((q) => q.id === question.id);
    if (index >= 0) {
      list[index] = question;
    } else {
      list.unshift(question); // newest first
    }
    vaultStorage.saveQuestions(list);
    return question;
  }

  delete(id: string): boolean {
    const list = this.getAll();
    const filtered = list.filter((q) => q.id !== id);
    if (filtered.length !== list.length) {
      vaultStorage.saveQuestions(filtered);
      return true;
    }
    return false;
  }

  filter(options: QuestionFilterOptions): Question[] {
    let list = this.getAll();

    if (options.sheetId) {
      list = list.filter((q) => q.sheetIds.includes(options.sheetId!));
    }

    if (options.moduleId) {
      list = list.filter((q) => q.moduleIds.includes(options.moduleId!));
    }

    if (options.difficulty) {
      list = list.filter((q) => q.difficulty === options.difficulty);
    }

    if (options.status) {
      list = list.filter((q) => q.status === options.status);
    }

    if (options.tag) {
      const lower = options.tag.toLowerCase();
      list = list.filter((q) => q.tags.some((t) => t.toLowerCase() === lower));
    }

    if (options.search && options.search.trim()) {
      const term = options.search.toLowerCase().trim();
      list = list.filter(
        (q) =>
          q.title.toLowerCase().includes(term) ||
          q.tags.some((t) => t.toLowerCase().includes(term)) ||
          q.notes.toLowerCase().includes(term)
      );
    }

    return list;
  }

  getRevisionQueue(): Question[] {
    // All questions marked NEEDS_REVISION, sorted by least-recently-viewed (oldest date or null first)
    return this.getAll()
      .filter((q) => q.status === 'NEEDS_REVISION')
      .sort((a, b) => {
        if (!a.lastViewedAt) return -1;
        if (!b.lastViewedAt) return 1;
        return new Date(a.lastViewedAt).getTime() - new Date(b.lastViewedAt).getTime();
      });
  }
}

export const questionRepository = new LocalQuestionRepository();
