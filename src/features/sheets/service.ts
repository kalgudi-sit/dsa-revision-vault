import { CreateSheetInputSchema, UpdateSheetInputSchema, type Sheet, type CreateSheetInput, type UpdateSheetInput } from './types';
import { sheetRepository, type ISheetRepository } from './repository';

export class SheetService {
  constructor(private repo: ISheetRepository = sheetRepository) {}

  getAllSheets(): Sheet[] {
    return this.repo.getAll();
  }

  getSheet(id: string): Sheet | null {
    return this.repo.getById(id);
  }

  createSheet(input: CreateSheetInput): { success: true; data: Sheet } | { success: false; error: string } {
    const parsed = CreateSheetInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid sheet data' };
    }

    const current = this.repo.getAll();
    const newSheet: Sheet = {
      id: `sheet-${Date.now()}`,
      name: parsed.data.name.trim(),
      description: parsed.data.description?.trim(),
      order: current.length,
      createdAt: new Date().toISOString(),
    };

    const saved = this.repo.save(newSheet);
    return { success: true, data: saved };
  }

  updateSheet(input: UpdateSheetInput): { success: true; data: Sheet } | { success: false; error: string } {
    const parsed = UpdateSheetInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid sheet update data' };
    }

    const existing = this.repo.getById(parsed.data.id);
    if (!existing) {
      return { success: false, error: 'Sheet not found' };
    }

    const updated: Sheet = {
      ...existing,
      name: parsed.data.name.trim(),
      description: parsed.data.description?.trim(),
    };

    const saved = this.repo.save(updated);
    return { success: true, data: saved };
  }

  deleteSheet(id: string): { success: boolean; error?: string } {
    const ok = this.repo.delete(id);
    if (!ok) {
      return { success: false, error: 'Sheet not found or could not be deleted' };
    }
    return { success: true };
  }
}

export const sheetService = new SheetService();
