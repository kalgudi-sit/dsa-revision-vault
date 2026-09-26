import { type Module } from './types';
import { vaultStorage } from '../../lib/storage';

export interface IModuleRepository {
  getAll(): Module[];
  getById(id: string): Module | null;
  getBySheetId(sheetId: string): Module[];
  save(mod: Module): Module;
  delete(id: string): boolean;
  reorder(moduleIds: string[]): Module[];
}

export class LocalModuleRepository implements IModuleRepository {
  getAll(): Module[] {
    return vaultStorage.getModules().sort((a, b) => a.order - b.order);
  }

  getById(id: string): Module | null {
    return this.getAll().find((m) => m.id === id) || null;
  }

  getBySheetId(sheetId: string): Module[] {
    return this.getAll().filter((m) => m.sheetIds.includes(sheetId));
  }

  save(mod: Module): Module {
    const list = this.getAll();
    const index = list.findIndex((m) => m.id === mod.id);
    if (index >= 0) {
      list[index] = mod;
    } else {
      list.push(mod);
    }
    vaultStorage.saveModules(list);
    return mod;
  }

  delete(id: string): boolean {
    const list = this.getAll();
    const filtered = list.filter((m) => m.id !== id);
    if (filtered.length !== list.length) {
      vaultStorage.saveModules(filtered);
      return true;
    }
    return false;
  }

  reorder(moduleIds: string[]): Module[] {
    const map = new Map(this.getAll().map((m) => [m.id, m]));
    const reordered: Module[] = [];
    moduleIds.forEach((id, idx) => {
      const m = map.get(id);
      if (m) {
        reordered.push({ ...m, order: idx });
      }
    });
    vaultStorage.saveModules(reordered);
    return reordered;
  }
}

export const moduleRepository = new LocalModuleRepository();
