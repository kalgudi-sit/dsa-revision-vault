import { CreateModuleInputSchema, UpdateModuleInputSchema, type Module, type CreateModuleInput, type UpdateModuleInput } from './types';
import { moduleRepository, type IModuleRepository } from './repository';

export class ModuleService {
  constructor(private repo: IModuleRepository = moduleRepository) {}

  getAllModules(): Module[] {
    return this.repo.getAll();
  }

  getModule(id: string): Module | null {
    return this.repo.getById(id);
  }

  getModulesForSheet(sheetId: string): Module[] {
    return this.repo.getBySheetId(sheetId);
  }

  createModule(input: CreateModuleInput): { success: true; data: Module } | { success: false; error: string } {
    const parsed = CreateModuleInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid module data' };
    }

    const current = this.repo.getAll();
    const newModule: Module = {
      id: `mod-${Date.now()}`,
      name: parsed.data.name.trim(),
      description: parsed.data.description?.trim(),
      sheetIds: parsed.data.sheetIds || [],
      order: current.length,
      createdAt: new Date().toISOString(),
    };

    const saved = this.repo.save(newModule);
    return { success: true, data: saved };
  }

  updateModule(input: UpdateModuleInput): { success: true; data: Module } | { success: false; error: string } {
    const parsed = UpdateModuleInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid module update data' };
    }

    const existing = this.repo.getById(parsed.data.id);
    if (!existing) {
      return { success: false, error: 'Module not found' };
    }

    const updated: Module = {
      ...existing,
      name: parsed.data.name.trim(),
      description: parsed.data.description?.trim(),
      sheetIds: parsed.data.sheetIds ?? existing.sheetIds,
    };

    const saved = this.repo.save(updated);
    return { success: true, data: saved };
  }

  deleteModule(id: string): { success: boolean; error?: string } {
    const ok = this.repo.delete(id);
    if (!ok) {
      return { success: false, error: 'Module not found' };
    }
    return { success: true };
  }
}

export const moduleService = new ModuleService();
