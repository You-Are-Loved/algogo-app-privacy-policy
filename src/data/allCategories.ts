// Unified category access for all content types
import { Category } from '../types';
import { categories as algorithmCategories } from './categories';
import { systemDesignCategories } from './systemDesignCategories';
import { iosCategories } from './iosCategories';
import { androidCategories } from './androidCategories';
import { webCategories } from './webCategories';
import { backendCategories } from './backendCategories';
import { sqlCategories } from './sqlCategories';

// Content type definition
export type ContentType = 'algorithms' | 'system-design' | 'ios' | 'android' | 'web' | 'backend' | 'sql';

// Get all categories for a specific content type
export const getCategoriesByType = (type: ContentType): Category[] => {
  switch (type) {
    case 'algorithms':
      return algorithmCategories;
    case 'system-design':
      return systemDesignCategories;
    case 'ios':
      return iosCategories as Category[];
    case 'android':
      return androidCategories as Category[];
    case 'web':
      return webCategories as Category[];
    case 'backend':
      return backendCategories as Category[];
    case 'sql':
      return sqlCategories as Category[];
    default:
      return [];
  }
};

// Get all categories across all content types
export const getAllCategories = (): Category[] => {
  return [
    ...algorithmCategories,
    ...systemDesignCategories,
    ...(iosCategories as Category[]),
    ...(androidCategories as Category[]),
    ...(webCategories as Category[]),
    ...(backendCategories as Category[]),
    ...(sqlCategories as Category[]),
  ];
};

// Find a category by slug across all content types
export const getCategoryBySlug = (slug: string): Category | undefined => {
  // Check algorithms first (most common)
  let category = algorithmCategories.find(cat => cat.slug === slug);
  if (category) return category;

  // Check system design
  category = systemDesignCategories.find(cat => cat.slug === slug);
  if (category) return category;

  // Check iOS
  category = (iosCategories as Category[]).find(cat => cat.slug === slug);
  if (category) return category;

  // Check Android
  category = (androidCategories as Category[]).find(cat => cat.slug === slug);
  if (category) return category;

  // Check Web
  category = (webCategories as Category[]).find(cat => cat.slug === slug);
  if (category) return category;

  // Check Backend
  category = (backendCategories as Category[]).find(cat => cat.slug === slug);
  if (category) return category;

  // Check SQL
  category = (sqlCategories as Category[]).find(cat => cat.slug === slug);
  if (category) return category;

  return undefined;
};

// Find a category by ID across all content types
export const getCategoryById = (id: string): Category | undefined => {
  let category = algorithmCategories.find(cat => cat.id === id);
  if (category) return category;

  category = systemDesignCategories.find(cat => cat.id === id);
  if (category) return category;

  category = (iosCategories as Category[]).find(cat => cat.id === id);
  if (category) return category;

  category = (androidCategories as Category[]).find(cat => cat.id === id);
  if (category) return category;

  category = (webCategories as Category[]).find(cat => cat.id === id);
  if (category) return category;

  category = (backendCategories as Category[]).find(cat => cat.id === id);
  if (category) return category;

  category = (sqlCategories as Category[]).find(cat => cat.id === id);
  if (category) return category;

  return undefined;
};

// Determine content type from category ID
export const getContentTypeFromCategoryId = (id: string): ContentType | null => {
  if (algorithmCategories.find(cat => cat.id === id)) return 'algorithms';
  if (systemDesignCategories.find(cat => cat.id === id)) return 'system-design';
  if ((iosCategories as Category[]).find(cat => cat.id === id)) return 'ios';
  if ((androidCategories as Category[]).find(cat => cat.id === id)) return 'android';
  if ((webCategories as Category[]).find(cat => cat.id === id)) return 'web';
  if ((backendCategories as Category[]).find(cat => cat.id === id)) return 'backend';
  if ((sqlCategories as Category[]).find(cat => cat.id === id)) return 'sql';
  return null;
};

// Algorithm categories with built-in animated visualizations in VisualizeTab
const algorithmCategoriesWithAnimatedVisualizations = [
  'sliding-window',
  'two-pointers',
  'fast-slow-pointers',
  'merge-intervals',
  'cyclic-sort',
  'linked-list-reversal',
  'tree-bfs',
  'tree-dfs',
  'two-heaps',
  'subsets',
  'binary-search',
  'top-k-elements',
  'k-way-merge',
  'topological-sort',
  'island-matrix',
  'bitwise-xor',
  'backtracking',
  'knapsack-dp',
  'monotonic-stack',
];

// Check if category has visualizations (algorithm animations OR diagram data)
export const categoryHasVisualizations = (category: Category): boolean => {
  // Algorithm categories have custom animated visualizations
  if (algorithmCategoriesWithAnimatedVisualizations.includes(category.id)) {
    return true;
  }
  // Other categories may have diagram visualizations in their data
  return category.visualizations !== undefined && category.visualizations.length > 0;
};

// Content type metadata for UI
export const contentTypeInfo = {
  algorithms: {
    title: 'Algorithm Patterns',
    subtitle: 'Master 19 essential patterns',
    icon: 'code-slash',
    color: '#8B5CF6', // purple
  },
  'system-design': {
    title: 'System Design',
    subtitle: '7 core concepts',
    icon: 'server',
    color: '#636E72', // gray
  },
  ios: {
    title: 'iOS Development',
    subtitle: '7 Swift & iOS topics',
    icon: 'phone-portrait-outline',
    color: '#FA7343', // orange
  },
  android: {
    title: 'Android Development',
    subtitle: '7 Kotlin & Android topics',
    icon: 'tablet-portrait-outline',
    color: '#3DDC84', // green
  },
  web: {
    title: 'Web Development',
    subtitle: '7 frontend essentials',
    icon: 'globe-outline',
    color: '#61DAFB', // cyan/react blue
  },
  backend: {
    title: 'Backend Development',
    subtitle: '7 server-side topics',
    icon: 'server-outline',
    color: '#2196F3', // blue
  },
  sql: {
    title: 'SQL',
    subtitle: '7 essential SQL topics',
    icon: 'server-outline',
    color: '#336791', // postgres blue
  },
};
