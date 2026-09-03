import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TestTemplate, withAllSections } from '../data/testMode';

// User-built mock-interview templates. Built-in presets live in testMode.ts and
// are NOT stored here — this slice only persists what the user creates.
interface TestStoreState {
  templates: TestTemplate[];
  /** True once the free sample interview has been started — it's one-shot. */
  sampleUsed: boolean;
  markSampleUsed: () => void;
  /** Insert or update by id. Stamps updatedAt; sets createdAt on first save. */
  saveTemplate: (template: TestTemplate) => void;
  deleteTemplate: (id: string) => void;
  getTemplate: (id: string) => TestTemplate | undefined;
}

export const useTestStore = create<TestStoreState>()(
  persist(
    (set, get) => ({
      templates: [],
      sampleUsed: false,
      markSampleUsed: () => set({ sampleUsed: true }),

      saveTemplate: (template) => {
        const now = Date.now();
        set((state) => {
          const idx = state.templates.findIndex((t) => t.id === template.id);
          const next: TestTemplate = {
            ...withAllSections(template),
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
      // v2 (2.4): the single "bug-fix" section became per-language sections
      // (python / javascript / java) plus sql. Normalize anything persisted
      // by older builds so SECTION_META lookups never see a stale kind.
      version: 2,
      migrate: (persisted: any) => ({
        ...persisted,
        templates: Array.isArray(persisted?.templates)
          ? persisted.templates.map((t: TestTemplate) => withAllSections(t))
          : [],
      }),
      partialize: (state) => ({
        templates: state.templates,
        sampleUsed: state.sampleUsed,
      }),
    },
  ),
);
