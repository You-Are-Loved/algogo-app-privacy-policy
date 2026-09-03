// CS Fundamentals track — the "what happens under the hood" questions every
// interviewer reaches for regardless of stack. One file per category under
// ./cs so they can be authored and reviewed independently.

import { Category } from '../types';
import { dataStructures } from './cs/dataStructures';
import { complexity } from './cs/complexity';
import { operatingSystems } from './cs/operatingSystems';
import { networking } from './cs/networking';
import { oopDesignPatterns } from './cs/oopDesignPatterns';
import { concurrency } from './cs/concurrency';
import { languagesRuntimes } from './cs/languagesRuntimes';

export const csCategories: Category[] = [
  dataStructures,
  complexity,
  operatingSystems,
  networking,
  oopDesignPatterns,
  concurrency,
  languagesRuntimes,
];
