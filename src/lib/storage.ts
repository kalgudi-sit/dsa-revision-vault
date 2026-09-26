import { z } from 'zod';
import { SheetSchema, type Sheet } from '../features/sheets/types';
import { ModuleSchema, type Module } from '../features/modules/types';
import { QuestionSchema, type Question } from '../features/questions/types';
import { UserSchema, type User, type PasswordResetToken } from '../features/auth/types';

export const VaultBackupSchema = z.object({
  version: z.number(),
  exportedAt: z.string(),
  user: UserSchema.optional(),
  sheets: z.array(SheetSchema),
  modules: z.array(ModuleSchema),
  questions: z.array(QuestionSchema),
});

export type VaultBackup = z.infer<typeof VaultBackupSchema>;

const STORAGE_KEYS = {
  USER: 'dsa_vault_user_v1',
  AUTH_SESSION: 'dsa_vault_auth_session_v1',
  RESET_TOKENS: 'dsa_vault_reset_tokens_v1',
  SHEETS: 'dsa_vault_sheets_v1',
  MODULES: 'dsa_vault_modules_v1',
  QUESTIONS: 'dsa_vault_questions_v1',
  THEME: 'dsa_vault_theme_v1',
};

// Seed User
export const INITIAL_USER: User = {
  id: 'usr-1',
  name: 'Abhishek Kalgudi',
  email: 'abhishekkalgudi03@gmail.com',
  passwordHash: 'vault2026', // Single-user credential for local vault
  createdAt: '2026-01-01T00:00:00.000Z',
};

// Starter sheets
export const INITIAL_SHEETS: Sheet[] = [
  {
    id: 'sheet-1',
    name: 'Striver TUF & Blind 75 Essentials',
    description: 'High-frequency patterns tested in Tier-1 technical rounds',
    order: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'sheet-2',
    name: 'Target: Big Tech Interview Prep',
    description: 'Advanced data structures and company specific problem vaults',
    order: 1,
    createdAt: '2026-01-05T00:00:00.000Z',
  },
];

// Starter modules
export const INITIAL_MODULES: Module[] = [
  {
    id: 'mod-1',
    name: 'Sliding Window',
    description: 'Dynamic and fixed size windows, subsegment hashing',
    sheetIds: ['sheet-1', 'sheet-2'],
    order: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'mod-2',
    name: 'Two Pointers',
    description: 'Opposite-end and fast-slow pointer paradigms',
    sheetIds: ['sheet-1'],
    order: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'mod-3',
    name: 'Binary Search',
    description: 'Search space reductions, rotated arrays, answer binary search',
    sheetIds: ['sheet-1', 'sheet-2'],
    order: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'mod-4',
    name: 'Graphs - BFS & DFS',
    description: 'Connectivity, topological sort, cycle detection, shortest paths',
    sheetIds: ['sheet-1', 'sheet-2'],
    order: 3,
    createdAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'mod-5',
    name: 'Dynamic Programming on Trees',
    description: 'Subtree aggregations, rerooting, diameter problems',
    sheetIds: ['sheet-2'],
    order: 4,
    createdAt: '2026-01-03T00:00:00.000Z',
  },
];

// Starter questions with rich multi-language code and mistake logs
export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q-1',
    title: 'Longest Substring Without Repeating Characters',
    links: [
      'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
      'https://takeuforward.org/data-structure/length-of-longest-substring-without-any-repeating-character/'
    ],
    difficulty: 'MEDIUM',
    tags: ['sliding-window', 'hash-map', 'two-pointers', 'amazon', 'google'],
    status: 'NEEDS_REVISION',
    notes: `### Core Approach
Maintain an expandable window $[\\text{left}, \\text{right}]$. Use a direct index array or hash map storing each character's most recent 1-based or 0-based index. When character $c = s[\\text{right}]$ is already present inside the active window, immediately shift $\\text{left} = \\max(\\text{left}, \\text{lastIndex}[c] + 1)$.

### Mistake Log & Gotchas
- **Critical Bug on 1st Attempt**: Wrote \`left = lastIndex[c] + 1\` without \`Math.max\`. If the duplicate character was seen prior to current window start \`left\`, left pointer jumps *backwards*, completely breaking window validity!
- **Edge Case**: Single character string \`"a"\` or all unique \`"abcdef"\` must output correct string length without off-by-one.

### Complexities
- **Time**: $O(N)$ single pass with $O(1)$ lookup.
- **Space**: $O(\\min(M, N))$ where $M$ is charset size (128 for standard ASCII).`,
    moduleIds: ['mod-1'],
    sheetIds: ['sheet-1', 'sheet-2'],
    lastViewedAt: '2026-09-10T14:30:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-09-10T14:30:00.000Z',
    codeBlocks: [
      {
        id: 'cb-1',
        questionId: 'q-1',
        source: 'MY_SOLUTION',
        language: 'JAVA',
        label: 'Optimized Hash Map O(N)',
        code: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        if (s == null || s.isEmpty()) return 0;
        
        int[] lastIndex = new int[128];
        java.util.Arrays.fill(lastIndex, -1);
        
        int maxLength = 0;
        int left = 0;
        
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            // Must take max to ensure left never moves backwards!
            if (lastIndex[c] >= left) {
                left = lastIndex[c] + 1;
            }
            lastIndex[c] = right;
            maxLength = Math.max(maxLength, right - left + 1);
        }
        
        return maxLength;
    }
}`,
        order: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'cb-2',
        questionId: 'q-1',
        source: 'MY_SOLUTION',
        language: 'PYTHON',
        label: 'Dict Index Window',
        code: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        char_map = {}
        left = 0
        max_len = 0
        
        for right, char in enumerate(s):
            if char in char_map and char_map[char] >= left:
                left = char_map[char] + 1
            char_map[char] = right
            max_len = max(max_len, right - left + 1)
            
        return max_len`,
        order: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'cb-3',
        questionId: 'q-1',
        source: 'INTERNET_SOLUTION',
        language: 'CPP',
        label: 'TUF Direct ASCII Map',
        code: `#include <vector>
#include <string>
#include <algorithm>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        vector<int> mpp(256, -1);
        int left = 0, right = 0;
        int n = s.size();
        int len = 0;
        
        while (right < n) {
            if (mpp[s[right]] != -1) {
                left = max(mpp[s[right]] + 1, left);
            }
            mpp[s[right]] = right;
            len = max(len, right - left + 1);
            right++;
        }
        return len;
    }
};`,
        order: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'q-2',
    title: 'Trapping Rain Water',
    links: [
      'https://leetcode.com/problems/trapping-rain-water/',
      'https://youtu.be/m18Hntz4go8'
    ],
    difficulty: 'HARD',
    tags: ['two-pointers', 'dynamic-programming', 'stack', 'google', 'meta'],
    status: 'CONFIDENT',
    notes: `### Core Approach
Two pointers \`left = 0\` and \`right = n - 1\`. Maintain \`leftMax\` and \`rightMax\`.
At each iteration, compare \`height[left]\` and \`height[right]\`:
- If \`height[left] <= height[right]\`, we know that the water level above \`left\` is bounded by \`leftMax\` because there exists a right boundary that is at least as tall as \`leftMax\`. Hence, compute water: \`ans += max(0, leftMax - height[left])\` and increment \`left\`.
- Else, symmetrically process \`right\`.

### Mistake Log & Gotchas
- Initially tried storing arrays for \`prefixMax\` and \`suffixMax\` ($O(N)$ memory). Two-pointer reduces auxiliary space to strictly $O(1)$.
- Beware: array size $< 3$ cannot trap any water.`,
    moduleIds: ['mod-2'],
    sheetIds: ['sheet-1'],
    lastViewedAt: '2026-09-24T18:15:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-09-24T18:15:00.000Z',
    codeBlocks: [
      {
        id: 'cb-4',
        questionId: 'q-2',
        source: 'MY_SOLUTION',
        language: 'JAVA',
        label: 'Two Pointers O(1) Space',
        code: `class Solution {
    public int trap(int[] height) {
        if (height == null || height.length < 3) return 0;
        
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0;
        int totalWater = 0;
        
        while (left <= right) {
            if (height[left] <= height[right]) {
                if (height[left] >= leftMax) {
                    leftMax = height[left];
                } else {
                    totalWater += leftMax - height[left];
                }
                left++;
            } else {
                if (height[right] >= rightMax) {
                    rightMax = height[right];
                } else {
                    totalWater += rightMax - height[right];
                }
                right--;
            }
        }
        
        return totalWater;
    }
}`,
        order: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'cb-5',
        questionId: 'q-2',
        source: 'MY_SOLUTION',
        language: 'CPP',
        label: 'Optimal Two Pointers',
        code: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size();
        int left = 0, right = n - 1;
        int res = 0;
        int maxLeft = 0, maxRight = 0;
        
        while (left <= right) {
            if (height[left] <= height[right]) {
                if (height[left] >= maxLeft) maxLeft = height[left];
                else res += maxLeft - height[left];
                left++;
            } else {
                if (height[right] >= maxRight) maxRight = height[right];
                else res += maxRight - height[right];
                right--;
            }
        }
        return res;
    }
};`,
        order: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'q-3',
    title: 'Search in Rotated Sorted Array',
    links: [
      'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    ],
    difficulty: 'MEDIUM',
    tags: ['binary-search', 'rotated-array', 'microsoft', 'amazon'],
    status: 'NEEDS_REVISION',
    notes: `### Core Approach
Standard Binary Search with a twist: in a rotated sorted array with unique elements, at least one half of $[\\text{low}, \\text{mid}]$ or $[\\text{mid}, \\text{high}]$ is strictly sorted at all times.
1. Compute \`mid = low + (high - low) / 2\`.
2. If \`nums[mid] == target\`, return \`mid\`.
3. Check if Left Half is sorted: \`nums[low] <= nums[mid]\`:
   - If \`target >= nums[low] && target < nums[mid]\`, search left (\`high = mid - 1\`).
   - Otherwise, search right (\`low = mid + 1\`).
4. Else, Right Half is sorted (\`nums[mid] < nums[high]\`):
   - If \`target > nums[mid] && target <= nums[high]\`, search right (\`low = mid + 1\`).
   - Otherwise, search left (\`high = mid - 1\`).

### Mistake Log & Gotchas
- Used \`nums[low] < nums[mid]\` instead of \`<=\`, failing when \`low == mid\` (e.g. 2 elements array like \`[3, 1]\`).`,
    moduleIds: ['mod-3'],
    sheetIds: ['sheet-1', 'sheet-2'],
    lastViewedAt: '2026-08-15T09:00:00.000Z',
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-08-15T09:00:00.000Z',
    codeBlocks: [
      {
        id: 'cb-6',
        questionId: 'q-3',
        source: 'MY_SOLUTION',
        language: 'PYTHON',
        label: 'Clean Log(N) Binary Search',
        code: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        low, high = 0, len(nums) - 1
        
        while low <= high:
            mid = (low + high) // 2
            if nums[mid] == target:
                return mid
                
            # Check if left half is sorted
            if nums[low] <= nums[mid]:
                if nums[low] <= target < nums[mid]:
                    high = mid - 1
                else:
                    low = mid + 1
            # Otherwise right half is guaranteed sorted
            else:
                if nums[mid] < target <= nums[high]:
                    low = mid + 1
                else:
                    high = mid - 1
                    
        return -1`,
        order: 0,
        createdAt: '2026-01-02T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'q-4',
    title: 'Number of Islands',
    links: [
      'https://leetcode.com/problems/number-of-islands/',
      'https://youtu.be/muncqlKJrH0'
    ],
    difficulty: 'MEDIUM',
    tags: ['graphs', 'bfs', 'dfs', 'matrix', 'flood-fill', 'amazon'],
    status: 'CONFIDENT',
    notes: `### Core Approach
Iterate every cell $(r, c)$ in the $M \\times N$ grid. When cell is \`'1'\`, increment islands counter and trigger DFS or BFS flood-fill to sink all connected land cells by flipping them to \`'0'\` (or marked as visited).

### Mistake Log & Gotchas
- When writing BFS with a queue: **must mark cell visited immediately before pushing to queue**, NOT when popping from queue! Otherwise, adjacent cells enqueue the same node multiple times leading to exponential queue explosion and Memory Limit Exceeded / TLE.`,
    moduleIds: ['mod-4'],
    sheetIds: ['sheet-1', 'sheet-2'],
    lastViewedAt: '2026-09-22T10:00:00.000Z',
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-09-22T10:00:00.000Z',
    codeBlocks: [
      {
        id: 'cb-7',
        questionId: 'q-4',
        source: 'MY_SOLUTION',
        language: 'JAVA',
        label: 'In-Place DFS Sink',
        code: `class Solution {
    public int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) return 0;
        int count = 0;
        
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[0].length; c++) {
                if (grid[r][c] == '1') {
                    count++;
                    dfs(grid, r, c);
                }
            }
        }
        return count;
    }
    
    private void dfs(char[][] grid, int r, int c) {
        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] != '1') {
            return;
        }
        grid[r][c] = '0'; // sink visited land
        dfs(grid, r + 1, c);
        dfs(grid, r - 1, c);
        dfs(grid, r, c + 1);
        dfs(grid, r, c - 1);
    }
}`,
        order: 0,
        createdAt: '2026-01-02T00:00:00.000Z',
      },
    ],
  },
];

class VaultStorageManager {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  // --- User & Auth ---
  getUser(): User {
    if (!this.isBrowser()) return INITIAL_USER;
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) {
      this.setUser(INITIAL_USER);
      return INITIAL_USER;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USER;
    }
  }

  setUser(user: User): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }

  getAuthSession(): { email: string; token: string } | null {
    if (!this.isBrowser()) return { email: INITIAL_USER.email, token: 'mock-session-init' };
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) {
      // Default to logged-in session for seamless single-user UX
      const defaultSession = { email: INITIAL_USER.email, token: 'session-authed' };
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(defaultSession));
      return defaultSession;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  setAuthSession(session: { email: string; token: string } | null): void {
    if (this.isBrowser()) {
      if (session) {
        localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      }
    }
  }

  getResetTokens(): PasswordResetToken[] {
    if (!this.isBrowser()) return [];
    const raw = localStorage.getItem(STORAGE_KEYS.RESET_TOKENS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  saveResetToken(token: PasswordResetToken): void {
    const list = this.getResetTokens();
    list.push(token);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.RESET_TOKENS, JSON.stringify(list));
    }
  }

  markTokenUsed(tokenId: string): void {
    const list = this.getResetTokens().map(t =>
      t.id === tokenId ? { ...t, usedAt: new Date().toISOString() } : t
    );
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.RESET_TOKENS, JSON.stringify(list));
    }
  }

  // --- Sheets ---
  getSheets(): Sheet[] {
    if (!this.isBrowser()) return INITIAL_SHEETS;
    const raw = localStorage.getItem(STORAGE_KEYS.SHEETS);
    if (!raw) {
      this.saveSheets(INITIAL_SHEETS);
      return INITIAL_SHEETS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SHEETS;
    } catch {
      return INITIAL_SHEETS;
    }
  }

  saveSheets(sheets: Sheet[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.SHEETS, JSON.stringify(sheets));
    }
  }

  // --- Modules ---
  getModules(): Module[] {
    if (!this.isBrowser()) return INITIAL_MODULES;
    const raw = localStorage.getItem(STORAGE_KEYS.MODULES);
    if (!raw) {
      this.saveModules(INITIAL_MODULES);
      return INITIAL_MODULES;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_MODULES;
    } catch {
      return INITIAL_MODULES;
    }
  }

  saveModules(modules: Module[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(modules));
    }
  }

  // --- Questions ---
  getQuestions(): Question[] {
    if (!this.isBrowser()) return INITIAL_QUESTIONS;
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (!raw) {
      this.saveQuestions(INITIAL_QUESTIONS);
      return INITIAL_QUESTIONS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_QUESTIONS;
    } catch {
      return INITIAL_QUESTIONS;
    }
  }

  saveQuestions(questions: Question[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    }
  }

  // --- Theme ---
  getTheme(): 'light' | 'dark' {
    if (!this.isBrowser()) return 'dark';
    return (localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark') || 'dark';
  }

  setTheme(theme: 'light' | 'dark'): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  // --- Export & Import ---
  exportBackup(): VaultBackup {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      user: this.getUser(),
      sheets: this.getSheets(),
      modules: this.getModules(),
      questions: this.getQuestions(),
    };
  }

  importBackup(backupData: unknown): { success: boolean; error?: string } {
    try {
      const parsed = VaultBackupSchema.safeParse(backupData);
      if (!parsed.success) {
        return {
          success: false,
          error: `Invalid backup schema: ${parsed.error.issues.map((e) => e.message).join(', ')}`,
        };
      }

      this.saveSheets(parsed.data.sheets);
      this.saveModules(parsed.data.modules);
      this.saveQuestions(parsed.data.questions);
      if (parsed.data.user) {
        this.setUser(parsed.data.user);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown import error' };
    }
  }

  resetToInitialSample(): void {
    this.saveSheets(INITIAL_SHEETS);
    this.saveModules(INITIAL_MODULES);
    this.saveQuestions(INITIAL_QUESTIONS);
    this.setUser(INITIAL_USER);
  }
}

export const vaultStorage = new VaultStorageManager();
