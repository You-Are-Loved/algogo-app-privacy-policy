import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TestTemplate } from '../data/testMode';

// User-built mock-interview templates. Built-in presets live in testMode.ts and
// are NOT stored here — this slice only persists what the user creates.
interface TestStoreState {
  templates: TestTemplate[];
  /** Insert or update by id. Stamps updatedAt; sets createdAt on first save. */
  saveTemplate: (template: TestTemplate) => void;
  deleteTemplate: (id: string) => void;
  getTemplate: (id: string) => TestTemplate | undefined;
}

export const useTestStore = create<TestStoreState>()(
  persist(
    (set, get) => ({
      templates: [],

      saveTemplate: (template) => {
        const now = Date.now();
        set((state) => {
          const idx = state.templates.findIndex((t) => t.id === template.id);
          const next: TestTemplate = {
            ...template,
            builtIn: false,
            updatedAt: now,
            createdAt: idx >= 0 ? state.templates[idx].createdAt : now,
          };
          if (idx >= 0) {
            const copy = state.templates.slice();
            copy[idx] = next;
            return { templates: copy };
          }
          return { templates: [next, ...state.templates] };
        });
      },

      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),

      getTemplate: (id) => get().templates.find((t) => t.id === id),
    }),
    {
      name: '@algogo_test_templates',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ templates: state.templates }),
    },
  ),
);
