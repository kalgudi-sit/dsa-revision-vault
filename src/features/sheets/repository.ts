import { type Sheet } from './types';
import { vaultStorage } from '../../lib/storage';

export interface ISheetRepository {
  getAll(): Sheet[];
  getById(id: string): Sheet | null;
  save(sheet: Sheet): Sheet;
  delete(id: string): boolean;
  reorder(sheetIds: string[]): Sheet[];
}

export class LocalSheetRepository implements ISheetRepository {
  getAll(): Sheet[] {
    return vaultStorage.getSheets().sort((a, b) => a.order - b.order);
  }

  getById(id: string): Sheet | null {
    const list = this.getAll();
    return list.find((s) => s.id === id) || null;
  }

  save(sheet: Sheet): Sheet {
    const list = this.getAll();
    const index = list.findIndex((s) => s.id === sheet.id);
    if (index >= 0) {
      list[index] = sheet;
    } else {
      list.push(sheet);
    }
    vaultStorage.saveSheets(list);
    return sheet;
  }

  delete(id: string): boolean {
    const list = this.getAll();
    const filtered = list.filter((s) => s.id !== id);
    if (filtered.length !== list.length) {
      vaultStorage.saveSheets(filtered);
      return true;
    }
    return false;
  }

  reorder(sheetIds: string[]): Sheet[] {
    const map = new Map(this.getAll().map((s) => [s.id, s]));
    const reordered: Sheet[] = [];
    sheetIds.forEach((id, idx) => {
      const s = map.get(id);
      if (s) {
        reordered.push({ ...s, order: idx });
      }
    });
    vaultStorage.saveSheets(reordered);
    return reordered;
  }
}

export const sheetRepository = new LocalSheetRepository();
